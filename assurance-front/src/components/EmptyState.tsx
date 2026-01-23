import { Paper, Stack, Typography } from "@mui/material";

export default function EmptyState({
  title = "Aucun résultat",
  description = "Essayez de modifier vos filtres ou d’ajouter un élément.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={0.5}>
        <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Paper>
  );
}