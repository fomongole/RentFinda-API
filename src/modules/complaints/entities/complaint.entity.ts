import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ComplaintStatus } from '../enums/complaint-status.enum';
import { ComplaintCategory } from '../enums/complaint-category.enum';
import { Property } from '../../properties/entities/property.entity';

/**
 * A Complaint is submitted anonymously from the mobile app.
 * The renter's contact details are optional but encouraged so the admin
 * can follow up.
 *
 * A complaint may be linked to a specific property (e.g. condition issues,
 * contact conduct) or submitted without a property reference (e.g. app bugs).
 */
@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Submitter info (anonymous — no user account required) ─────────────────
  @Column()
  submitterName: string;

  @Column()
  submitterPhone: string;

  @Column({ type: 'varchar', nullable: true })
  submitterEmail: string | null;

  /**
   * Optional link to a NyumbaLink user account.
   *
   * If the renter is logged in to the mobile app when they submit a complaint,
   * the app should pass their userId so that admin status updates can be
   * delivered as in-app notifications to their account.
   */
  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  // ── Complaint details ─────────────────────────────────────────────────────
  @Index()
  @Column({ type: 'enum', enum: ComplaintCategory, default: ComplaintCategory.GENERAL })
  category: ComplaintCategory;

  @Column({ type: 'text' })
  description: string;

  // ── Related property (optional) ───────────────────────────────────────────
  /**
   * The property this complaint relates to.
   * Null for app-level or general complaints.
   */
  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property: Property | null;

  // ── Admin management ──────────────────────────────────────────────────────
  @Index()
  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.OPEN,
  })
  status: ComplaintStatus;

  /** Admin-only internal notes — never returned in public responses */
  @Column({ type: 'text', nullable: true })
  adminNotes: string | null;

  /** Snapshot of admin who last updated the status */
  @Column({ type: 'varchar', nullable: true })
  resolvedByName: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}