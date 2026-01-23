export type ClaimStatus = "DECLARED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CLOSED";

export interface Claim {
  id: number | string;
  claimNumber?: string;
  status: ClaimStatus;
  accidentDate: string;     // ISO date: "2026-01-17"
  location: string;
  description?: string;
  vehicleId?: number | string;
}