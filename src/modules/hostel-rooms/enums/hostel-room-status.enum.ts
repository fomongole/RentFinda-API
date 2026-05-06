export enum HostelRoomStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',     // has a pending/unconfirmed booking
  OCCUPIED = 'OCCUPIED',     // booking confirmed / renter moved in
  MAINTENANCE = 'MAINTENANCE', // temporarily unavailable
}