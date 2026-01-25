// src/pages/client/Accidents.tsx
import { Stack, Typography, Grid, Paper } from "@mui/material";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SkeletonTable from "../../components/SkeletonTable";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import SearchBar from "../../components/SearchBar";
import DataTable, { type Column } from "../../components/DataTable";

import { claimService, type ClaimDto } from "../../services/claim.service";

export default function Accidents() {
  const [search, setSearch] = useState("");

  const accidentsQuery = useQuery({
    queryKey: ["myAccidents"],
    queryFn: claimService.getMyAccidents, // ✅
  });

  const rows = accidentsQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((a) => {
      const hay = `${a.id} ${a.accidentDate} ${a.vehicleMatricule ?? ""} ${a.location ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  const columns: Column<ClaimDto>[] = [
    { key: "id", header: "ID", render: (a) => a.id },
    { key: "accidentDate", header: "Date", render: (a) => a.accidentDate },
    { key: "vehicleMatricule", header: "Véhicule", render: (a) => a.vehicleMatricule ?? "—" },
    { key: "status", header: "Statut", render: (a) => a.status },
  ];

  if (accidentsQuery.isLoading) return <SkeletonTable rows={7} />;

  if (accidentsQuery.isError) {
    return (
      <ErrorState
        message="Impossible de charger vos accidents."
        onRetry={() => accidentsQuery.refetch()}
      />
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Mes accidents</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">Total</Typography>
            <Typography variant="h4">{rows.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par date, véhicule, lieu..."
          />

          {filtered.length === 0 ? (
            <EmptyState title="Aucun accident" description="Aucun accident trouvé." />
          ) : (
            <DataTable columns={columns} rows={filtered} />
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
