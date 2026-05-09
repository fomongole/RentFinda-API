import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { NotificationType } from '../enums/notification-type.enum';
import { User } from '../../users/entities/user.entity';

/**
 * A Notification belongs to a single user.
 *
 * For broadcast notifications (e.g. NEW_PROPERTY), one row is created
 * per active RENTER — this keeps read/unread state per-user without
 * a separate pivot table.
 *
 * Notifications cascade-delete when the owning user is deleted.
 */
@Entity('notifications')
@Index(['userId', 'isRead']) // speeds up unread-count queries
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' }) // Safely binds this property to the exact foreign key column
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  /**
   * Optional structured metadata surfaced to the mobile app so it can
   * deep-link to the relevant screen when a notification is tapped.
   *
   * Examples:
   * BOOKING_CONFIRMED  → { bookingId, propertyId, propertyTitle, moveInDate }
   * COMPLAINT_UPDATED  → { complaintId, newStatus, category }
   * NEW_PROPERTY       → { propertyId, propertyTitle, type, price, area }
   */
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, unknown> | null;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}