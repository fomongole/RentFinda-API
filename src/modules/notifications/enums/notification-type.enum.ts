export enum NotificationType {
  // ── Booking lifecycle ─────────────────────────────────────────────────────
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',   // admin confirms a pending booking
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',   // admin cancels a booking
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',   // renter has moved out (admin marks complete)

  // ── Complaint lifecycle ───────────────────────────────────────────────────
  COMPLAINT_UPDATED = 'COMPLAINT_UPDATED',   // admin changes complaint status

  // ── Property discovery ────────────────────────────────────────────────────
  NEW_PROPERTY = 'NEW_PROPERTY',             // a new listing has been added (broadcast)

  // ── Account management ────────────────────────────────────────────────────
  WELCOME           = 'WELCOME',             // sent after successful registration
  ACCOUNT_ACTIVATED  = 'ACCOUNT_ACTIVATED',  // admin re-activates a deactivated account
  ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED', // admin deactivates an account

  /**
   * Security notification — sent automatically when the user changes their
   * own password. Allows them to spot an unauthorised change.
   */
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  // ── Admin broadcasts ──────────────────────────────────────────────────────
  SYSTEM_ALERT = 'SYSTEM_ALERT',             // freeform broadcast from admin portal
}