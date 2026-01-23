import { api } from "../api/axios";
import type { Vehicle } from "../types/vehicle";

export const vehicleService = {
  async getMyVehicles(): Promise<Vehicle[]> {
    const { data } = await api.get<Vehicle[]>("/clients/me/vehicles");
    return data;
  },

  async addMyVehicle(payload: {
    matricule: string;
    marque: string;
    modele: string;
    annee: number;
  }): Promise<Vehicle> {
    const { data } = await api.post<Vehicle>("/clients/me/vehicles", payload);
    return data;
  },
};
