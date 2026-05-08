import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostelRoom } from './entities/hostel-room.entity';
import { CreateHostelRoomDto, HOSTEL_ROOM_BILLING_CYCLES } from './dto/create-hostel-room.dto';
import { UpdateHostelRoomDto } from './dto/update-hostel-room.dto';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';
import { HostelRoomStatus } from './enums/hostel-room-status.enum';
import { BillingCycle } from '../properties/enums/billing-cycle.enum';
import { PropertiesService } from '../properties/properties.service';
import { PropertyType } from '../properties/enums/property-type.enum';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/enums/audit-action.enum';
import { AuditEntity } from '../audit-logs/enums/audit-entity.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class HostelRoomsService {
  constructor(
    @InjectRepository(HostelRoom)
    private readonly roomRepository: Repository<HostelRoom>,
    private readonly propertiesService: PropertiesService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private validateHostelBillingCycle(billingCycle: BillingCycle): void {
    if (!(HOSTEL_ROOM_BILLING_CYCLES as readonly BillingCycle[]).includes(billingCycle)) {
      throw new BadRequestException(
        `billingCycle "${billingCycle}" is not allowed for hostel rooms. ` +
        `Allowed values: ${HOSTEL_ROOM_BILLING_CYCLES.join(', ')}.`,
      );
    }
  }

  async create(
    propertyId: string,
    dto: CreateHostelRoomDto,
    performedBy: User,
  ): Promise<HostelRoom> {
    const property = await this.propertiesService.findOne(propertyId);

    if (property.type !== PropertyType.HOSTEL) {
      throw new BadRequestException(
        'Rooms can only be added to properties of type HOSTEL.',
      );
    }

    this.validateHostelBillingCycle(dto.billingCycle);

    // Enforce room number uniqueness within the hostel
    const existing = await this.roomRepository.findOne({
      where: { roomNumber: dto.roomNumber, property: { id: propertyId } },
    });
    if (existing) {
      throw new BadRequestException(
        `Room number "${dto.roomNumber}" already exists in this hostel.`,
      );
    }

    const room = this.roomRepository.create({ ...dto, property });
    const saved = await this.roomRepository.save(room);

    await this.auditLogsService.log({
      action: AuditAction.CREATE,
      entity: AuditEntity.HOSTEL_ROOM,
      entityId: saved.id,
      entityTitle: `${property.title} — Room ${saved.roomNumber}`,
      performedBy,
      metadata: { billingCycle: saved.billingCycle, price: saved.price },
    });

    return saved;
  }

  async findAllForProperty(propertyId: string): Promise<HostelRoom[]> {
    await this.propertiesService.findOne(propertyId);

    return this.roomRepository.find({
      where: { property: { id: propertyId } },
      order: { roomNumber: 'ASC' },
    });
  }

  async findOne(id: string): Promise<HostelRoom> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['property'],
    });
    if (!room) throw new NotFoundException('Hostel room not found');
    return room;
  }

  async update(
    id: string,
    dto: UpdateHostelRoomDto,
    performedBy: User,
  ): Promise<HostelRoom> {
    const room = await this.findOne(id);

    if (dto.billingCycle) {
      this.validateHostelBillingCycle(dto.billingCycle);
    }

    // Re-check uniqueness if roomNumber is changing
    if (dto.roomNumber && dto.roomNumber !== room.roomNumber) {
      const existing = await this.roomRepository.findOne({
        where: {
          roomNumber: dto.roomNumber,
          property: { id: room.property.id },
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Room number "${dto.roomNumber}" already exists in this hostel.`,
        );
      }
    }

    Object.assign(room, dto);
    const saved = await this.roomRepository.save(room);

    await this.auditLogsService.log({
      action: AuditAction.UPDATE,
      entity: AuditEntity.HOSTEL_ROOM,
      entityId: saved.id,
      entityTitle: `${room.property.title} — Room ${saved.roomNumber}`,
      performedBy,
      metadata: { changes: dto },
    });

    return saved;
  }

  async updateStatus(
    id: string,
    dto: UpdateRoomStatusDto,
    performedBy: User,
  ): Promise<HostelRoom> {
    const room = await this.findOne(id);
    const previousStatus = room.status;
    room.status = dto.status;
    const saved = await this.roomRepository.save(room);

    await this.auditLogsService.log({
      action: AuditAction.STATUS_CHANGE,
      entity: AuditEntity.HOSTEL_ROOM,
      entityId: saved.id,
      entityTitle: `${room.property.title} — Room ${saved.roomNumber}`,
      performedBy,
      metadata: { from: previousStatus, to: saved.status },
    });

    return saved;
  }

  async remove(id: string, performedBy: User): Promise<{ message: string }> {
    const room = await this.findOne(id);

    if (room.status === HostelRoomStatus.OCCUPIED) {
      throw new BadRequestException(
        'Cannot delete an occupied room. Cancel the active booking first.',
      );
    }

    await this.roomRepository.remove(room);

    await this.auditLogsService.log({
      action: AuditAction.DELETE,
      entity: AuditEntity.HOSTEL_ROOM,
      entityId: id,
      entityTitle: `${room.property.title} — Room ${room.roomNumber}`,
      performedBy,
    });

    return { message: 'Room deleted successfully' };
  }

  /** Called internally by BookingsService — not exposed as a public endpoint */
  async setStatus(id: string, status: HostelRoomStatus): Promise<void> {
    await this.roomRepository.update(id, { status });
  }

  async getRoomStats(propertyId: string) {
    const rooms = await this.findAllForProperty(propertyId);
    const total = rooms.length;
    const available   = rooms.filter(r => r.status === HostelRoomStatus.AVAILABLE).length;
    const occupied    = rooms.filter(r => r.status === HostelRoomStatus.OCCUPIED).length;
    const reserved    = rooms.filter(r => r.status === HostelRoomStatus.RESERVED).length;
    const maintenance = rooms.filter(r => r.status === HostelRoomStatus.MAINTENANCE).length;
    const occupancyRate = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;

    return { total, available, occupied, reserved, maintenance, occupancyRate };
  }
}