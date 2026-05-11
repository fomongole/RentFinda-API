import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

@Injectable()
export class AuthCleanupTask {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetRepo: Repository<PasswordResetToken>,
  ) {}

  @Cron('0 3 * * *') // 3 AM daily
  async purgeExpiredResetTokens(): Promise<void> {
    await this.passwordResetRepo
      .createQueryBuilder()
      .delete()
      .from(PasswordResetToken)
      .where('expiresAt < NOW()')
      .execute();
  }
}