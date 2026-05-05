import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // ── Public routes ─────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get properties with optional filters (public)' })
  findAll(@Query() filters: FilterPropertyDto) {
    return this.propertiesService.findAll(filters);
  }

  // Must be declared BEFORE :id to avoid "stats" being treated as an id
  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dashboard statistics (admin only)' })
  getStats() {
    return this.propertiesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single property by ID (public) — increments view count' })
  async findOne(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    // Non-blocking — fire and forget
    this.propertiesService.incrementViewCount(id).catch(() => null);
    return property;
  }

  @Post(':id/enquiry')
  @ApiOperation({ summary: 'Record a renter enquiry on a property (public, called by mobile app)' })
  recordEnquiry(@Param('id') id: string) {
    return this.propertiesService.recordEnquiry(id);
  }

  // ── Admin routes ──────────────────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new property (admin only)' })
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: User) {
    return this.propertiesService.create(dto, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a property (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto, @CurrentUser() user: User) {
    return this.propertiesService.update(id, dto, user);
  }

  @Patch(':id/toggle-status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle property availability status (admin only)' })
  toggleStatus(@Param('id') id: string, @CurrentUser() user: User) {
    return this.propertiesService.toggleStatus(id, user);
  }

  @Patch(':id/restore')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted property (admin only)' })
  restore(@Param('id') id: string, @CurrentUser() user: User) {
    return this.propertiesService.restore(id, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft-delete a property (admin only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.propertiesService.remove(id, user);
  }
}