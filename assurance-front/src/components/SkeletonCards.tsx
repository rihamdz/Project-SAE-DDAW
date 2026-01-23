import { Paper, Skeleton, Stack } from "@mui/material";

export default function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {Array.from({ length: count }).map((_, i) => (
        <Paper key={i} sx={{ p: 2, width: 220 }}>
          <Stack spacing={1}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={70} height={40} />
            <Skeleton variant="text" width={160} />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
