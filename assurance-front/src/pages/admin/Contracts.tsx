import { Button, Paper, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable, { type Column } from "../../components/DataTable";
import { adminService } from "../../services/admin.service";

export default function AdminContracts() {
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminContracts"],
    queryFn: adminService.listContracts,
  });

  const validateMutation = useMutation({
    mutationFn: (num: string) => adminService.validateContract(num),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["adminContracts"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (num: string) => adminService.rejectContract(num),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["adminContracts"] });
    },
  });

  if (isLoading) return <Typography>Chargement...</Typography>;
  if (isError) return (
    <Paper sx={{ p: 2 }}>
      <Typography color="error">Impossible de charger les contrats.</Typography>
      <Button onClick={() => refetch()}>Réessayer</Button>
    </Paper>
  );

  const rows = data ?? [];

  const columns: Column<any>[] = [
    { key: "num", header: "Numéro", render: (c) => c.numContrat ?? c.num },
    { key: "type", header: "Type", render: (c) => c.type ?? "-" },
    { key: "date", header: "Date", render: (c) => c.date ?? "-" },
    { key: "valide", header: "Valide", render: (c) => String(c.valide) },
    { key: "vehicle", header: "Véhicule", render: (c) => c.vehiculeMatricule ?? c.vehicule?.matricule ?? "-" },
    { key: "client", header: "Client", render: (c) => c.clientEmail ?? c.client?.email ?? "-" },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => validateMutation.mutate(c.numContrat ?? c.num)}>Valider</Button>
          <Button size="small" color="error" onClick={() => rejectMutation.mutate(c.numContrat ?? c.num)}>Rejeter</Button>
          <Button size="small" onClick={async () => {
            try {
              const res = await adminService.downloadContractPdf(c.numContrat ?? c.num);
              const blob = new Blob([res.data], { type: res.contentType });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = res.fileName || 'contract.pdf';
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (e) {
              // ignore for now
            }
          }}>Télécharger PDF</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Contrats (Admin)</Typography>
      <Paper sx={{ p: 2 }}>
        <DataTable columns={columns} rows={rows} />
      </Paper>
    </Stack>
  );
}
