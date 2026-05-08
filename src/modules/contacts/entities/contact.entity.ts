import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContactRole } from '../enums/contact-role.enum';

/**
 * A Contact is the person responsible for a property — either the OWNER
 * or an AGENT (broker/property manager acting on the owner's behalf).
 *
 * Replaces the old Landlord entity. The table is renamed from 'landlords'
 * to 'contacts'. Since we are still in development and tables can be dropped,
 * no migration is needed — TypeORM synchronize will recreate from scratch.
 */
@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  /** OWNER = property owner, AGENT = broker/agent managing on behalf of owner */
  @Column({ type: 'enum', enum: ContactRole })
  role: ContactRole;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  whatsapp: string;

  /** Uganda National Identification Number */
  @Column({ nullable: true, unique: true })
  nationalId: string;

  @Column({ nullable: true })
  physicalAddress: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}