export interface Vehicle {
  id: number | string;
  brand: string;          // marque
  model: string;          // modèle
  plateNumber: string;    // immatriculation
  year?: number;
}
