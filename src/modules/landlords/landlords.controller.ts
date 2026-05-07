import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LandlordsService } from './landlords.service';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { FilterLandlordsDto } from './dto/filter-landlords.dto';

@ApiTags('Landlords')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('landlords')
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new landlord (admin only)' })
  create(@Body() dto: CreateLandlordDto, @CurrentUser() user: User) {
    return this.landlordsService.create(dto, user);
  }

  
  @Get()
  @ApiOperation({ summary: 'Get all active landlords (admin only)' })
  findAll(@Query() filters: FilterLandlordsDto) {
    return this.landlordsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single landlord by ID (admin only)' })
  findOne(@Param('id') id: string) {
    return this.landlordsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a landlord (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateLandlordDto, @CurrentUser() user: User) {
    return this.landlordsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a landlord (admin only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.landlordsService.remove(id, user);
  }
}