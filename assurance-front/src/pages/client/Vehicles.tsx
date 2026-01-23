import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable, { type Column } from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import { vehicleService } from "../../services/vehicle.service";
import type { Vehicle } from "../../types/vehicle";
import { useMemo, useState } from "react";
import SkeletonTable from "../../components/SkeletonTable";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import { api } from "../../api/axios";

async function uploadContractPdf(matricule: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const { data } = await api.put(`/contracts/vehicle/${matricule}/pdf`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export default function Vehicles() {
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myVehicles"],
    queryFn: vehicleService.getMyVehicles,
  });

  const [search, setSearch] = useState("");

  // dialog state
  const [open, setOpen] = useState(false);
  const [matricule, setMatricule] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [annee, setAnnee] = useState<number>(2022);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);

  const addMutation = useMutation({
    mutationFn: async () => {
      // 1) add vehicle
      const created = await vehicleService.addMyVehicle({
        matricule: matricule.trim(),
        marque: marque.trim(),
        modele: modele.trim(),
        annee: Number(annee),
      });

      // 2) upload pdf if provided
      if (pdfFile) {
        await uploadContractPdf(matricule.trim(), pdfFile);
      }

      return created;
    },
    onSuccess: async () => {
      setFormOk(pdfFile ? "Véhicule ajouté + contrat PDF uploadé ✅" : "Véhicule ajouté ✅");

      // reset fields
      setMatricule("");
      setMarque("");
      setModele("");
      setAnnee(new Date().getFullYear());
      setPdfFile(null);
      setFormError(null);

      // refresh lists
      await qc.invalidateQueries({ queryKey: ["myVehicles"] });
      await qc.invalidateQueries({ queryKey: ["myContracts"] });

      // close dialog after a short moment (optional)
      setOpen(false);
      setFormOk(null);
    },
    onError: (err: any) => {
      // si vehicle ajouté mais upload pdf échoue, tu peux voir err.response...
      setFormOk(null);
      setFormError(
        err?.response?.data?.message ||
          "Impossible d’ajouter le véhicule (ou d’uploader le PDF). Vérifie les champs / immatriculation."
      );
    },
  });

  const rows = data ?? [];

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((v: any) => {
      const hay = [
        v.marque ?? v.brand ?? "",
        v.modele ?? v.model ?? "",
        v.matricule ?? v.plateNumber ?? "",
        String(v.annee ?? v.year ?? ""),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [rows, search]);

  const columns: Column<Vehicle>[] = [
    { key: "brand", header: "Marque", render: (v: any) => v.marque ?? v.brand ?? "—" },
    { key: "model", header: "Modèle", render: (v: any) => v.modele ?? v.model ?? "—" },
    { key: "plate", header: "Immatriculation", render: (v: any) => v.matricule ?? v.plateNumber ?? "—" },
    { key: "year", header: "Année", render: (v: any) => v.annee ?? v.year ?? "—" },
  ];

  if (isLoading) return <SkeletonTable rows={7} />;

  if (isError) {
    return (
      <ErrorState
        message="Impossible de charger vos véhicules. Vérifie `/clients/me/vehicles` (ou ton endpoint actuel)."
        onRetry={() => refetch()}
      />
    );
  }

  const canSubmit =
    matricule.trim().length >= 2 &&
    marque.trim().length >= 2 &&
    modele.trim().length >= 1 &&
    String(annee).length === 4;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
        <Typography variant="h4">Mes véhicules</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Ajouter
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par marque, modèle, immatriculation…"
          />

          <Typography variant="body2" color="text.secondary">
            {filteredRows.length} véhicule(s)
          </Typography>

          {filteredRows.length === 0 ? (
            <EmptyState title="Aucun véhicule" description="Ajoutez un véhicule ou modifiez votre recherche." />
          ) : (
            <DataTable columns={columns} rows={filteredRows} />
          )}
        </Stack>
      </Paper>

      {/* Dialog Ajout */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un véhicule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Immatriculation"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="AA-123-BB"
              fullWidth
            />

            <TextField
              label="Marque"
              value={marque}
              onChange={(e) => setMarque(e.target.value)}
              placeholder="Peugeot"
              fullWidth
            />

            <TextField
              label="Modèle"
              value={modele}
              onChange={(e) => setModele(e.target.value)}
              placeholder="208"
              fullWidth
            />

            <TextField
              label="Année"
              type="number"
              value={annee}
              onChange={(e) => setAnnee(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1950, max: new Date().getFullYear() + 1 }}
            />

            {/* ✅ Upload PDF contrat */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                component="label"
              >
                {pdfFile ? "PDF sélectionné ✅" : "Choisir PDF contrat (optionnel)"}
                <input
                  hidden
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
              </Button>

              {pdfFile ? (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {pdfFile.name}
                </Typography>
              ) : null}
            </Stack>

            {formOk ? (
              <Typography color="success.main" variant="body2">
                {formOk}
              </Typography>
            ) : null}

            {formError ? (
              <Typography color="error" variant="body2">
                {formError}
              </Typography>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            disabled={!canSubmit || addMutation.isPending}
            onClick={() => {
              setFormError(null);
              setFormOk(null);
              addMutation.mutate();
            }}
          >
            {addMutation.isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
