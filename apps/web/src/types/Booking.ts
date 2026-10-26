export type Availability = {
  capacity: number;
  booked: { startTime: string; endTime: string }[];
};

export type BookingInput = {
  resourceId: string;
  startTime: string;
  endTime: string;
};
