import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { User } from '../users/entities/user.entity';

@Global() // NotificationsService injectable everywhere — same pattern as AuditLogsModule
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User, // needed for the broadcast fan-out query (all active RENTER users)
    ]),
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}