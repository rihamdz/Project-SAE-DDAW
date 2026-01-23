import { api } from "../api/axios";
import type { Claim, ClaimStatus } from "../types/claim";
import type { ClaimStep, StepStatus } from "../types/claimStep";

export type AddStepPayload = {
  stepName: string;
  stepStatus: StepStatus;
  comment?: string;
};

export const adminService = {
  async listClaims(): Promise<Claim[]> {
    const { data } = await api.get<Claim[]>("/admin/claims");
    return data;
  },

  async getClaim(id: string | number): Promise<Claim> {
    const { data } = await api.get<Claim>(`/admin/claims/${id}`);
    return data;
  },

  async updateClaimStatus(id: string | number, status: ClaimStatus): Promise<Claim> {
    const { data } = await api.patch<Claim>(`/admin/claims/${id}/status`, { status });
    return data;
  },

  async getClaimSteps(id: string | number): Promise<ClaimStep[]> {
    const { data } = await api.get<ClaimStep[]>(`/admin/claims/${id}/steps`);
    return data;
  },

  async addClaimStep(id: string | number, payload: AddStepPayload): Promise<ClaimStep> {
    const { data } = await api.post<ClaimStep>(`/admin/claims/${id}/steps`, payload);
    return data;
  },
};

