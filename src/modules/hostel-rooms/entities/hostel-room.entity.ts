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
import { HostelRoomType } from '../enums/hostel-room-type.enum';
import { HostelRoomStatus } from '../enums/hostel-room-status.enum';
import { BillingCycle } from '../../properties/enums/billing-cycle.enum';
import { Property } from '../../properties/entities/property.entity';

@Entity('hostel_rooms')
export class HostelRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Human-readable room identifier: "101", "Room A", "Block B - 23", etc.
   * Unique within a hostel (enforced via service layer check).
   */
  @Column()
  roomNumber: string;

  @Column({ type: 'enum', enum: HostelRoomType })
  type: HostelRoomType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  /**
   * The billing period this room's price applies to.
   * Allowed: MONTHLY, FOUR_MONTHS, BIANNUAL, ANNUAL.
   * DAILY is not allowed for hostels — use HOTEL_LODGE type for daily rentals.
   *
   * Validated in HostelRoomsService.create / update.
   */
  @Column({ type: 'enum', enum: BillingCycle })
  billingCycle: BillingCycle;

  @Index()
  @Column({
    type: 'enum',
    enum: HostelRoomStatus,
    default: HostelRoomStatus.AVAILABLE,
  })
  status: HostelRoomStatus;

  @Column({ nullable: true })
  floor: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  /** e.g. ['En-suite bathroom', 'Study desk', 'Wardrobe'] */
  @Column({ type: 'simple-array', nullable: true })
  amenities: string[];

  /**
   * The parent hostel property.
   * Must be a Property with type = PropertyType.HOSTEL.
   * Enforced in HostelRoomsService.
   */
  @ManyToOne(() => Property, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}