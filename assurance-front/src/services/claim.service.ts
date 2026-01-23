// src/services/claim.service.ts
import { api } from "../api/axios";

export type ClaimStatus = "PENDING" | "DECLARED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export type ClaimDto = {
  id: number;
  claimNumber: string | null;
  status: ClaimStatus;
  accidentDate: string;
  location: string;
  description: string;
  vehicleMatricule: string | null;
};

export type CreateClaimPayload = {
  vehicleId: string;        // matricule
  accidentDate: string;     // YYYY-MM-DD
  location: string;
  description: string;
};

export type DocumentDto = {
  id: number;
  fileName: string;
  contentType: string;
  uploadedAt: string;
};

async function getMyClaims(): Promise<ClaimDto[]> {
  const { data } = await api.get("/clients/me/claims");
  return data;
}

async function createWithRequiredDoc(payload: CreateClaimPayload, file: File): Promise<ClaimDto> {
  const form = new FormData();
  form.append("data", JSON.stringify(payload));
  form.append("file", file);

  const { data } = await api.post("/clients/me/claims", form);
  return data;
}


async function listDocuments(claimId: number): Promise<DocumentDto[]> {
  const { data } = await api.get(`/clients/me/claims/${claimId}/documents`);
  return data;
}

async function downloadDocument(claimId: number, docId: number): Promise<Blob> {
  const res = await api.get(`/clients/me/claims/${claimId}/documents/${docId}`, {
    responseType: "blob",
  });
  return res.data;
}

async function uploadDocument(claimId: number, file: File): Promise<DocumentDto> {
  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post(`/clients/me/claims/${claimId}/documents`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}


export const claimService = {
  getMyClaims,
  createWithRequiredDoc,
  listDocuments,
  downloadDocument,
  uploadDocument,
  async getMyAccidents(): Promise<ClaimDto[]> {
    const { data } = await api.get("/clients/me/claims");
    return data;
  }
};
