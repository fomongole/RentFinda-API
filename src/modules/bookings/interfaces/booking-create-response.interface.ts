import { Booking } from '../entities/booking.entity';

export interface BookingCreateResponse extends Omit<Booking, 'cancellationTokenHash'> {
  /**
   * Returned ONCE at booking creation time.
   * The mobile app must store this locally and show it to the renter.
   * It is never stored in plaintext on the server — only a bcrypt hash is kept.
   */
  cancellationToken: string;
}