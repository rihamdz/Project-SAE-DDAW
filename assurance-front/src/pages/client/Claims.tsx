import { Button, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

import DataTable, { type Column } from "../../components/DataTable";
import StatusChip from "../../components/StatusChip";
import SearchBar from "../../components/SearchBar";
import SkeletonTable from "../../components/SkeletonTable";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";

import { claimService } from "../../services/claim.service";
import type { Claim, ClaimStatus } from "../../types/claim";

type Filter = "ALL" | "OPEN" | "CLOSED" | ClaimStatus;

export default function Claims() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myClaims"],
    queryFn: claimService.getMyClaims,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  if (isLoading) return <SkeletonTable rows={7} />;

  if (isError) {
    return (
      <ErrorState
        message="Impossible de charger vos sinistres. Vérifie l’endpoint (ex: /claims/me)."
        onRetry={() => refetch()}
      />
    );
  }

  const rows = data ?? [];

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    const byFilter = rows.filter((c) => {
      if (filter === "ALL") return true;
      if (filter === "OPEN") return c.status === "DECLARED" || c.status === "IN_REVIEW";
      if (filter === "CLOSED") return c.status === "CLOSED";
      return c.status === filter;
    });

    if (!q) return byFilter;

    return byFilter.filter((c) => {
      const hay = [
        String(c.claimNumber ?? c.id),
        c.location,
        c.accidentDate,
        c.status,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, filter]);

  const columns: Column<Claim>[] = [
    { key: "number", header: "N°", render: (c) => c.claimNumber ?? c.id },
    { key: "date", header: "Date accident", render: (c) => c.accidentDate },
    { key: "loc", header: "Lieu", render: (c) => c.location },
    { key: "status", header: "Statut", render: (c) => <StatusChip status={c.status} /> },
    {
      key: "actions",
      header: "Action",
      render: (c) => (
        <Button component={Link} to={`/client/claims/${c.id}`} variant="text">
          Détails
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
      >
        <Typography variant="h4">Mes sinistres</Typography>

        <Button component={Link} to="/client/claims/new" variant="contained">
          Déclarer un accident
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par numéro, lieu, date, statut…"
          />

          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, v) => v && setFilter(v)}
            size="small"
          >
            <ToggleButton value="ALL">Tous</ToggleButton>
            <ToggleButton value="OPEN">Ouverts</ToggleButton>
            <ToggleButton value="CLOSED">Clôturés</ToggleButton>
            <ToggleButton value="DECLARED">Déclarés</ToggleButton>
            <ToggleButton value="IN_REVIEW">En cours</ToggleButton>
            <ToggleButton value="APPROVED">Acceptés</ToggleButton>
            <ToggleButton value="REJECTED">Refusés</ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="body2" color="text.secondary">
            {filteredRows.length} résultat(s)
          </Typography>

          {filteredRows.length === 0 ? (
            <EmptyState
              title="Aucun sinistre"
              description="Déclarez un accident ou modifiez votre recherche / filtre."
            />
          ) : (
            <DataTable columns={columns} rows={filteredRows} />
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
