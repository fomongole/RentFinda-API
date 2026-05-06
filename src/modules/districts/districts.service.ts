import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from './entities/district.entity';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/enums/audit-action.enum';
import { AuditEntity } from '../audit-logs/enums/audit-entity.enum';
import { User } from '../users/entities/user.entity';
 
@Injectable()
export class DistrictsService {
  constructor(
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    private readonly auditLogsService: AuditLogsService,
  ) {}
 
  async findAll(): Promise<District[]> {
    return this.districtRepository.find({ order: { name: 'ASC' } });
  }
 
  async findOne(id: string): Promise<District> {
    const district = await this.districtRepository.findOne({ where: { id } });
    if (!district) throw new NotFoundException('District not found');
    return district;
  }
 
  async create(dto: CreateDistrictDto, performedBy: User): Promise<District> {
    const existing = await this.districtRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `A district named "${dto.name}" already exists.`,
      );
    }
 
    const district = this.districtRepository.create(dto);
    const saved = await this.districtRepository.save(district);
 
    await this.auditLogsService.log({
      action: AuditAction.CREATE,
      entity: AuditEntity.DISTRICT,
      entityId: saved.id,
      entityTitle: saved.name,
      performedBy,
    });
 
    return saved;
  }
 
  async update(
    id: string,
    dto: UpdateDistrictDto,
    performedBy: User,
  ): Promise<District> {
    const district = await this.findOne(id);
 
    if (dto.name && dto.name !== district.name) {
      const existing = await this.districtRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(
          `A district named "${dto.name}" already exists.`,
        );
      }
    }
 
    Object.assign(district, dto);
    const saved = await this.districtRepository.save(district);
 
    await this.auditLogsService.log({
      action: AuditAction.UPDATE,
      entity: AuditEntity.DISTRICT,
      entityId: saved.id,
      entityTitle: saved.name,
      performedBy,
      metadata: { changes: dto },
    });
 
    return saved;
  }
 
  /**
   * Hard delete — only allowed if no properties are linked to this district.
   * TypeORM will throw a FK constraint error if properties exist, which we
   * catch and rethrow with a clear message.
   */
  async remove(id: string, performedBy: User): Promise<{ message: string }> {
    const district = await this.findOne(id);
 
    try {
      await this.districtRepository.remove(district);
    } catch {
      throw new ConflictException(
        `Cannot delete "${district.name}" — there are properties linked to this district. ` +
        `Reassign or delete those properties first.`,
      );
    }
 
    await this.auditLogsService.log({
      action: AuditAction.DELETE,
      entity: AuditEntity.DISTRICT,
      entityId: id,
      entityTitle: district.name,
      performedBy,
    });
 
    return { message: `District "${district.name}" deleted successfully` };
  }
 
  async seed(): Promise<void> {
    const count = await this.districtRepository.count();
    if (count > 0) return;
 
    const districts = [
      { name: 'Kampala', region: 'Central' },
      { name: 'Wakiso', region: 'Central' },
      { name: 'Mukono', region: 'Central' },
      { name: 'Entebbe', region: 'Central' },
      { name: 'Jinja', region: 'Eastern' },
      { name: 'Mbale', region: 'Eastern' },
      { name: 'Gulu', region: 'Northern' },
      { name: 'Lira', region: 'Northern' },
      { name: 'Mbarara', region: 'Western' },
      { name: 'Kabale', region: 'Western' },
      { name: 'Fort Portal', region: 'Western' },
      { name: 'Masaka', region: 'Central' },
      { name: 'Mityana', region: 'Central' },
      { name: 'Lugazi', region: 'Central' },
      { name: 'Soroti', region: 'Eastern' },
    ];
 
    await this.districtRepository.save(
      districts.map((d) => this.districtRepository.create(d)),
    );
 
    console.log('✅ Districts seeded successfully');
  }
}