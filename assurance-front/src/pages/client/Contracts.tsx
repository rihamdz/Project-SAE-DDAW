import { Button, Paper, Stack, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import DataTable, { type Column } from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import SkeletonTable from "../../components/SkeletonTable";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";

import type { Contract } from "../../types/contract";
import { contractService } from "../../services/contract.service";

export default function Contracts() {
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myContracts"],
    queryFn: contractService.getMyContracts,
  });

  const [search, setSearch] = useState("");

  const rows = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((c: any) => {
      const hay = [
        c.numContrat ?? "",
        c.type ?? "",
        c.date ?? "",
        c.vehicleMatricule ?? "",
        c.vehicleMarque ?? "",
        c.vehicleModele ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [rows, search]);

  if (isLoading) return <SkeletonTable rows={7} />;

  if (isError) {
    return (
      <ErrorState
        message="Impossible de charger vos contrats. Vérifie l’API /contracts/me."
        onRetry={() => refetch()}
      />
    );
  }

  async function handleUploadPdf(matricule: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      await contractService.uploadContractPdf(matricule, file);
      // refresh list
      qc.invalidateQueries({ queryKey: ["myContracts"] });
    };
    input.click();
  }

  const columns: Column<Contract>[] = [
    { key: "num", header: "N°", render: (c: any) => c.numContrat ?? "—" },
    { key: "type", header: "Type", render: (c: any) => c.type ?? "—" },
    { key: "date", header: "Date", render: (c: any) => c.date ?? "—" },
    {
      key: "status",
      header: "Statut",
      render: (c: any) => (c.valide ? "VALIDE" : "INACTIF"),
    },
    {
      key: "veh",
      header: "Véhicule",
      render: (c: any) => c.vehicleMatricule ?? "—",
    },
    {
      key: "pdf",
      header: "Contrat PDF",
      render: (c: any) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => handleUploadPdf(c.vehicleMatricule)}>
            {c.hasPdf ? "Modifier PDF" : "Ajouter PDF"}
          </Button>

          {c.hasPdf && (
            <Button
              size="small"
              variant="text"
              component="a"
              href={contractService.downloadContractPdfUrl(c.vehicleMatricule)}
              target="_blank"
              rel="noreferrer"
            >
              Télécharger
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Mes contrats</Typography>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un contrat..." />

          {filtered.length === 0 ? (
            <EmptyState title="Aucun contrat" description="Vos contrats apparaîtront ici." />
          ) : (
            <DataTable columns={columns} rows={filtered} />
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
