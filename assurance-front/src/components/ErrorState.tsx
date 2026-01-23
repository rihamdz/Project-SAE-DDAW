import { Alert, Button, Stack } from "@mui/material";

export default function ErrorState({
  message = "Une erreur est survenue.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Stack spacing={2}>
      <Alert severity="error">{message}</Alert>
      {onRetry ? (
        <Button variant="contained" onClick={onRetry}>
          Réessayer
        </Button>
      ) : null}
    </Stack>
  );
}
