export type Business = {
  id: string;
  name: string;
  email: string;
  description: string | null;
  ownerId: string;
  phone: string | null;
  cancellationWindowHours: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  type:
    | "RESTAURANT"
    | "BARBERSHOP"
    | "COWORKING"
    | "SALON"
    | "FITNESS"
    | "MEDICAL"
    | "TUTORING";
  viewCount: number;
  createdAt: string;
  deletedAt: string | null;
  updatedAt: string;
};
