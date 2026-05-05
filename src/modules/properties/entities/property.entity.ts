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
} from 'typeorm';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { FurnishingStatus } from '../enums/furnishing-status.enum';
import { LeaseTerm } from '../enums/lease-term.enum';
import { Landlord } from '../../landlords/entities/landlord.entity';
import { District } from '../../districts/entities/district.entity';
import { PropertyImage } from './property-image.entity';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ default: 1 })
  bedrooms: number;

  @Column({ default: 1 })
  bathrooms: number;

  @Column()
  area: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  @Column({
    type: 'enum',
    enum: FurnishingStatus,
    default: FurnishingStatus.UNFURNISHED,
    nullable: true,
  })
  furnishing: FurnishingStatus;

  @Column({
    type: 'enum',
    enum: LeaseTerm,
    default: LeaseTerm.MONTHLY,
    nullable: true,
  })
  leaseTerm: LeaseTerm;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  securityDeposit: number;

  // Date the property becomes available for move-in
  @Column({ type: 'date', nullable: true })
  availableFrom: Date;

  // Floor number — relevant for apartments (null = not applicable)
  @Column({ nullable: true })
  floor: number;

  @Column({ default: false })
  parkingAvailable: boolean;

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[];

  // Incremented on every public GET /properties/:id
  @Column({ default: 0 })
  viewCount: number;

  // Incremented when a renter taps call/whatsapp on mobile
  @Column({ default: 0 })
  enquiryCount: number;

  @ManyToOne(() => Landlord, { eager: true, nullable: false })
  @JoinColumn({ name: 'landlord_id' })
  landlord: Landlord;

  @ManyToOne(() => District, { eager: true, nullable: false })
  @JoinColumn({ name: 'district_id' })
  district: District;

  @OneToMany(() => PropertyImage, (image) => image.property, { eager: true, cascade: true })
  images: PropertyImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Soft delete — TypeORM automatically excludes rows where this is set
  @DeleteDateColumn()
  deletedAt: Date;
}