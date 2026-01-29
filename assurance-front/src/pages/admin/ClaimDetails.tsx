import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";

import SkeletonTable from "../../components/SkeletonTable";
import ErrorState from "../../components/ErrorState";
import StatusChip from "../../components/StatusChip";
import TimelineSteps from "../../components/TimelineSteps";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import type { ClaimStatus } from "../../types/claim";
import type { StepStatus } from "../../types/claimStep";
import { adminService } from "../../services/admin.service";

const CLAIM_STATUSES: ClaimStatus[] = ["DECLARED", "IN_REVIEW", "APPROVED", "REJECTED", "CLOSED"];
const STEP_STATUSES: StepStatus[] = ["PENDING", "IN_PROGRESS", "DONE", "REJECTED"];

const stepSchema = z.object({
  stepName: z.string().min(2, "Nom d’étape obligatoire"),
  stepStatus: z.enum(["PENDING", "IN_PROGRESS", "DONE", "REJECTED"]),
  comment: z.string().optional(),
});
type StepForm = z.infer<typeof stepSchema>;

export default function AdminClaimDetails() {
  const { id } = useParams();
  const claimId = id as string;
  const qc = useQueryClient();
  const [msg, setMsg] = useState<string | null>(null);

  const claimQuery = useQuery({
    queryKey: ["adminClaim", claimId],
    queryFn: () => adminService.getClaim(claimId),
    enabled: !!claimId,
  });

  const stepsQuery = useQuery({
    queryKey: ["adminClaimSteps", claimId],
    queryFn: () => adminService.getClaimSteps(claimId),
    enabled: !!claimId,
  });

  const docsQuery = useQuery({
    queryKey: ["adminClaimDocs", claimId],
    queryFn: () => adminService.listClaimDocuments(claimId),
    enabled: !!claimId,
  });

  const updateStatus = useMutation({
    mutationFn: (status: ClaimStatus) => adminService.updateClaimStatus(claimId, status),
    onSuccess: async () => {
      setMsg("Statut mis à jour ✅");
      await qc.invalidateQueries({ queryKey: ["adminClaim", claimId] });
      await qc.invalidateQueries({ queryKey: ["adminClaims"] });
      setTimeout(() => setMsg(null), 2000);
    },
    onError: () => setMsg("Erreur lors de la mise à jour du statut."),
  });

  const addStep = useMutation({
    mutationFn: (payload: StepForm) => adminService.addClaimStep(claimId, payload),
    onSuccess: async () => {
      setMsg("Étape ajoutée ✅");
      await qc.invalidateQueries({ queryKey: ["adminClaimSteps", claimId] });
      setTimeout(() => setMsg(null), 2000);
    },
    onError: () => setMsg("Erreur lors de l’ajout de l’étape."),
  });

  const downloadDoc = async (docId: string | number) => {
    try {
      const res = await adminService.downloadClaimDocument(claimId, docId);
      const blob = new Blob([res.data], { type: res.contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setMsg('Erreur lors du téléchargement du document.');
    }
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StepForm>({
    resolver: zodResolver(stepSchema),
    defaultValues: { stepName: "", stepStatus: "PENDING", comment: "" },
  });

  if (claimQuery.isLoading || stepsQuery.isLoading) return <SkeletonTable rows={8} />;

  if (claimQuery.isError || !claimQuery.data) {
    return (
      <ErrorState
        message="Impossible de charger le sinistre (admin). Vérifie les URLs placeholders."
        onRetry={() => {
          claimQuery.refetch();
          stepsQuery.refetch();
        }}
      />
    );
  }

  const claim = claimQuery.data;
  const steps = stepsQuery.data ?? [];

  const onSubmitStep = (values: StepForm) => {
    setMsg(null);
    addStep.mutate(values);
    reset({ stepName: "", stepStatus: "PENDING", comment: "" });
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h4">Sinistre #{claim.claimNumber ?? claim.id}</Typography>
        <StatusChip status={claim.status} />
      </Stack>

      {msg ? <Alert severity={msg.includes("Erreur") ? "error" : "success"}>{msg}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography><b>Date:</b> {claim.accidentDate}</Typography>
          <Typography><b>Lieu:</b> {claim.location}</Typography>
          {claim.description ? <Typography><b>Description:</b> {claim.description}</Typography> : null}

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap">
            <TextField
              select
              size="small"
              label="Changer le statut"
              value={claim.status}
              sx={{ minWidth: 220 }}
              onChange={(e) => updateStatus.mutate(e.target.value as ClaimStatus)}
            >
              {CLAIM_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              disabled={updateStatus.isPending}
              onClick={() => {
                claimQuery.refetch();
                stepsQuery.refetch();
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Documents</Typography>

        {docsQuery.isLoading ? (
          <Typography>Chargement des documents...</Typography>
        ) : docsQuery.isError ? (
          <Typography color="error">Impossible de charger les documents.</Typography>
        ) : (
          (docsQuery.data ?? []).map((d: any) => (
            <Stack key={d.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography>{d.fileName}</Typography>
              <Button size="small" startIcon={<CloudDownloadIcon />} onClick={() => downloadDoc(d.id)}>
                Télécharger
              </Button>
            </Stack>
          ))
        )}
      </Paper>

      <TimelineSteps steps={steps} />

      <Paper sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 900, mb: 1 }}>Ajouter une étape</Typography>

        <form onSubmit={handleSubmit(onSubmitStep)}>
          <Stack spacing={2}>
            <TextField
              label="Nom de l’étape"
              fullWidth
              error={!!errors.stepName}
              helperText={errors.stepName?.message}
              {...register("stepName")}
            />

            <TextField
              select
              label="Statut étape"
              fullWidth
              error={!!errors.stepStatus}
              helperText={errors.stepStatus?.message}
              defaultValue="PENDING"
              {...register("stepStatus")}
            >
              {STEP_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Commentaire (optionnel)"
              fullWidth
              multiline
              minRows={3}
              {...register("comment")}
            />

            <Button type="submit" variant="contained" disabled={addStep.isPending}>
              {addStep.isPending ? "Ajout..." : "Ajouter l’étape"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}