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
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Loading from "../../components/Loading";
import { claimService } from "../../services/claim.service";
import { vehicleService } from "../../services/vehicle.service";

const schema = z.object({
  vehicleId: z.union([z.string().min(1), z.number()]),
  accidentDate: z.string().min(10, "Date obligatoire"),
  location: z.string().min(2, "Lieu obligatoire"),
  description: z.string().min(10, "Description min 10 caractères"),
});

type FormValues = z.infer<typeof schema>;

export default function ClaimCreate() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const vehiclesQuery = useQuery({
    queryKey: ["myVehicles"],
    queryFn: vehicleService.getMyVehicles,
  });

  const mutation = useMutation({
    mutationFn: claimService.createClaim,
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: ["myClaims"] });
      navigate(`/client/claims/${created.id}`, { replace: true });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Impossible de créer la déclaration.";
      setErrorMsg(message);
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: "",
      accidentDate: "",
      location: "",
      description: "",
    },
  });

  if (vehiclesQuery.isLoading) return <Loading />;

  const vehicles = vehiclesQuery.data ?? [];

  const onSubmit = (values: FormValues) => {
    setErrorMsg(null);
    // vehicleId peut être string => on garde tel quel (backend gère), sinon cast number si tu veux
    mutation.mutate({
      vehicleId: values.vehicleId,
      accidentDate: values.accidentDate,
      location: values.location,
      description: values.description,
    });
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
              error={!!errors.vehicleId}
              helperText={errors.vehicleId?.message as string | undefined}
              defaultValue=""
              {...register("vehicleId")}
            >
              {vehicles.length === 0 ? (
                <MenuItem value="" disabled>
                  Aucun véhicule disponible
                </MenuItem>
              ) : (
                vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.brand} {v.model} — {v.plateNumber}
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
              multiline
              minRows={4}
              fullWidth
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register("description")}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending || vehicles.length === 0}
            >
              {mutation.isPending ? "Envoi..." : "Envoyer la déclaration"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
