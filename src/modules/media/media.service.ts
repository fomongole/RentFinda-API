import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { PropertyImage } from '../properties/entities/property-image.entity';
import { PropertiesService } from '../properties/properties.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/enums/audit-action.enum';
import { AuditEntity } from '../audit-logs/enums/audit-entity.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(PropertyImage)
    private readonly imageRepository: Repository<PropertyImage>,
    private readonly propertiesService: PropertiesService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async uploadImages(
    propertyId: string,
    files: Express.Multer.File[],
    performedBy: User,
  ): Promise<PropertyImage[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const property = await this.propertiesService.findOne(propertyId);
    const existingCount = property.images?.length || 0;

    if (existingCount + files.length > 8) {
      throw new BadRequestException(
        `Maximum 8 images per property. Currently has ${existingCount}.`,
      );
    }

    const uploadedImages: PropertyImage[] = [];

    for (const file of files) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `rentfinda/properties/${propertyId}`,
            resource_type: 'image',
            transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });

      const isPrimary = existingCount === 0 && uploadedImages.length === 0;

      const image = this.imageRepository.create({
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary,
        property,
      });

      uploadedImages.push(await this.imageRepository.save(image));
    }

    await this.auditLogsService.log({
      action: AuditAction.IMAGE_UPLOAD,
      entity: AuditEntity.IMAGE,
      entityId: propertyId,
      entityTitle: property.title,
      performedBy,
      metadata: { count: uploadedImages.length },
    });

    return uploadedImages;
  }

  async setPrimaryImage(
    propertyId: string,
    imageId: string,
    performedBy: User,
  ): Promise<PropertyImage> {
    const property = await this.propertiesService.findOne(propertyId);

    await this.imageRepository
      .createQueryBuilder()
      .update(PropertyImage)
      .set({ isPrimary: false })
      .where('property_id = :propertyId', { propertyId: property.id })
      .execute();

    const image = await this.imageRepository.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');

    image.isPrimary = true;
    const saved = await this.imageRepository.save(image);

    await this.auditLogsService.log({
      action: AuditAction.UPDATE,
      entity: AuditEntity.IMAGE,
      entityId: imageId,
      entityTitle: property.title,
      performedBy,
      metadata: { action: 'set-primary' },
    });

    return saved;
  }

  async deleteImage(
    propertyId: string,
    imageId: string,
    performedBy: User,
  ): Promise<{ message: string }> {
    const property = await this.propertiesService.findOne(propertyId);

    const image = await this.imageRepository.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');

    await cloudinary.uploader.destroy(image.publicId);
    await this.imageRepository.remove(image);

    await this.auditLogsService.log({
      action: AuditAction.IMAGE_DELETE,
      entity: AuditEntity.IMAGE,
      entityId: imageId,
      entityTitle: property.title,
      performedBy,
      metadata: { publicId: image.publicId },
    });

    return { message: 'Image deleted successfully' };
  }
}