export type StepStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "REJECTED";

export interface ClaimStep {
  id: number | string;
  claimId: number | string;
  stepName: string;        // ex: "Déclaration", "Expertise", "Validation"
  stepStatus: StepStatus;  // PENDING / IN_PROGRESS / DONE
  createdAt?: string;      // ISO date-time
  comment?: string;
}
