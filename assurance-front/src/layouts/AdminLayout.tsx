import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
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
              Admin Dashboard
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button component={Link} to="/admin/dashboard" variant="text">Dashboard</Button>
              <Button component={Link} to="/admin/claims" variant="text">Sinistres</Button>
              <Button component={Link} to="/admin/clients" variant="text" disabled>
                Clients (plus tard)
              </Button>

              <Button onClick={onLogout} variant="contained">
                Déconnexion
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
