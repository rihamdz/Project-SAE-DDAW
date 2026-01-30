import { Stack, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import { useQuery } from "@tanstack/react-query";
import Loading from "../../components/Loading";
import StatCard from "../../components/StatCard";
import { adminService } from "../../services/admin.service";

export default function AdminDashboard() {
  const q = useQuery({
    queryKey: ["adminClaims"],
    queryFn: adminService.listClaims,
  });

  if (q.isLoading) return <Loading />;

  const claims = q.data ?? [];
  const opened = claims.filter((c) => c.status === "DECLARED" || c.status === "IN_PROGRESS" || c.status === "PENDING").length;
  const closed = claims.filter((c) => c.status === "RESOLVED" || c.status === "REJECTED").length;

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Dashboard Admin</Typography>

      <Grid container spacing={2}>
        <Grid  size={{xs:12 ,sm:6 , md:3}} >
          <StatCard label="Total sinistres" value={claims.length} />
        </Grid>
        <Grid  size={{xs:12 ,sm:6 , md:3}} >
          <StatCard label="Ouverts" value={opened} />
        </Grid>
        <Grid  size={{xs:12 ,sm:6 , md:3}} >
          <StatCard label="Clôturés" value={closed} />
        </Grid>
        <Grid  size={{xs:12 ,sm:6 , md:3}} >
          <StatCard label="En cours" value={claims.filter((c) => c.status === "IN_PROGRESS").length} />
        </Grid>
      </Grid>
    </Stack>
  );
}
