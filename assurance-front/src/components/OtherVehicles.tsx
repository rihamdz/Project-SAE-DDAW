import {
  Paper,
  Stack,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { otherVehicleService, type AddOtherVehicleRequest } from "../services/otherVehicle.service";

interface OtherVehiclesProps {
  claimId: string | number;
  isAdmin?: boolean;
}

export default function OtherVehicles({ claimId, isAdmin = false }: OtherVehiclesProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const qc = useQueryClient();
  const [formData, setFormData] = useState<AddOtherVehicleRequest>({
    matricule: "",
    marque: "",
    modele: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    insuranceNumber: "",
  });

  const queryKey = isAdmin ? ["adminOtherVehicles", claimId] : ["otherVehicles", claimId];
  
  const vehiclesQuery = useQuery({
    queryKey,
    queryFn: () => otherVehicleService.getOtherVehicles(claimId),
  });

  const addMutation = useMutation({
    mutationFn: (payload: AddOtherVehicleRequest) =>
      otherVehicleService.addOtherVehicle(claimId, payload, isAdmin),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
      setFormData({
        matricule: "",
        marque: "",
        modele: "",
        ownerName: "",
        ownerPhone: "",
        ownerEmail: "",
        insuranceNumber: "",
      });
      setOpenDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (vehicleId: number) =>
      otherVehicleService.removeOtherVehicle(claimId, vehicleId, isAdmin),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
    },
  });

  const handleAddClick = () => setOpenDialog(true);

  const handleClose = () => {
    setOpenDialog(false);
    setFormData({
      matricule: "",
      marque: "",
      modele: "",
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
      insuranceNumber: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.matricule.trim()) {
      alert("Le matricule est obligatoire");
      return;
    }
    if (!formData.ownerName.trim()) {
      alert("Le nom du propriétaire est obligatoire");
      return;
    }
    addMutation.mutate(formData);
  };

  const vehicles = vehiclesQuery.data ?? [];

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography sx={{ fontWeight: 900 }}>
            Tiers impliqués
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Ajouter un tiers
          </Button>
        </Stack>

        {vehicles.length === 0 ? (
          <Typography color="text.secondary">
            Aucun tiers impliqué déclaré.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "background.default" }}>
                  <TableCell>Matricule</TableCell>
                  <TableCell>Marque/Modèle</TableCell>
                  <TableCell>Propriétaire</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.matricule}</TableCell>
                    <TableCell>
                      {v.marque || "—"} {v.modele || ""}
                    </TableCell>
                    <TableCell>{v.ownerName}</TableCell>
                    <TableCell>{v.ownerPhone || "—"}</TableCell>
                    <TableCell>{v.ownerEmail || "—"}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(v.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      {/* Dialog d'ajout */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un tiers impliqué</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Matricule *"
              name="matricule"
              value={formData.matricule}
              onChange={handleInputChange}
              fullWidth
              size="small"
              placeholder="Ex: AB-123-CD"
            />
            <TextField
              label="Marque"
              name="marque"
              value={formData.marque}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Modèle"
              name="modele"
              value={formData.modele}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Nom du propriétaire *"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Téléphone"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
            <TextField
              label="N° d'assurance du tiers"
              name="insuranceNumber"
              value={formData.insuranceNumber}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={addMutation.isPending}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
