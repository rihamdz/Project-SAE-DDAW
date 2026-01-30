// src/services/otherVehicle.service.ts
import { api } from "../api/axios";

export type OtherVehicleDto = {
  id: number;
  matricule: string;
  marque?: string;
  modele?: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  insuranceNumber?: string;
};

export type AddOtherVehicleRequest = {
  matricule: string;
  marque?: string;
  modele?: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  insuranceNumber?: string;
};

export const otherVehicleService = {
  async getOtherVehicles(claimId: string | number, isAdmin: boolean = false): Promise<OtherVehicleDto[]> {
    const baseUrl = isAdmin ? "/admin/claims" : "/clients/me/claims";
    const { data } = await api.get<OtherVehicleDto[]>(
      `${baseUrl}/${claimId}/other-vehicles`
    );
    return data;
  },

  async addOtherVehicle(
    claimId: string | number,
    payload: AddOtherVehicleRequest,
    isAdmin: boolean = false
  ): Promise<OtherVehicleDto> {
    const baseUrl = isAdmin ? "/admin/claims" : "/clients/me/claims";
    const { data } = await api.post<OtherVehicleDto>(
      `${baseUrl}/${claimId}/other-vehicles`,
      payload
    );
    return data;
  },

  async removeOtherVehicle(
    claimId: string | number,
    vehicleId: string | number,
    isAdmin: boolean = false
  ): Promise<void> {
    const baseUrl = isAdmin ? "/admin/claims" : "/clients/me/claims";
    await api.delete(`${baseUrl}/${claimId}/other-vehicles/${vehicleId}`);
  },
};
