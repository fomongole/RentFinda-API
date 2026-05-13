import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { University } from './entities/university.entity';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/enums/audit-action.enum';
import { AuditEntity } from '../audit-logs/enums/audit-entity.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UniversitiesService {
  private readonly logger = new Logger(UniversitiesService.name);

  constructor(
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(): Promise<University[]> {
    return this.universityRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<University> {
    const university = await this.universityRepository.findOne({ where: { id } });
    if (!university) throw new NotFoundException('University not found');
    return university;
  }

  async create(dto: CreateUniversityDto, performedBy: User): Promise<University> {
    const existing = await this.universityRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`A university named "${dto.name}" already exists.`);
    }

    const university = this.universityRepository.create(dto);
    const saved = await this.universityRepository.save(university);

    await this.auditLogsService.log({
      action: AuditAction.CREATE,
      entity: AuditEntity.UNIVERSITY,
      entityId: saved.id,
      entityTitle: saved.name,
      performedBy,
    });

    return saved;
  }

  async update(
    id: string,
    dto: UpdateUniversityDto,
    performedBy: User,
  ): Promise<University> {
    const university = await this.findOne(id);

    if (dto.name && dto.name !== university.name) {
      const existing = await this.universityRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(`A university named "${dto.name}" already exists.`);
      }
    }

    Object.assign(university, dto);
    const saved = await this.universityRepository.save(university);

    await this.auditLogsService.log({
      action: AuditAction.UPDATE,
      entity: AuditEntity.UNIVERSITY,
      entityId: saved.id,
      entityTitle: saved.name,
      performedBy,
      metadata: { changes: dto },
    });

    return saved;
  }

  /**
   * Hard delete — blocked at DB level if any hostel properties are still linked.
   */
  async remove(id: string, performedBy: User): Promise<{ message: string }> {
    const university = await this.findOne(id);

    try {
      await this.universityRepository.remove(university);
    } catch {
      throw new ConflictException(
        `Cannot delete "${university.name}" — there are hostel properties linked to it. ` +
        `Reassign or delete those properties first.`,
      );
    }

    await this.auditLogsService.log({
      action: AuditAction.DELETE,
      entity: AuditEntity.UNIVERSITY,
      entityId: id,
      entityTitle: university.name,
      performedBy,
    });

    return { message: `University "${university.name}" deleted successfully` };
  }

  async seed(): Promise<void> {
    const count = await this.universityRepository.count();
    if (count > 0) return;

    const universities: Partial<University>[] = [
      { name: 'Makerere University',                          shortName: 'MUK',   location: 'Wandegeya, Kampala' },
      { name: 'Kyambogo University',                          shortName: 'KYU',   location: 'Kyambogo, Kampala' },
      { name: 'Makerere University Business School',          shortName: 'MUBS',  location: 'Nakawa, Kampala' },
      { name: 'Uganda Christian University',                  shortName: 'UCU',   location: 'Mukono' },
      { name: 'Nkumba University',                            shortName: 'NU',    location: 'Entebbe, Wakiso' },
      { name: 'Kampala International University',             shortName: 'KIU',   location: 'Kansanga, Kampala' },
      { name: 'Islamic University in Uganda',                 shortName: 'IUIU',  location: 'Mbale' },
      { name: 'Uganda Martyrs University',                    shortName: 'UMU',   location: 'Nkozi, Mpigi' },
      { name: 'Mbarara University of Science and Technology', shortName: 'MUST',  location: 'Mbarara' },
      { name: 'Gulu University',                              shortName: 'GU',    location: 'Gulu' },
      { name: 'Busitema University',                          shortName: 'BU',    location: 'Tororo' },
      { name: 'Ndejje University',                            shortName: 'NDU',   location: 'Luweero' },
      { name: 'Uganda Technology and Management University',  shortName: 'UTAMU', location: 'Nakawa, Kampala' },
      { name: 'Cavendish University Uganda',                  shortName: 'CUU',   location: 'Kampala' },
      { name: 'Bugema University',                            shortName: 'BUBU',  location: 'Wakiso' },
      { name: 'Mountains of the Moon University',             shortName: 'MMU',   location: 'Fort Portal' },
      { name: 'St. Lawrence University',                      shortName: 'STAN',  location: 'Kampala' },
      { name: 'Kabale University',                            shortName: 'KAB',   location: 'Kabale' },
      { name: 'Lira University',                              shortName: 'LU',    location: 'Lira' },
    ];

    await this.universityRepository.save(
      universities.map((u) => this.universityRepository.create(u)),
    );

    this.logger.log(`Universities seeded successfully (${universities.length} records)`);
  }
}