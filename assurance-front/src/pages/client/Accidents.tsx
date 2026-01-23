import { Stack, Typography, Grid, Paper } from "@mui/material";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SkeletonTable from "../../components/SkeletonTable";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import SearchBar from "../../components/SearchBar";
import DataTable, { type Column } from "../../components/DataTable";

import { claimService, type ClaimDto } from "../../services/claim.service";
import AccidentCreate from "./AccidentCreate";

export default function Accidents() {
  const [search, setSearch] = useState("");

  const accidentsQuery = useQuery({
    queryKey: ["myAccidents"],
    queryFn: claimService.getMyAccidents, // ✅ ICI
  });

  const rows = accidentsQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((c) => {
      const hay = `${c.id} ${c.accidentDate} ${c.vehicleMatricule ?? ""} ${c.location ?? ""} ${c.description ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  const columns: Column<ClaimDto>[] = [
    { key: "id", header: "ID", render: (c) => c.id },
    { key: "accidentDate", header: "Date", render: (c) => c.accidentDate },
    { key: "vehicleMatricule", header: "Véhicule", render: (c) => c.vehicleMatricule ?? "—" },
    { key: "status", header: "Statut", render: (c) => c.status },
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
            <Typography variant="overline" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h4">{rows.length}</Typography>
          </Paper>
        </Grid>
         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AccidentCreate></AccidentCreate>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par date, véhicule..."
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
