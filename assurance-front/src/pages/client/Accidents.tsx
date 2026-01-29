// src/pages/client/Accidents.tsx
import {
  Stack,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SkeletonTable from "../../components/SkeletonTable";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import SearchBar from "../../components/SearchBar";
import DataTable, { type Column } from "../../components/DataTable";

import { claimService, type ClaimDto } from "../../services/claim.service";
import AccidentCreate from "./AccidentCreate";

const Accidents = () => {
    const [search, setSearch] = useState("");
    const [openCreate, setOpenCreate] = useState(false);
    const accidentsQuery = useQuery({
        queryKey: ["myAccidents"],
        queryFn: claimService.getMyAccidents,
    });
    const rows = accidentsQuery.data ?? [];
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q)
            return rows;
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
    if (accidentsQuery.isLoading)
        return <SkeletonTable rows={7}/>;
    if (accidentsQuery.isError) {
        return (<ErrorState message="Impossible de charger vos accidents." onRetry={() => accidentsQuery.refetch()}/>);
    }
    return (<Stack spacing={2}>
      {/* Header + action */}
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" spacing={1.5}>
        <Typography variant="h4">Mes accidents</Typography>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Déclarer un accident
        </Button>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h4">{rows.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search + table */}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par date, véhicule, lieu..."/>

          {filtered.length === 0 ? (<EmptyState title="Aucun accident" description="Aucun accident trouvé."/>) : (<DataTable columns={columns} rows={filtered}/>)}
        </Stack>
      </Paper>

      {/* Modal create */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pr: 6 }}>
          Déclarer un accident
          <IconButton onClick={() => setOpenCreate(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
        
          <AccidentCreate onSuccess={() => {
            setOpenCreate(false);
            accidentsQuery.refetch(); // ou invalidateQueries dans AccidentCreate
        }}/>

        </DialogContent>
      </Dialog>
    </Stack>);
};
export default Accidents;
