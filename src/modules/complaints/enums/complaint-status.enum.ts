export enum ComplaintStatus {
  OPEN        = 'OPEN',         // just submitted, not yet reviewed
  IN_PROGRESS = 'IN_PROGRESS',  // admin is actively handling it
  RESOLVED    = 'RESOLVED',     // issue addressed; renter informed (if contact given)
  CLOSED      = 'CLOSED',       // no further action needed / spam / duplicate
}