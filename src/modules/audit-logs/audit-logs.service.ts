import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditAction } from './enums/audit-action.enum';
import { AuditEntity } from './enums/audit-entity.enum';
import { FilterAuditLogsDto } from './dto/filter-audit-logs.dto';
import { User } from '../users/entities/user.entity';

export interface LogEventParams {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityTitle?: string;
  performedBy: Pick<User, 'id' | 'name' | 'email'>;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  // Fire-and-forget — never let an audit failure crash the main operation
  async log(params: LogEventParams): Promise<void> {
    try {
      const entry = this.auditLogRepository.create({
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        entityTitle: params.entityTitle,
        performedById: params.performedBy.id,
        performedByName: params.performedBy.name,
        performedByEmail: params.performedBy.email,
        metadata: params.metadata,
      });
      await this.auditLogRepository.save(entry);
    } catch (err) {
      // Log to console but never propagate — audit must not break business logic
      console.error('[AuditLog] Failed to write audit entry:', err);
    }
  }

  async findAll(filters: FilterAuditLogsDto) {
    const { action, entity, entityId, performedById, page = 1, limit = 20 } = filters;

    const query = this.auditLogRepository.createQueryBuilder('log');

    if (action) query.andWhere('log.action = :action', { action });
    if (entity) query.andWhere('log.entity = :entity', { entity });
    if (entityId) query.andWhere('log.entityId = :entityId', { entityId });
    if (performedById) query.andWhere('log.performedById = :performedById', { performedById });

    const total = await query.getCount();
    const data = await query
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}