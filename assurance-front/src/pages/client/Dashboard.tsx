import { Stack, Typography } from "@mui/material";
import {Grid} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import StatCard from "../../components/StatCard";
import SkeletonCards from "../../components/SkeletonCards";
import ErrorState from "../../components/ErrorState";
import { vehicleService } from "../../services/vehicle.service";
import { claimService } from "../../services/claim.service";

export default function Dashboard() {
  const vehiclesQuery = useQuery({
    queryKey: ["myVehicles"],
    queryFn: vehicleService.getMyVehicles,
  });

  const claimsQuery = useQuery({
    queryKey: ["myAccidents"], // ✅ même clé que la page Accidents
    queryFn: claimService.getMyAccidents, // ✅ endpoint GET /clients/claims/me
  });

  if (vehiclesQuery.isLoading || claimsQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="h4">Tableau de bord</Typography>
        <SkeletonCards count={4} />
      </Stack>
    );
  }

  if (vehiclesQuery.isError || claimsQuery.isError) {
    return (
      <ErrorState
        message="Impossible de charger le dashboard (vérifie les endpoints véhicules/sinistres)."
        onRetry={() => {
          vehiclesQuery.refetch();
          claimsQuery.refetch();
        }}
      />
    );
  }

  const vehicles = vehiclesQuery.data ?? [];
  const claims = claimsQuery.data ?? [];

  // ✅ selon ton enum ClaimStatus
  const opened = claims.filter(
    (c) => c.status === "DECLARED" || c.status === "IN_PROGRESS" || c.status === "PENDING"
  ).length;

  const closed = claims.filter(
    (c) => c.status === "RESOLVED" || c.status === "REJECTED"
  ).length;

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Tableau de bord</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Véhicules" value={vehicles.length} helper="Vos voitures" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Sinistres" value={claims.length} helper="Tous dossiers" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Ouverts" value={opened} helper="En traitement" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Clôturés" value={closed} helper="Terminés" />
        </Grid>
      </Grid>
    </Stack>
  );
}
