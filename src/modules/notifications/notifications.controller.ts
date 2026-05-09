import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { FilterNotificationsDto } from './dto/filter-notifications.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ── Mobile app / portal — any authenticated user ──────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Get notifications for the authenticated user',
    description: `Returns the authenticated user's notifications ordered most recent first. Supports filtering by type and read status.`,
  })
  findAll(@CurrentUser() user: User, @Query() filters: FilterNotificationsDto) {
    return this.notificationsService.findForUser(user.id, filters);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count for the authenticated user',
    description:
      'Lightweight endpoint intended for the notification badge on the mobile app ' +
      'bottom navigation bar. Poll this periodically or call it on app focus.',
  })
  getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  // Must be declared BEFORE :id to avoid "read-all" being treated as an id
  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read for the authenticated user',
    description: 'Bulk-marks every unread notification belonging to the user as read.',
  })
  markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single notification by ID (must belong to the authenticated user)' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.findOneForUser(id, user.id);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark a single notification as read',
    description: 'Idempotent — calling this on an already-read notification is a no-op.',
  })
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a notification',
    description:
      'Permanently removes the notification. Only the owning user can delete their own notifications.',
  })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.remove(id, user.id);
  }

  // ── Admin only ────────────────────────────────────────────────────────────

  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Broadcast a custom notification to all active renters (admin only)',
    description:
      'Creates a SYSTEM_ALERT notification for every active RENTER user. ' +
      'Use sparingly — prefer targeted notifications triggered by booking/complaint events.',
  })
  adminBroadcast(@Body() dto: BroadcastNotificationDto) {
    return this.notificationsService.adminBroadcast(dto);
  }
}