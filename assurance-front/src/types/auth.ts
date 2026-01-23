export type Role = "CLIENT" | "ADMIN";

export interface User {
  id: number | string;
  fullName?: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
