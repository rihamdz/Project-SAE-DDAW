import { Stack, Typography, Button, Paper } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import SkeletonTable from "../../components/SkeletonTable";
import ErrorState from "../../components/ErrorState";
import DataTable, { type Column } from "../../components/DataTable";
import StatusChip from "../../components/StatusChip";
import type { Claim } from "../../types/claim";
import { adminService } from "../../services/admin.service";

export default function AdminClaims() {
  const q = useQuery({
    queryKey: ["adminClaims"],
    queryFn: adminService.listClaims,
  });

  if (q.isLoading) return <SkeletonTable rows={8} />;

  if (q.isError) {
    return (
      <ErrorState
        message="Impossible de charger les sinistres (admin). Vérifie l’URL placeholder."
        onRetry={() => q.refetch()}
      />
    );
  }

  const rows = q.data ?? [];

  const columns: Column<Claim>[] = [
    { key: "id", header: "N°", render: (c) => c.claimNumber ?? c.id },
    { key: "date", header: "Date", render: (c) => c.accidentDate },
    { key: "loc", header: "Lieu", render: (c) => c.location },
    { key: "status", header: "Statut", render: (c) => <StatusChip status={c.status} /> },
    {
      key: "action",
      header: "Action",
      render: (c) => (
        <Button component={Link} to={`/admin/claims/${c.id}`} variant="text">
          Ouvrir
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Sinistres (Admin)</Typography>

      <Paper sx={{ p: 2 }}>
        <DataTable columns={columns} rows={rows} />
      </Paper>
    </Stack>
  );
}
