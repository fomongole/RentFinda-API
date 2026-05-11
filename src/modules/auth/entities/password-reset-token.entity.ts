import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  email: string;

  /** bcrypt hash of the 6-digit OTP — never store plain text */
  @Column()
  tokenHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  /** Set when the token is consumed — prevents reuse */
  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}