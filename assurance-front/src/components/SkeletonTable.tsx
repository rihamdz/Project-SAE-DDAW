import { Paper, Skeleton, Stack } from "@mui/material";

export default function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1.2}>
        <Skeleton variant="rectangular" height={38} />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={44} />
        ))}
      </Stack>
    </Paper>
  );
}
