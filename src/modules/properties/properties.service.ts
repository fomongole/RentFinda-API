import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatus } from './enums/property-status.enum';
import { LandlordsService } from '../landlords/landlords.service';
import { DistrictsService } from '../districts/districts.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/enums/audit-action.enum';
import { AuditEntity } from '../audit-logs/enums/audit-entity.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly landlordsService: LandlordsService,
    private readonly districtsService: DistrictsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreatePropertyDto, performedBy: User): Promise<Property> {
    const landlord = await this.landlordsService.findOne(dto.landlordId);
    const district = await this.districtsService.findOne(dto.districtId);

    const property = this.propertyRepository.create({ ...dto, landlord, district });
    const saved = await this.propertyRepository.save(property);

    await this.auditLogsService.log({
      action: AuditAction.CREATE,
      entity: AuditEntity.PROPERTY,
      entityId: saved.id,
      entityTitle: saved.title,
      performedBy,
    });

    return saved;
  }

  async findAll(filters: FilterPropertyDto) {
    const {
      districtId, type, status, minPrice,
      maxPrice, bedrooms, page = 1, limit = 10,
    } = filters;

    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.landlord', 'landlord')
      .leftJoinAndSelect('property.district', 'district')
      .leftJoinAndSelect('property.images', 'images');

    if (districtId) query.andWhere('district.id = :districtId', { districtId });
    if (type) query.andWhere('property.type = :type', { type });
    if (status) query.andWhere('property.status = :status', { status });
    if (minPrice) query.andWhere('property.price >= :minPrice', { minPrice });
    if (maxPrice) query.andWhere('property.price <= :maxPrice', { maxPrice });
    if (bedrooms) query.andWhere('property.bedrooms = :bedrooms', { bedrooms });

    const total = await query.getCount();
    const data = await query
      .orderBy('property.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['landlord', 'district', 'images'],
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async update(id: string, dto: UpdatePropertyDto, performedBy: User): Promise<Property> {
    const property = await this.findOne(id);

    if (dto.landlordId) {
      property.landlord = await this.landlordsService.findOne(dto.landlordId);
    }
    if (dto.districtId) {
      property.district = await this.districtsService.findOne(dto.districtId);
    }

    Object.assign(property, dto);
    const saved = await this.propertyRepository.save(property);

    await this.auditLogsService.log({
      action: AuditAction.UPDATE,
      entity: AuditEntity.PROPERTY,
      entityId: saved.id,
      entityTitle: saved.title,
      performedBy,
      metadata: { changes: dto },
    });

    return saved;
  }

  async toggleStatus(id: string, performedBy: User): Promise<Property> {
    const property = await this.findOne(id);
    const previousStatus = property.status;

    property.status =
      property.status === PropertyStatus.AVAILABLE
        ? PropertyStatus.RENTED
        : PropertyStatus.AVAILABLE;

    const saved = await this.propertyRepository.save(property);

    await this.auditLogsService.log({
      action: AuditAction.STATUS_CHANGE,
      entity: AuditEntity.PROPERTY,
      entityId: saved.id,
      entityTitle: saved.title,
      performedBy,
      metadata: { from: previousStatus, to: saved.status },
    });

    return saved;
  }

  // Soft delete — sets deletedAt, TypeORM excludes it from all future queries automatically
  async remove(id: string, performedBy: User): Promise<{ message: string }> {
    const property = await this.findOne(id);
    await this.propertyRepository.softRemove(property);

    await this.auditLogsService.log({
      action: AuditAction.DELETE,
      entity: AuditEntity.PROPERTY,
      entityId: property.id,
      entityTitle: property.title,
      performedBy,
    });

    return { message: 'Property deleted successfully' };
  }

  async restore(id: string, performedBy: User): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['landlord', 'district', 'images'],
    });

    if (!property) throw new NotFoundException('Property not found');
    if (!property.deletedAt) throw new NotFoundException('Property is not deleted');

    await this.propertyRepository.restore(id);

    await this.auditLogsService.log({
      action: AuditAction.RESTORE,
      entity: AuditEntity.PROPERTY,
      entityId: property.id,
      entityTitle: property.title,
      performedBy,
    });

    return this.findOne(id);
  }

  // Increments view count atomically — no race condition
  async incrementViewCount(id: string): Promise<void> {
    await this.propertyRepository.increment({ id }, 'viewCount', 1);
  }

  // Called by mobile app when renter taps call/whatsapp button
  async recordEnquiry(id: string): Promise<{ message: string }> {
    await this.findOne(id); // ensure it exists
    await this.propertyRepository.increment({ id }, 'enquiryCount', 1);
    return { message: 'Enquiry recorded' };
  }

  async getStats() {
    const total = await this.propertyRepository.count();
    const available = await this.propertyRepository.count({
      where: { status: PropertyStatus.AVAILABLE },
    });
    const rented = await this.propertyRepository.count({
      where: { status: PropertyStatus.RENTED },
    });

    // Properties added in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const addedThisWeek = await this.propertyRepository
      .createQueryBuilder('property')
      .where('property.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    // Top 5 most viewed
    const topViewed = await this.propertyRepository.find({
      order: { viewCount: 'DESC' },
      take: 5,
      relations: ['district'],
    });

    // Top 5 most enquired
    const topEnquired = await this.propertyRepository.find({
      order: { enquiryCount: 'DESC' },
      take: 5,
      relations: ['district'],
    });

    const occupancyRate =
      total > 0 ? Math.round((rented / total) * 100) : 0;

    return {
      total,
      available,
      rented,
      occupancyRate,
      addedThisWeek,
      topViewed,
      topEnquired,
    };
  }
}