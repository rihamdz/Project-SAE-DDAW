import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function ClientLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      {/* Topbar */}
      <Paper
        sx={{
          borderRadius: 0,
          boxShadow: "none",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          backgroundColor: "background.paper",
          px: 2,
          py: 1.5,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Espace Client
            </Typography>

            {/* Menu */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button component={Link} to="/client/dashboard" variant="text">Dashboard</Button>
              <Button component={Link} to="/client/vehicles" variant="text">Véhicules</Button>
              <Button component={Link} to="/client/contracts" variant="text">Contrats</Button>
              <Button component={Link} to="/client/accidents" variant="text">Accidents</Button>

              <Button onClick={onLogout} variant="contained">
                Déconnexion
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}