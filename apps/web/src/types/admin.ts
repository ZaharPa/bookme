export type BusinessStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdminBusinesses = {
  id: string;
  name: string;
  email: string;
  type: string;
  status: BusinessStatus;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "BUSINESS_OWNER" | "ADMIN";
  bannedAt: string | null;
};

export type Stats = {
  newUsers: number;
  newBusinesses: number;
  bookings: { count: number; totalCents: number };
};
