import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditEntity })
  entity: AuditEntity;

  @Column({ nullable: true })
  entityId: string;

  // Human-readable snapshot e.g. "Spacious 2BR in Kololo"
  @Column({ nullable: true })
  entityTitle: string;

  // Stored flat — preserved even if the user is later deleted
  @Column({ nullable: true })
  performedById: string;

  @Column()
  performedByName: string;

  @Column()
  performedByEmail: string;

  // Any extra context: old value, new value, image URL, etc.
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}