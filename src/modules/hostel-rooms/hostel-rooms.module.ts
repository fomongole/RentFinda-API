import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostelRoom } from './entities/hostel-room.entity';
import { HostelRoomsService } from './hostel-rooms.service';
import { HostelRoomsController } from './hostel-rooms.controller';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HostelRoom]),
    PropertiesModule, // provides PropertiesService
  ],
  providers: [HostelRoomsService],
  controllers: [HostelRoomsController],
  exports: [HostelRoomsService], // exported so BookingsModule can call setStatus()
})
export class HostelRoomsModule {}