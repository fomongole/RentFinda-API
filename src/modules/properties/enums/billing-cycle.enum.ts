/**
 * BillingCycle — replaces the old LeaseTerm enum.
 *
 * Not every cycle applies to every property type.
 * Allowed cycles per type are enforced in PROPERTY_FIELD_CONFIG and validated
 * in PropertiesService. The same config is shared with the frontend.
 *
 */
export enum BillingCycle {
  DAILY       = 'DAILY',        // Hotel/Lodge and AirBnB only
  MONTHLY     = 'MONTHLY',      // All applicable types
  QUARTERLY   = 'QUARTERLY',    // 3 months — residential, apartment, AirBnB, office, business
  FOUR_MONTHS = 'FOUR_MONTHS',  // 4 months — hostel rooms only
  BIANNUAL    = 'BIANNUAL',     // 6 months (half year)
  ANNUAL      = 'ANNUAL',       // 12 months
}