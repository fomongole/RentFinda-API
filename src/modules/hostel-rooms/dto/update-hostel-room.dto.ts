import { PartialType } from '@nestjs/swagger';
import { CreateHostelRoomDto } from './create-hostel-room.dto';

export class UpdateHostelRoomDto extends PartialType(CreateHostelRoomDto) {}