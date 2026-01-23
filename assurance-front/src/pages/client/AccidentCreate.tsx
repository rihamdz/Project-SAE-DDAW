// AccidentCreate.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import SkeletonTable from "../../components/SkeletonTable";
import { vehicleService } from "../../services/vehicle.service";
import { claimService } from "../../services/claim.service";

const schema = z.object({
  vehicleId: z.string().min(2, "Choisis un véhicule"),
  accidentDate: z.string().min(10, "Date obligatoire"),
  location: z.string().min(1, "Lieu obligatoire"),
  description: z.string().min(1, "Description obligatoire"),
});

type FormValues = z.infer<typeof schema>;

export default function AccidentCreate() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const vehiclesQuery = useQuery({
    queryKey: ["myVehicles"],
    queryFn: vehicleService.getMyVehicles,
  });

  const mutation = useMutation({
    mutationFn: async (payload: FormValues) => {
      if (!file) throw new Error("Document obligatoire");
      return claimService.createWithRequiredDoc(payload, file);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["myClaims"] });
      navigate("/client/accidents", { replace: true });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Impossible d’envoyer la déclaration.";
      setErrorMsg(msg);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vehicleId: "", accidentDate: "", location: "", description: "" },
  });

  if (vehiclesQuery.isLoading) return <SkeletonTable rows={6} />;

  const vehicles: any[] = vehiclesQuery.data ?? [];

  const onSubmit = (values: FormValues) => {
    setErrorMsg(null);
    mutation.mutate(values);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Déclarer un accident</Typography>

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              select
              label="Véhicule"
              fullWidth
              defaultValue=""
              error={!!errors.vehicleId}
              helperText={errors.vehicleId?.message}
              {...register("vehicleId")}
            >
              {vehicles.length === 0 ? (
                <MenuItem value="" disabled>Aucun véhicule disponible</MenuItem>
              ) : (
                vehicles.map((v) => (
                  <MenuItem key={v.matricule} value={v.matricule}>
                    {v.matricule + " — " + (v.marque ?? "") + " " + (v.modele ?? "")}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="Date de l’accident"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={!!errors.accidentDate}
              helperText={errors.accidentDate?.message}
              {...register("accidentDate")}
            />

            <TextField
              label="Lieu"
              fullWidth
              error={!!errors.location}
              helperText={errors.location?.message}
              {...register("location")}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register("description")}
            />

            {/* ✅ Upload obligatoire */}
            <Button variant="outlined" component="label">
              {file ? `Document: ${file.name}` : "Ajouter le document (obligatoire)"}
              <input
                hidden
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={mutation.isPending || vehicles.length === 0}
            >
              {mutation.isPending ? "Envoi..." : "Envoyer"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
