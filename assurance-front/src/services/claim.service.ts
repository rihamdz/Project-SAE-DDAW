// src/services/claim.service.ts
import { api } from "../api/axios";
import type { Claim } from "../types/claim";

export type ClaimStatus =
  | "PENDING"
  | "DECLARED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED";

export type ClaimDto = {
  id: number;
  claimNumber: number | null;
  status: ClaimStatus;
  accidentDate: string;     // "YYYY-MM-DD"
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
  uploadedAt: string | null;
};

async function getMyClaims(): Promise<Claim[]> {
  const { data } = await api.get("/clients/me/claims");

  // Transforme ClaimDto -> Claim
  return data.map((c: ClaimDto) => ({
    ...c,
    claimNumber: c.claimNumber != null ? String(c.claimNumber) : undefined,
  }));
}



// alias accidents = claims
async function getMyAccidents(): Promise<ClaimDto[]> {
  const { data } = await api.get("/clients/me/claims");
  return data;
}

async function getClaim(claimId: string | number): Promise<ClaimDto> {
  const { data } = await api.get(`/clients/me/claims/${claimId}`);
  return data;
}

// IMPORTANT: envoie data en JSON Blob => Spring @RequestPart("data") marche bien
async function createWithRequiredDoc(payload: CreateClaimPayload, file: File): Promise<ClaimDto> {
  const form = new FormData();

  form.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  form.append("file", file);

  const { data } = await api.post("/clients/me/claims", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

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
  getMyAccidents,
  getClaim,
  createWithRequiredDoc,
  listDocuments,
  downloadDocument,
  uploadDocument,
};
