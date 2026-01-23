import { Paper, Stack, Typography } from "@mui/material";

export default function Clients() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Clients</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography color="text.secondary">
          Page clients admin (à compléter plus tard).
        </Typography>
      </Paper>
    </Stack>
  );
}
