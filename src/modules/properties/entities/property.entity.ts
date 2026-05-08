import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { FurnishingStatus } from '../enums/furnishing-status.enum';
import { BillingCycle } from '../enums/billing-cycle.enum';
import { District } from '../../districts/entities/district.entity';
import { PropertyImage } from './property-image.entity';
import { ResidentialSubtype } from '../enums/residential-subtype.enum';
import { Contact } from 'src/modules/contacts/entities/contact.entity';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Index()
  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  /**
   * Only set when type = RESIDENTIAL_HOUSE.
   * Distinguishes single-room from double-room houses.
   */
  @Column({
    type: 'enum',
    enum: ResidentialSubtype,
    nullable: true,
  })
  residentialSubtype: ResidentialSubtype | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  /**
   * The pricing period for this property's listed price.
   * - For HOSTEL: null — billing cycle lives on each HostelRoom.
   * - For HOTEL_LODGE: DAILY or MONTHLY.
   * - For all others: MONTHLY | QUARTERLY | BIANNUAL | ANNUAL.
   * Validated against PROPERTY_FIELD_CONFIG[type].allowedBillingCycles in service layer.
   */
  @Column({
    type: 'enum',
    enum: BillingCycle,
    nullable: true,
  })
  billingCycle: BillingCycle | null;

  @Column({ default: 1 })
  bedrooms: number;

  @Column({ default: 1 })
  bathrooms: number;

  @Column()
  area: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Index()
  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  @Column({
    type: 'enum',
    enum: FurnishingStatus,
    default: FurnishingStatus.UNFURNISHED,
    nullable: true,
  })
  furnishing: FurnishingStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  securityDeposit: number;

  @Column({ type: 'date', nullable: true })
  availableFrom: Date;

  @Column({ nullable: true })
  floor: number;

  @Column({ default: false })
  parkingAvailable: boolean;

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[];

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  enquiryCount: number;

  /**
   * The person responsible for this property — either the OWNER or an AGENT.
   * Previously called "landlord"; renamed to reflect that not every contact
   * is the owner — some are agents/brokers.
   */
  @ManyToOne(() => Contact, { nullable: false })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => District, { nullable: false })
  @JoinColumn({ name: 'district_id' })
  district: District;

  /**
   * cascade: true removed intentionally — see original comment.
   * Images are managed independently via MediaService.
   * Hard-deletes cascade at DB level via onDelete: 'CASCADE' on the FK.
   */
  @OneToMany(() => PropertyImage, (image) => image.property)
  images: PropertyImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}