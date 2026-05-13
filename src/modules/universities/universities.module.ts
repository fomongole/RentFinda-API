import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { University } from './entities/university.entity';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([University])],
  providers: [UniversitiesService],
  controllers: [UniversitiesController],
  exports: [UniversitiesService], // exported so PropertiesModule can resolve university FKs
})
export class UniversitiesModule {}