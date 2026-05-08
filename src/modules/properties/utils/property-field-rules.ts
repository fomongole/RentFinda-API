/**
 * property-field-rules.ts
 *
 * Single source of truth for which fields are applicable per PropertyType.
 * Backend uses it to strip inapplicable fields before persisting.
 * Frontend uses it to conditionally show/hide form fields.
 *
 * IMPORTANT: Keep this file in sync between backend and frontend.
 * Backend: src/modules/properties/utils/property-field-rules.ts
 * Frontend: src/lib/property-field-rules.ts
 */

import { PropertyType } from '../enums/property-type.enum';
import { BillingCycle } from '../enums/billing-cycle.enum';

export interface PropertyFieldConfig {
  showBedrooms: boolean;
  showBathrooms: boolean;
  showParking: boolean;
  showFloor: boolean;
  showFurnishing: boolean;
  /** Whether a billingCycle must be set at the property level */
  showBillingCycle: boolean;
  /** Which billing cycles are valid for this type */
  allowedBillingCycles: BillingCycle[];
  showSecurityDeposit: boolean;
  /** Only true for RESIDENTIAL_HOUSE — admin picks SINGLE or DOUBLE */
  showResidentialSubtype: boolean;
  /** Sub-units are managed via the HostelRooms module */
  isHostel: boolean;
  /** Supports DAILY billing; checkout date required for daily bookings */
  isHotelLodge: boolean;
}

export const PROPERTY_FIELD_CONFIG: Record<PropertyType, PropertyFieldConfig> = {
  [PropertyType.RESIDENTIAL_HOUSE]: {
    showBedrooms: false,            // implied by residentialSubtype (SINGLE/DOUBLE)
    showBathrooms: true,
    showParking: true,
    showFloor: false,               // houses are ground-level
    showFurnishing: true,
    showBillingCycle: true,
    allowedBillingCycles: [
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit: true,
    showResidentialSubtype: true,
    isHostel: false,
    isHotelLodge: false,
  },

  [PropertyType.APARTMENT]: {
    showBedrooms: true,
    showBathrooms: true,
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showBillingCycle: true,
    allowedBillingCycles: [
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit: true,
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: false,
  },

  [PropertyType.AIRBNB]: {
    showBedrooms: true,
    showBathrooms: true,
    showParking: true,
    showFloor: true,
    showFurnishing: true,           // AirBnBs are typically furnished
    showBillingCycle: true,
    allowedBillingCycles: [
      BillingCycle.DAILY,           // AirBnBs can be daily like hotels
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit: true,
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: false,            // AirBnB has same daily booking logic but is not a lodge
  },

  [PropertyType.OFFICE_SPACE]: {
    showBedrooms: false,
    showBathrooms: false,           // shared facilities
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showBillingCycle: true,
    allowedBillingCycles: [
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit: true,
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: false,
  },

  [PropertyType.BUSINESS_SPACE]: {
    showBedrooms: false,
    showBathrooms: false,
    showParking: true,
    showFloor: true,
    showFurnishing: false,          // commercial spaces are rarely furnished
    showBillingCycle: true,
    allowedBillingCycles: [
      BillingCycle.MONTHLY,
      BillingCycle.QUARTERLY,
      BillingCycle.BIANNUAL,
      BillingCycle.ANNUAL,
    ],
    showSecurityDeposit: true,
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: false,
  },

  [PropertyType.HOSTEL]: {
    showBedrooms: false,            // rooms managed via HostelRoom entity
    showBathrooms: false,           // per-room
    showParking: true,
    showFloor: false,               // per-room
    showFurnishing: false,          // per-room
    showBillingCycle: false,        // billingCycle lives on HostelRoom, not the property
    allowedBillingCycles: [],       // N/A at property level
    showSecurityDeposit: false,     // per-room booking
    showResidentialSubtype: false,
    isHostel: true,
    isHotelLodge: false,
  },

  [PropertyType.HOTEL_LODGE]: {
    showBedrooms: true,
    showBathrooms: true,
    showParking: true,
    showFloor: false,
    showFurnishing: true,           // hotel rooms are always furnished
    showBillingCycle: true,
    allowedBillingCycles: [
      BillingCycle.DAILY,
      BillingCycle.MONTHLY,
    ],
    showSecurityDeposit: false,     // not standard for hotels/lodges
    showResidentialSubtype: false,
    isHostel: false,
    isHotelLodge: true,
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

  if (!config.showBedrooms)           delete result.bedrooms;
  if (!config.showBathrooms)          delete result.bathrooms;
  if (!config.showParking)            delete result.parkingAvailable;
  if (!config.showFloor)              delete result.floor;
  if (!config.showFurnishing)         delete result.furnishing;
  if (!config.showBillingCycle)       delete result.billingCycle;
  if (!config.showSecurityDeposit)    delete result.securityDeposit;
  if (!config.showResidentialSubtype) delete result.residentialSubtype;

  return result;
}

/**
 * Validates that the supplied billingCycle is allowed for the property type.
 * Throws a descriptive string (caller wraps in BadRequestException).
 */
export function validateBillingCycle(
  type: PropertyType,
  billingCycle: BillingCycle | undefined,
): string | null {
  const config = PROPERTY_FIELD_CONFIG[type];

  if (!config.showBillingCycle) return null; // not applicable (e.g. HOSTEL)

  if (!billingCycle) {
    return `billingCycle is required for property type ${type}.`;
  }

  if (!config.allowedBillingCycles.includes(billingCycle)) {
    return (
      `billingCycle "${billingCycle}" is not valid for ${type}. ` +
      `Allowed values: ${config.allowedBillingCycles.join(', ')}.`
    );
  }

  return null; // valid
}