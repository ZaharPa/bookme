export type Availability = {
  capacity: number;
  booked: { startTime: string; endTime: string }[];
};

export type BookingInput = {
  resourceId: string;
  startTime: string;
  endTime: string;
};

export type BookingDetails = {
  id: string;
  status:
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "COMPLETED"
    | "NO_SHOW"
    | "CANCELLED"
    | "EXPIRED";
  startTime: string;
  endTime: string;
  totalAmountCents: number;
};
