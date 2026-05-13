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
import { PropertyType }       from '../enums/property-type.enum';
import { PropertyStatus }     from '../enums/property-status.enum';
import { FurnishingStatus }   from '../enums/furnishing-status.enum';
import { BillingCycle }       from '../enums/billing-cycle.enum';
import { HotelCategory }      from '../enums/hotel-category.enum';
import { District }           from '../../districts/entities/district.entity';
import { University }         from '../../universities/entities/university.entity';
import { PropertyImage }      from './property-image.entity';
import { Contact }            from 'src/modules/contacts/entities/contact.entity';

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

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  /**
   * The pricing period for this property's listed price.
   * - HOSTEL:       null — billing cycle lives on each HostelRoom.
   * - HOTEL_LODGE:  DAILY or MONTHLY.
   * - All others:   MONTHLY | QUARTERLY | BIANNUAL | ANNUAL.
   */
  @Column({ type: 'enum', enum: BillingCycle, nullable: true })
  billingCycle: BillingCycle | null;

  /**
   * Generic room count for the property.
   * Not applicable to HOSTEL (rooms managed via HostelRoom entity → stripped).
   */
  @Column({ name: 'number_of_rooms', default: 1 })
  numberOfRooms: number;

  /**
   * HOSTEL only: the maximum number of HostelRoom entries that can be created.
   * NULL = no cap enforced.
   */
  @Column({ type: 'int', name: 'total_rooms', nullable: true })
  totalRooms: number | null;

  /**
   * HOTEL_LODGE only: tier / service-level category.
   */
  @Column({ type: 'enum', enum: HotelCategory, name: 'hotel_category', nullable: true })
  hotelCategory: HotelCategory | null;

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

  // ── Featured listing ──────────────────────────────────────────────────────

  /**
   * Whether this property is currently displayed as a featured listing.
   * Featured properties are sorted above standard listings in all search results.
   * Toggled by an admin after receiving payment. Auto-expires via cron job.
   */
  @Index()
  @Column({ default: false })
  isFeatured: boolean;

  /**
   * The date after which this property's featured status automatically expires.
   * The nightly cron job in PropertiesSchedulerTask checks this and resets
   * isFeatured to false when the date has passed.
   * Null when the property is not featured.
   */
  @Column({ type: 'date', nullable: true })
  featuredUntil: Date | null;

  // ── University (HOSTEL only) ──────────────────────────────────────────────

  /**
   * The nearby university this hostel serves.
   * HOSTEL only — stripped by stripInapplicableFields for all other types.
   * Null for non-hostel properties and hostels with no university association.
   */
  @ManyToOne(() => University, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'university_id' })
  university: University | null;

  /**
   * Approximate walking / commuting distance from this hostel to the linked university.
   * Admin-entered in kilometres. More reliable than straight-line haversine distance
   * which does not account for roads, traffic, or terrain.
   * HOSTEL only — stripped for all other types.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  approximateDistanceKm: number | null;

  // ── Relations ─────────────────────────────────────────────────────────────

  /**
   * The person responsible for this property — either the OWNER or an AGENT.
   */
  @ManyToOne(() => Contact, { nullable: false })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => District, { nullable: false })
  @JoinColumn({ name: 'district_id' })
  district: District;

  /**
   * Images managed independently via MediaService.
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