import { NotificationType } from '../enums/notification-type.enum';

/**
 * Parameters accepted by NotificationsService.create().
 * Used internally by other services — never exposed directly as a DTO.
 */
export interface CreateNotificationParams {
  /** Target user's UUID */
  userId: string;

  type: NotificationType;
  title: string;
  message: string;

  /**
   * Optional deep-link metadata for the mobile app.
   * Include ids (bookingId, propertyId, complaintId) and human-readable
   * context (propertyTitle, newStatus) so the app can navigate correctly.
   */
  data?: Record<string, unknown>;
}