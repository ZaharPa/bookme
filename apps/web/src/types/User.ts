export type User = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "BUSINESS_OWNER" | "ADMIN";
  emailVerifiedAt: string | null;
  bannedAt: string | null;
  createdAt: string;
};
