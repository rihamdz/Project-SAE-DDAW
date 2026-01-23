
import { claimService, type ClaimDto } from "./claim.service";


export type Accident = ClaimDto;

export const accidentService = {
  getMyAccidents: claimService.getMyAccidents,
  createWithRequiredDoc: claimService.createWithRequiredDoc,
  listDocuments: claimService.listDocuments,
  downloadDocument: claimService.downloadDocument,
};
