import { Chip } from "@mui/material";
import type { ClaimStatus } from "../types/claim";

function labelOf(status: ClaimStatus) {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "DECLARED":
      return "Déclaré";
    case "IN_PROGRESS":
      return "En cours";
    case "RESOLVED":
      return "Résolu";
    case "REJECTED":
      return "Refusé";
    default:
      return status;
  }
}

function colorOf(status: ClaimStatus): "default" | "primary" | "success" | "warning" | "error" {
  switch (status) {
    case "PENDING":
      return "warning";
    case "DECLARED":
      return "primary";
    case "IN_PROGRESS":
      return "warning";
    case "RESOLVED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
}

export function StatusChip({ status }: { status: ClaimStatus }) {
  return <Chip size="small" label={labelOf(status)} color={colorOf(status)} />;
}

export default StatusChip;
