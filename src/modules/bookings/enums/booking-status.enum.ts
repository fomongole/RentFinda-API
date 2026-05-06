export enum BookingStatus {
  PENDING = 'PENDING',       // created by renter, awaiting admin review
  CONFIRMED = 'CONFIRMED',   // admin confirmed; room/property marked occupied
  CANCELLED = 'CANCELLED',   // cancelled by admin or renter
  COMPLETED = 'COMPLETED',   // renter has moved out (admin marks this)
}