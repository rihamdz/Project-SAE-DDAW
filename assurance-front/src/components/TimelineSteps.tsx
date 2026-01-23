import {
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import type { ClaimStep, StepStatus } from "../types/claimStep";

function statusLabel(s: StepStatus) {
  switch (s) {
    case "PENDING":
      return "En attente";
    case "IN_PROGRESS":
      return "En cours";
    case "DONE":
      return "Terminé";
    case "REJECTED":
      return "Refusé";
    default:
      return s;
  }
}

function chipColor(s: StepStatus): "default" | "success" | "warning" | "error" {
  switch (s) {
    case "DONE":
      return "success";
    case "IN_PROGRESS":
      return "warning";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
}

function dotColor(s: StepStatus): "grey" | "success" | "warning" | "error" {
  switch (s) {
    case "DONE":
      return "success";
    case "IN_PROGRESS":
      return "warning";
    case "REJECTED":
      return "error";
    default:
      return "grey";
  }
}

export default function TimelineSteps({ steps }: { steps: ClaimStep[] }) {
  if (!steps || steps.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="text.secondary">
          Aucune démarche disponible pour le moment.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 900 }}>Démarches</Typography>
        <Typography color="text.secondary" variant="body2">
          Suivez l’avancement de votre dossier étape par étape.
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Timeline sx={{ m: 0, p: 0 }}>
          {steps.map((s, idx) => (
            <TimelineItem key={s.id} sx={{ minHeight: 64 }}>
              <TimelineSeparator>
                <TimelineDot color={dotColor(s.stepStatus)} />
                {idx < steps.length - 1 ? <TimelineConnector /> : null}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 0.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography sx={{ fontWeight: 800 }}>{s.stepName}</Typography>
                  <Chip size="small" label={statusLabel(s.stepStatus)} color={chipColor(s.stepStatus)} />
                </Stack>

                {s.comment ? (
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                    {s.comment}
                  </Typography>
                ) : null}

                {s.createdAt ? (
                  <Typography color="text.secondary" variant="caption">
                    {new Date(s.createdAt).toLocaleString()}
                  </Typography>
                ) : null}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Stack>
    </Paper>
  );
}
