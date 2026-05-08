export enum ComplaintCategory {
  GENERAL           = 'GENERAL',            // anything that doesn't fit below
  PROPERTY_CONDITION = 'PROPERTY_CONDITION', // maintenance, damage, cleanliness
  CONTACT_CONDUCT   = 'CONTACT_CONDUCT',    // owner/agent behaviour (harassment, unavailability)
  PRICING           = 'PRICING',            // hidden charges, price mismatch
  BOOKING           = 'BOOKING',            // issues with the booking process
  APP_ISSUE         = 'APP_ISSUE',          // bug or UX problem with the mobile app
  OTHER             = 'OTHER',
}