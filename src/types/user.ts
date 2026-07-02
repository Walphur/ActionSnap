export type UserRole = "admin" | "photographer" | "racer";

export type UserIdentity = {
  id: string;
  email?: string | null;
  fullName?: string | null;
  role?: UserRole | null;
  isActive?: boolean | null;
};
