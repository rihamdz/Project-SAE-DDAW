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

  downloadContractPdf: async (matricule: string) => {
    const res = await api.get(`/contracts/vehicle/${encodeURIComponent(matricule)}/pdf`, { responseType: 'arraybuffer' });
    const contentType = res.headers['content-type'] || 'application/pdf';
    const cd = res.headers['content-disposition'] || '';
    let fileName = 'contract.pdf';
    const m = /filename="?([^";]+)"?/.exec(cd);
    if (m) fileName = m[1];
    return { data: res.data, contentType, fileName };
  },

  downloadContractPdfUrl: (matricule: string) =>
    `${import.meta.env.VITE_API_URL ?? "http://localhost:8080"}/api/contracts/vehicle/${matricule}/pdf`,
};
