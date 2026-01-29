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

  // Contracts (admin)
  async listContracts(): Promise<any[]> {
    const { data } = await api.get<any[]>("/admin/contracts");
    return data;
  },

  async validateContract(num: string) {
    const { data } = await api.patch(`/admin/contracts/${encodeURIComponent(num)}/validate`);
    return data;
  },

  async rejectContract(num: string) {
    const { data } = await api.patch(`/admin/contracts/${encodeURIComponent(num)}/reject`);
    return data;
  },

  async downloadContractPdf(num: string) {
    const res = await api.get(`/admin/contracts/${encodeURIComponent(num)}/pdf`, { responseType: 'arraybuffer' });
    const contentType = res.headers['content-type'] || 'application/pdf';
    const cd = res.headers['content-disposition'] || '';
    let fileName = 'contract.pdf';
    const m = /filename="?([^";]+)"?/.exec(cd);
    if (m) fileName = m[1];
    return { data: res.data, contentType, fileName };
  }
  ,

  // Claim documents
  async listClaimDocuments(id: string | number): Promise<any[]> {
    const { data } = await api.get<any[]>(`/admin/claims/${id}/documents`);
    return data;
  },

  async downloadClaimDocument(id: string | number, docId: string | number) {
    const res = await api.get(`/admin/claims/${id}/documents/${docId}`, { responseType: 'arraybuffer' });
    const contentType = res.headers['content-type'] || 'application/octet-stream';
    const cd = res.headers['content-disposition'] || '';
    let fileName = 'document';
    const m = /filename="?([^";]+)"?/.exec(cd);
    if (m) fileName = m[1];
    return { data: res.data, contentType, fileName };
  }
};

