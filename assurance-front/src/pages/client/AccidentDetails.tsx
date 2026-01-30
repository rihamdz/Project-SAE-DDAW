import { Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import StatusChip from "../../components/StatusChip";
import { claimService } from "../../services/claim.service";
import { claimStepsService } from "../../services/claimSteps.service";
import TimelineSteps from "../../components/TimelineSteps";
import DocumentUploader from "../../components/DocumentUploader";
import OtherVehicles from "../../components/OtherVehicles";

export default function AccidentDetails() {
  const { id } = useParams();

  const claimQuery = useQuery({
    queryKey: ["accident", id],
    queryFn: () => claimService.getClaim(id as string),
    enabled: !!id,
  });

  const stepsQuery = useQuery({
    queryKey: ["accidentSteps", id],
    queryFn: () => claimStepsService.getSteps(id as string),
    enabled: !!id,
  });

  if (claimQuery.isLoading || stepsQuery.isLoading) return <Loading />;

  if (claimQuery.isError || !claimQuery.data) {
    return (
      <Typography color="error">
        Impossible de charger l'accident. Vérifie `/accidents/{id}`.
      </Typography>
    );
  }

  const claim = claimQuery.data;
  const steps = stepsQuery.data ?? [];

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">
          Accident #{claim.id}
        </Typography>
        <StatusChip status={claim.status} />
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography><b>Date de l'accident:</b> {claim.accidentDate}</Typography>
          <Typography><b>Lieu:</b> {claim.location}</Typography>
          <Typography><b>Véhicule:</b> {claim.vehicleMatricule || "—"}</Typography>
          {claim.description ? <Typography><b>Description:</b> {claim.description}</Typography> : null}
        </Stack>
      </Paper>

      <Typography variant="h6">Tiers impliqués</Typography>
      <OtherVehicles claimId={claim.id} />

      <Typography variant="h6">Étapes du traitement</Typography>
      <TimelineSteps steps={steps} />

      <Typography variant="h6">Documents</Typography>
      <DocumentUploader claimId={claim.id.toString()} />

    </Stack>
  );
}
