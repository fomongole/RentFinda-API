import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PropertiesModule } from '../properties/properties.module';
import { HostelRoomsModule } from '../hostel-rooms/hostel-rooms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    PropertiesModule,
    HostelRoomsModule,
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}