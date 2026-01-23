import { api } from "../api/axios";
import type { ClaimDocument } from "../types/document";

export const documentService = {
  async uploadDocument(
    claimId: string | number,
    file: File
  ): Promise<ClaimDocument> {
    const formData = new FormData();
    formData.append("file", file);

    // 🔴 URL PLACEHOLDER — À MODIFIER PLUS TARD
    const { data } = await api.post<ClaimDocument>(
      `/CLAIM_DOCUMENT_UPLOAD_URL/${claimId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return data;
  },

  async getDocuments(claimId: string | number): Promise<ClaimDocument[]> {
    // 🔴 URL PLACEHOLDER — À MODIFIER PLUS TARD
    const { data } = await api.get<ClaimDocument[]>(
      `/CLAIM_DOCUMENT_LIST_URL/${claimId}`
    );
    return data;
  },
};
