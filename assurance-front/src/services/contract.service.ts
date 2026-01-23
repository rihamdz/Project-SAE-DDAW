// services/contract.service.ts
import { api } from "../api/axios";

export const contractService = {
  getMyContracts: async () => {
    const { data } = await api.get("/contracts/me");
    return data;
  },

  uploadContractPdf: async (matricule: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const { data } = await api.put(`/contracts/vehicle/${matricule}/pdf`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  downloadContractPdfUrl: (matricule: string) =>
    `${import.meta.env.VITE_API_URL ?? "http://localhost:8080"}/api/contracts/vehicle/${matricule}/pdf`,
};
