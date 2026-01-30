// AccidentCreate.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Box } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DeleteIcon from "@mui/icons-material/Delete";

import SkeletonTable from "../../components/SkeletonTable";
import { vehicleService } from "../../services/vehicle.service";
import { claimService } from "../../services/claim.service";
import { otherVehicleService } from "../../services/otherVehicle.service";

const schema = z.object({
  vehicleId: z.string().min(2, "Choisis un véhicule"),
  accidentDate: z.string().min(10, "Date obligatoire"),
  location: z.string().min(1, "Lieu obligatoire"),
  description: z.string().min(1, "Description obligatoire"),
});

type FormValues = z.infer<typeof schema>;

const otherVehicleSchema = z.object({
  matricule: z.string().min(1, "Matricule obligatoire"),
  marque: z.string(),
  modele: z.string(),
  ownerName: z.string().min(1, "Nom du propriétaire obligatoire"),
  ownerPhone: z.string(),
  ownerEmail: z.string(),
  insuranceNumber: z.string(),
});

type OtherVehicleFormValues = z.infer<typeof otherVehicleSchema>;

type Props = {
  onSuccess?: () => void;
};
export default function AccidentCreate({ onSuccess }: Props) {
  const qc = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const vehiclesQuery = useQuery({
    queryKey: ["myVehicles"],
    queryFn: vehicleService.getMyVehicles,
  });

  const {
    register: registerOtherVehicle,
    handleSubmit: handleSubmitOtherVehicle,
    formState: { errors: otherVehicleErrors },
    reset: resetOtherVehicleForm,
  } = useForm<OtherVehicleFormValues>({
    resolver: zodResolver(otherVehicleSchema),
    defaultValues: { matricule: "", marque: "", modele: "", ownerName: "", ownerPhone: "", ownerEmail: "", insuranceNumber: "" },
  });

  const [openOtherVehicleDialog, setOpenOtherVehicleDialog] = useState(false);
  const [otherVehicles, setOtherVehicles] = useState<OtherVehicleFormValues[]>([]);
  const [isAddingVehicles, setIsAddingVehicles] = useState(false);

  const mutation = useMutation({
    mutationFn: async (payload: FormValues) => {
      if (!file) throw new Error("Document obligatoire");
      return claimService.createWithRequiredDoc(payload, file);
    },
    onSuccess: async (claim) => {
      if (otherVehicles.length > 0) {
        setIsAddingVehicles(true);
        try {
          for (const vehicle of otherVehicles) {
            await otherVehicleService.addOtherVehicle(claim.id, vehicle, false);
          }
        } catch (err) {
          console.error("Erreur lors de l'ajout des tiers impliqués", err);
        } finally {
          setIsAddingVehicles(false);
        }
      }
      await qc.invalidateQueries({ queryKey: ["myClaims", "myAccidents"] });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (err: any) => {
      let msg = "Impossible d'envoyer la déclaration.";
      
      const errorMessage = err?.response?.data?.message || err?.message || "";
      
      // Mapper les erreurs du backend
      if (errorMessage.includes("Aucun contrat") || errorMessage.includes("Contrat inactif")) {
        msg = "❌ Contrat non valide - Veuillez vérifier votre contrat d'assurance";
      } else if (errorMessage.includes("Vehicle not found")) {
        msg = "❌ Véhicule non trouvé";
      } else if (errorMessage.includes("Document obligatoire")) {
        msg = "❌ Document obligatoire manquant";
      } else if (errorMessage) {
        msg = `❌ ${errorMessage}`;
      }
      
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

  const onAddOtherVehicle = (values: OtherVehicleFormValues) => {
    setOtherVehicles([...otherVehicles, values]);
    resetOtherVehicleForm();
    setOpenOtherVehicleDialog(false);
  };

  const handleDeleteOtherVehicle = (index: number) => {
    setOtherVehicles(otherVehicles.filter((_, i) => i !== index));
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

            {/*  Upload obligatoire */}
            <Button variant="outlined" component="label">
              {file ? `Document: ${file.name}` : "Ajouter le document (obligatoire)"}
              <input
                hidden
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>

            {/* Section Tiers Impliqués */}
            <Box sx={{ borderTop: "1px solid #e0e0e0", pt: 2, mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Tiers Impliqués (optionnel)</Typography>
              
              <Button
                variant="outlined"
                onClick={() => setOpenOtherVehicleDialog(true)}
                sx={{ mb: 2 }}
              >
                + Ajouter un tiers
              </Button>

              {otherVehicles.length > 0 && (
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Marque</TableCell>
                      <TableCell>Modèle</TableCell>
                      <TableCell>Propriétaire</TableCell>
                      <TableCell align="center" sx={{ width: 50 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {otherVehicles.map((vehicle, index) => (
                      <TableRow key={index}>
                        <TableCell>{vehicle.matricule}</TableCell>
                        <TableCell>{vehicle.marque || "-"}</TableCell>
                        <TableCell>{vehicle.modele || "-"}</TableCell>
                        <TableCell>{vehicle.ownerName || "-"}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteOtherVehicle(index)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>

            <Button
              variant="contained"
              type="submit"
              disabled={mutation.isPending || isAddingVehicles || vehicles.length === 0}

            >
              {mutation.isPending || isAddingVehicles ? "Envoi..." : "Envoyer"}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Dialog d'ajout de tiers impliqués */}
      <Dialog open={openOtherVehicleDialog} onClose={() => setOpenOtherVehicleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un tiers impliqué</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <form onSubmit={handleSubmitOtherVehicle(onAddOtherVehicle)}>
            <Stack spacing={2}>
              <TextField
                label="Matricule *"
                fullWidth
                error={!!otherVehicleErrors.matricule}
                helperText={otherVehicleErrors.matricule?.message}
                {...registerOtherVehicle("matricule")}
              />

              <TextField
                label="Marque"
                fullWidth
                {...registerOtherVehicle("marque")}
              />

              <TextField
                label="Modèle"
                fullWidth
                {...registerOtherVehicle("modele")}
              />

              <TextField
                label="Nom du propriétaire"
                fullWidth
                {...registerOtherVehicle("ownerName")}
              />

              <TextField
                label="Téléphone du propriétaire"
                fullWidth
                {...registerOtherVehicle("ownerPhone")}
              />

              <TextField
                label="Email du propriétaire"
                type="email"
                fullWidth
                {...registerOtherVehicle("ownerEmail")}
              />

              <TextField
                label="Numéro d'assurance"
                fullWidth
                {...registerOtherVehicle("insuranceNumber")}
              />
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOtherVehicleDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSubmitOtherVehicle(onAddOtherVehicle)}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
