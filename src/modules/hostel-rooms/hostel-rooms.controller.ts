import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostelRoomsService } from './hostel-rooms.service';
import { CreateHostelRoomDto } from './dto/create-hostel-room.dto';
import { UpdateHostelRoomDto } from './dto/update-hostel-room.dto';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

/**
 * All hostel-room routes are nested under /properties/:propertyId/rooms
 * so the parent hostel context is always explicit.
 */
@ApiTags('Hostel Rooms')
@Controller('properties/:propertyId/rooms')
export class HostelRoomsController {
  constructor(private readonly hostelRoomsService: HostelRoomsService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all rooms for a hostel property (public)' })
  findAll(@Param('propertyId') propertyId: string) {
    return this.hostelRoomsService.findAllForProperty(propertyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Room occupancy stats for a hostel (public)' })
  getStats(@Param('propertyId') propertyId: string) {
    return this.hostelRoomsService.getRoomStats(propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single hostel room (public)' })
  findOne(@Param('id') id: string) {
    return this.hostelRoomsService.findOne(id);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a room to a hostel property (admin only)' })
  create(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateHostelRoomDto,
    @CurrentUser() user: User,
  ) {
    return this.hostelRoomsService.create(propertyId, dto, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a hostel room (admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHostelRoomDto,
    @CurrentUser() user: User,
  ) {
    return this.hostelRoomsService.update(id, dto, user);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a room status (admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRoomStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.hostelRoomsService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a hostel room (admin only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.hostelRoomsService.remove(id, user);
  }
}