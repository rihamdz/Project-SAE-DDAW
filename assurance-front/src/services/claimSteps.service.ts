import { api } from "../api/axios";
import type { ClaimStep } from "../types/claimStep";

export const claimStepsService = {
  async getSteps(claimId: string | number): Promise<ClaimStep[]> {
    const { data } = await api.get<ClaimStep[]>(`/claims/${claimId}/steps`);
    return data;
  },
};
