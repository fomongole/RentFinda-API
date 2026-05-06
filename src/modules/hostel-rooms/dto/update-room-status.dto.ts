import { IsEnum } from 'class-validator';
import { HostelRoomStatus } from '../enums/hostel-room-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoomStatusDto {
  @ApiProperty({ enum: HostelRoomStatus })
  @IsEnum(HostelRoomStatus)
  status: HostelRoomStatus;
}