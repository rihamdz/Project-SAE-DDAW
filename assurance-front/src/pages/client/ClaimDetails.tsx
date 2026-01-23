import { Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import StatusChip from "../../components/StatusChip";
import { claimService } from "../../services/claim.service";
import { claimStepsService } from "../../services/claimSteps.service";
import TimelineSteps from "../../components/TimelineSteps";
import DocumentUploader from "../../components/DocumentUploader";

export default function ClaimDetails() {
  const { id } = useParams();

  const claimQuery = useQuery({
    queryKey: ["claim", id],
    queryFn: () => claimService.getClaim(id as string),
    enabled: !!id,
  });

  const stepsQuery = useQuery({
    queryKey: ["claimSteps", id],
    queryFn: () => claimStepsService.getSteps(id as string),
    enabled: !!id,
  });

  if (claimQuery.isLoading || stepsQuery.isLoading) return <Loading />;

  if (claimQuery.isError || !claimQuery.data) {
    return (
      <Typography color="error">
        Impossible de charger le sinistre. Vérifie `/claims/{id}`.
      </Typography>
    );
  }

  const claim = claimQuery.data;
  const steps = stepsQuery.data ?? [];

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">
          Sinistre #{claim.claimNumber ?? claim.id}
        </Typography>
        <StatusChip status={claim.status} />
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography><b>Date:</b> {claim.accidentDate}</Typography>
          <Typography><b>Lieu:</b> {claim.location}</Typography>
          {claim.description ? <Typography><b>Description:</b> {claim.description}</Typography> : null}
        </Stack>
      </Paper>

      <TimelineSteps steps={steps} />
      <DocumentUploader claimId={claim.id.toString()} />

    </Stack>
  );
}
