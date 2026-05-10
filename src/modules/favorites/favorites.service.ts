import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { SyncFavoritesDto } from './dto/sync-favorites.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async findAllForUser(userId: string) {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      relations: ['property', 'property.district', 'property.images'],
      order: { createdAt: 'DESC' },
    });
    return favorites.map((f) => f.property);
  }

  /**
   * Toggles a favorite. If it exists, delete it. If not, create it.
   * Race-condition safe: concurrent sync + toggle hitting the same row
   * produces a unique-violation (PG 23505) which we treat as "already saved".
   */
  async toggle(userId: string, propertyId: string) {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, propertyId },
    });

    if (existing) {
      await this.favoriteRepository.remove(existing);
      return { saved: false };
    }

    try {
      const favorite = this.favoriteRepository.create({ userId, propertyId });
      await this.favoriteRepository.save(favorite);
      return { saved: true };
    } catch (error: any) {
      // PG 23505 — unique violation from a concurrent insert (e.g. sync + toggle race).
      // The row exists either way, so we return saved: true.
      if (error?.code === '23505') {
        return { saved: true };
      }
      throw error;
    }
  }

  /**
   * Syncs local favorites from the mobile app.
   * INSERT ... ON CONFLICT DO NOTHING — idempotent and race-safe.
   */
  async sync(userId: string, dto: SyncFavoritesDto) {
    if (dto.propertyIds.length === 0) return { synced: 0 };

    const values = dto.propertyIds.map((id) => ({ userId, propertyId: id }));

    const result = await this.favoriteRepository
      .createQueryBuilder()
      .insert()
      .into(Favorite)
      .values(values)
      .orIgnore()
      .execute();

    return { synced: result.identifiers.length };
  }
}