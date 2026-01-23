import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, backgroundColor: "background.default" }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              Assurance Portal
            </Typography>
            <Typography color="text.secondary">
              Connectez-vous pour accéder à votre espace.
            </Typography>
          </Stack>

          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}
