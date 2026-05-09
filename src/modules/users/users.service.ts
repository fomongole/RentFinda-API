import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditAction } from '../audit-logs/enums/audit-action.enum';
import { AuditEntity } from '../audit-logs/enums/audit-entity.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    name: string,
    email: string,
    password: string,
    role = UserRole.RENTER,
  ): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ name, email, password: hashed, role });
    const saved = await this.userRepository.save(user);

    // Welcome notification — only for RENTER accounts (admins don't use the mobile app)
    if (saved.role === UserRole.RENTER) {
      void this.notificationsService.sendWelcome(saved.id, saved.name);
    }

    return saved;
  }

  async createAdmin(dto: CreateAdminDto, performedBy: User): Promise<User> {
    const user = await this.create(
      dto.name,
      dto.email,
      dto.password,
      dto.role ?? UserRole.ADMIN,
    );

    await this.auditLogsService.log({
      action: AuditAction.CREATE,
      entity: AuditEntity.USER,
      entityId: user.id,
      entityTitle: user.name,
      performedBy,
      metadata: { role: user.role, email: user.email },
    });

    return user;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map(({ password: _p, ...rest }) => rest as Omit<User, 'password'>);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Omit<User, 'password'>> {
    const user = await this.findById(userId);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already in use');
    }

    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    const { password: _p, ...rest } = saved;
    return rest as Omit<User, 'password'>;
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    performedBy: User,
  ): Promise<{ message: string }> {
    // Explicitly re-select the hidden password column for comparison
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);

    // Use BadRequestException (400) NOT UnauthorizedException (401).
    // A 401 would be misread by the frontend interceptor as "session expired"
    // and silently log the user out before the error toast could show.
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    // Use update() instead of save() to avoid TypeORM dirty-tracking issues
    // with select:false columns — save() may skip the password column entirely.
    await this.userRepository.update(userId, { password: hashedNewPassword });

    await this.auditLogsService.log({
      action: AuditAction.PASSWORD_CHANGE,
      entity: AuditEntity.USER,
      entityId: user.id,
      entityTitle: user.name,
      performedBy,
    });

    // Security notification — alert the user so they can spot an unauthorised change
    void this.notificationsService.sendPasswordChanged(userId);

    return { message: 'Password changed successfully' };
  }

  async toggleActive(id: string, performedBy: User): Promise<Omit<User, 'password'>> {
    const user = await this.findById(id);

    if (user.id === performedBy.id) {
      throw new ConflictException('You cannot deactivate your own account');
    }

    user.isActive = !user.isActive;
    const saved = await this.userRepository.save(user);

    await this.auditLogsService.log({
      action: AuditAction.UPDATE,
      entity: AuditEntity.USER,
      entityId: saved.id,
      entityTitle: saved.name,
      performedBy,
      metadata: { isActive: saved.isActive },
    });

    // Notify the affected user about their account status change
    if (saved.isActive) {
      void this.notificationsService.sendAccountActivated(saved.id);
    } else {
      void this.notificationsService.sendAccountDeactivated(saved.id);
    }

    const { password: _p, ...rest } = saved;
    return rest as Omit<User, 'password'>;
  }
}