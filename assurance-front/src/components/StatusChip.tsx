import { Chip } from "@mui/material";
import type { ClaimStatus } from "../types/claim";

function labelOf(status: ClaimStatus) {
  switch (status) {
    case "DECLARED":
      return "Déclaré";
    case "IN_REVIEW":
      return "En cours";
    case "APPROVED":
      return "Accepté";
    case "REJECTED":
      return "Refusé";
    case "CLOSED":
      return "Clôturé";
    default:
      return status;
  }
}

function colorOf(status: ClaimStatus): "default" | "primary" | "success" | "warning" | "error" {
  switch (status) {
    case "DECLARED":
      return "primary";
    case "IN_REVIEW":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    case "CLOSED":
      return "default";
    default:
      return "default";
  }
}

export default function StatusChip({ status }: { status: ClaimStatus }) {
  return <Chip size="small" label={labelOf(status)} color={colorOf(status)} />;
}
