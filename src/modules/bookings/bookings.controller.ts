import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CancelByRenterDto } from './dto/cancel-by-renter.dto';
import { SyncBookingsDto } from './dto/sync-bookings.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ── PUBLIC ─────────────────────────────────────────────────────────────
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Patch(':id/cancel-by-renter')
  cancelByRenter(@Param('id') id: string, @Body() dto: CancelByRenterDto) {
    return this.bookingsService.cancelByRenter(id, dto);
  }

  @Get('me')                           
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findMyBookings(@CurrentUser() user: User) {
    return this.bookingsService.findForUser(user.id);
  }

  @Post('sync')                        
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  sync(@CurrentUser() user: User, @Body() dto: SyncBookingsDto) {
    return this.bookingsService.syncGuestBookings(user.id, dto);
  }

  @Patch(':id/cancel-mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  cancelMine(@Param('id') id: string, @Body() dto: CancelBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.cancelMine(id, dto.reason, user.id);
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() { return this.bookingsService.getStats(); }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() filters: FilterBookingsDto) {
    return this.bookingsService.findAll(filters);
  }

  @Get(':id')                          
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/confirm')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  confirm(@Param('id') id: string, @Body() dto: ConfirmBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.confirm(id, dto, user);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  cancel(@Param('id') id: string, @Body() dto: CancelBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.cancel(id, dto, 'admin', user);
  }

  @Patch(':id/complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.complete(id, user);
  }
}