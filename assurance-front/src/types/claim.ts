
export type ClaimStatus = "PENDING" | "DECLARED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"; 
export interface Claim {
  id: number | string;
  claimNumber?: string | number | null;
  status: ClaimStatus;
  accidentDate: string;
  location: string;
  description?: string;
  vehicleId?: number | string;
}
