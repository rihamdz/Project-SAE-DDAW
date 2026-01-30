import { api } from "../api/axios";
import type { ClaimDocument } from "../types/document";

export const documentService = {
  async uploadDocument(
    claimId: string | number,
    file: File
  ): Promise<ClaimDocument> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<ClaimDocument>(
      `/clients/me/claims/${claimId}/documents`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return data;
  },

  async getDocuments(claimId: string | number): Promise<ClaimDocument[]> {
    const { data } = await api.get<ClaimDocument[]>(
      `/clients/me/claims/${claimId}/documents`
    );
    return data;
  },
};
