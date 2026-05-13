/**
 * property-field-rules.ts
 *
 * Single source of truth for which fields are applicable per PropertyType.
 * Backend uses it to strip inapplicable fields before persisting.
 * Frontend uses it to conditionally show/hide form fields.
 *
 * This file is in sync between backend and frontend.
 * Backend:  src/modules/properties/utils/property-field-rules.ts
 * Frontend: src/lib/property-field-rules.ts
 */
import { PropertyType } from '../enums/property-type.enum';
import { BillingCycle } from '../enums/billing-cycle.enum';

export interface PropertyFieldConfig {
  /**
   * Unified room count field (replaces the old bedrooms + bathrooms pair).
   * False for HOSTEL — rooms are managed as individual HostelRoom entities.
   */
  showNumberOfRooms: boolean;
  showParking: boolean;
  showFloor: boolean;
  showFurnishing: boolean;

  /** Whether a billingCycle must be set at the property level */
  showBillingCycle: boolean;

  /** Which billing cycles are valid for this type */
  allowedBillingCycles: BillingCycle[];

  showSecurityDeposit: boolean;

  /** Sub-units are managed via the HostelRooms module */
  isHostel: boolean;

  /** Supports DAILY billing; checkout date required for daily bookings */
  isHotelLodge: boolean;

  /**
   * HOSTEL only: total room capacity (cap for HostelRoom entries).
   */
  showTotalRooms: boolean;

  /**
   * HOTEL_LODGE only: service-tier category (ORDINARY | VIP | VVIP).
   */
  showHotelCategory: boolean;

  /**
   * HOSTEL only: the nearby university this hostel primarily serves.
   * Enables "find hostels near Kyambogo" filtering.
   */
  showUniversity: boolean;

  /**
   * HOSTEL only: admin-entered walking distance to the linked university (km).
   * Only relevant when showUniversity is true.
   */
  showApproximateDistanceKm: boolean;
}

export const PROPERTY_FIELD_CONFIG: Record<PropertyType, PropertyFieldConfig> = {
  [PropertyType.RESIDENTIAL_HOUSE]: {
    showNumberOfRooms:        true,
    showParking:              true,
    showFloor:                false,
    showFurnishing:           true,
    showBillingCycle:         true,
    allowedBillingCycles: [
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit:      true,
    isHostel:                 false,
    isHotelLodge:             false,
    showTotalRooms:           false,
    showHotelCategory:        false,
    showUniversity:           false,
    showApproximateDistanceKm: false,
  },
  [PropertyType.APARTMENT]: {
    showNumberOfRooms:        true,
    showParking:              true,
    showFloor:                true,
    showFurnishing:           true,
    showBillingCycle:         true,
    allowedBillingCycles: [
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit:      true,
    isHostel:                 false,
    isHotelLodge:             false,
    showTotalRooms:           false,
    showHotelCategory:        false,
    showUniversity:           false,
    showApproximateDistanceKm: false,
  },
  [PropertyType.AIRBNB]: {
    showNumberOfRooms:        true,
    showParking:              true,
    showFloor:                true,
    showFurnishing:           true,
    showBillingCycle:         true,
    allowedBillingCycles: [
      BillingCycle.DAILY,
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit:      true,
    isHostel:                 false,
    isHotelLodge:             false,
    showTotalRooms:           false,
    showHotelCategory:        false,
    showUniversity:           false,
    showApproximateDistanceKm: false,
  },
  [PropertyType.OFFICE_SPACE]: {
    showNumberOfRooms:        true,
    showParking:              true,
    showFloor:                true,
    showFurnishing:           true,
    showBillingCycle:         true,
    allowedBillingCycles: [
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit:      true,
    isHostel:                 false,
    isHotelLodge:             false,
    showTotalRooms:           false,
    showHotelCategory:        false,
    showUniversity:           false,
    showApproximateDistanceKm: false,
  },
  [PropertyType.BUSINESS_SPACE]: {
    showNumberOfRooms:        true,
    showParking:              true,
    showFloor:                true,
    showFurnishing:           false,
    showBillingCycle:         true,
    allowedBillingCycles: [
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit:      true,
    isHostel:                 false,
    isHotelLodge:             false,
    showTotalRooms:           false,
    showHotelCategory:        false,
    showUniversity:           false,
    showApproximateDistanceKm: false,
  },
  [PropertyType.HOSTEL]: {
    showNumberOfRooms:        false,
    showParking:              true,
    showFloor:                true,
    showFurnishing:           false,
    showBillingCycle:         false,
    allowedBillingCycles:     [],
    showSecurityDeposit:      false,
    isHostel:                 true,
    isHotelLodge:             false,
    showTotalRooms:           true,
    showHotelCategory:        false,
    showUniversity:           true,   // ← hostel can be linked to a nearby university
    showApproximateDistanceKm: true,  // ← walking distance to that university
  },
  [PropertyType.HOTEL_LODGE]: {
    showNumberOfRooms:        true,
    showParking:              true,
    showFloor:                true,
    showFurnishing:           true,
    showBillingCycle:         true,
    allowedBillingCycles: [
      BillingCycle.DAILY,
      BillingCycle.MONTHLY,
    ],
    showSecurityDeposit:      false,
    isHostel:                 false,
    isHotelLodge:             true,
    showTotalRooms:           false,
    showHotelCategory:        true,
    showUniversity:           false,
    showApproximateDistanceKm: false,
  },
};

/**
 * Strips fields that are not applicable for the given property type.
 * Called in service layer before create/update to ensure data integrity
 * regardless of what the client sends.
 */
export function stripInapplicableFields<T extends Record<string, unknown>>(
  data: T,
  type: PropertyType,
): T {
  const config = PROPERTY_FIELD_CONFIG[type];
  if (!config) return data;

  const result = { ...data };

  if (!config.showNumberOfRooms)        delete result.numberOfRooms;
  if (!config.showParking)              delete result.parkingAvailable;
  if (!config.showFloor)                delete result.floor;
  if (!config.showFurnishing)           delete result.furnishing;
  if (!config.showBillingCycle)         delete result.billingCycle;
  if (!config.showSecurityDeposit)      delete result.securityDeposit;
  if (!config.showTotalRooms)           delete result.totalRooms;
  if (!config.showHotelCategory)        delete result.hotelCategory;
  if (!config.showUniversity)           delete result.universityId;
  if (!config.showApproximateDistanceKm) delete result.approximateDistanceKm;

  return result;
}

/**
 * Validates that the supplied billingCycle is allowed for the property type.
 * Returns a descriptive error string, or null if valid.
 */
export function validateBillingCycle(
  type: PropertyType,
  billingCycle: BillingCycle | undefined,
): string | null {
  const config = PROPERTY_FIELD_CONFIG[type];

  if (!config.showBillingCycle) return null;

  if (!billingCycle) {
    return `billingCycle is required for property type ${type}.`;
  }

  if (!config.allowedBillingCycles.includes(billingCycle)) {
    return (
      `billingCycle "${billingCycle}" is not valid for ${type}. ` +
      `Allowed values: ${config.allowedBillingCycles.join(', ')}.`
    );
  }

  return null;
}