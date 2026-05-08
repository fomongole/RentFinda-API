import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { FilterContactsDto } from './dto/filter-contacts.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact (owner or agent) — admin only' })
  create(@Body() dto: CreateContactDto, @CurrentUser() user: User) {
    return this.contactsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all active contacts — admin only. Filter by role: OWNER | AGENT' })
  findAll(@Query() filters: FilterContactsDto) {
    return this.contactsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single contact by ID — admin only' })
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact — admin only' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() user: User,
  ) {
    return this.contactsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a contact (soft-delete) — admin only' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.contactsService.remove(id, user);
  }
}