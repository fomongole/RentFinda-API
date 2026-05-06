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
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
 
@ApiTags('Districts')
@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}
 
  @Get()
  @ApiOperation({ summary: 'Get all districts (public)' })
  findAll() {
    return this.districtsService.findAll();
  }
 
  @Get(':id')
  @ApiOperation({ summary: 'Get a single district (public)' })
  findOne(@Param('id') id: string) {
    return this.districtsService.findOne(id);
  }
 
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new district (admin only)' })
  create(@Body() dto: CreateDistrictDto, @CurrentUser() user: User) {
    return this.districtsService.create(dto, user);
  }
 
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a district (admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDistrictDto,
    @CurrentUser() user: User,
  ) {
    return this.districtsService.update(id, dto, user);
  }
 
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Delete a district (admin only) — blocked if properties are linked',
  })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.districtsService.remove(id, user);
  }
}