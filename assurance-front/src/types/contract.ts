export type ContractStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface Contract {
  id: number | string;
  contractNumber?: string;
  type: string; // tiers, tous risques...
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: ContractStatus;

  vehicleId: number | string;
}
