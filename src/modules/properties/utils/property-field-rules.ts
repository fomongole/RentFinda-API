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

export interface PropertyFieldConfig {
  showBedrooms: boolean;
  showBathrooms: boolean;
  showParking: boolean;
  showFloor: boolean;
  showFurnishing: boolean;
  showLeaseTerm: boolean;
  showSecurityDeposit: boolean;
  /** If true, this property manages individual rooms via the HostelRooms module */
  isHostel: boolean;
}

export const PROPERTY_FIELD_CONFIG: Record<PropertyType, PropertyFieldConfig> = {
  [PropertyType.SINGLE_ROOM]: {
    showBedrooms: false,       // it IS the room — implied 1
    showBathrooms: false,      // typically shared facilities
    showParking: false,        // not applicable for room rentals
    showFloor: true,
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  [PropertyType.DOUBLE_ROOM]: {
    showBedrooms: false,       // implied 2-room layout
    showBathrooms: false,      // typically shared
    showParking: false,
    showFloor: true,
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  [PropertyType.STUDIO]: {
    showBedrooms: false,       // open-plan by definition
    showBathrooms: true,       // self-contained, has own bathroom
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  [PropertyType.APARTMENT]: {
    showBedrooms: true,
    showBathrooms: true,
    showParking: true,
    showFloor: true,
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  [PropertyType.HOUSE]: {
    showBedrooms: true,
    showBathrooms: true,
    showParking: true,
    showFloor: false,          // houses are ground-level by default
    showFurnishing: true,
    showLeaseTerm: true,
    showSecurityDeposit: true,
    isHostel: false,
  },
  [PropertyType.HOSTEL]: {
    showBedrooms: false,       // rooms managed via HostelRoom entity
    showBathrooms: false,      // shared/per-room — described in room details
    showParking: true,
    showFloor: false,          // per-room
    showFurnishing: false,     // per-room
    showLeaseTerm: false,      // per-room booking
    showSecurityDeposit: false, // per-room booking
    isHostel: true,
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

  if (!config.showBedrooms) delete result.bedrooms;
  if (!config.showBathrooms) delete result.bathrooms;
  if (!config.showParking) delete result.parkingAvailable;
  if (!config.showFloor) delete result.floor;
  if (!config.showFurnishing) delete result.furnishing;
  if (!config.showLeaseTerm) delete result.leaseTerm;
  if (!config.showSecurityDeposit) delete result.securityDeposit;

  return result;
}