import {
  Alert,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { documentService } from "../services/document.service";
import type { ClaimDocument } from "../types/document";

export default function DocumentUploader({ claimId }: { claimId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const qc = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const docsQuery = useQuery({
    queryKey: ["documents", claimId],
    queryFn: () => documentService.getDocuments(claimId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      documentService.uploadDocument(claimId, file),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["documents", claimId] });
    },
    onError: () => {
      setErrorMsg("Upload impossible. Réessayez.");
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg(null);
      uploadMutation.mutate(file);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography sx={{ fontWeight: 900 }}>
          Documents
        </Typography>

        <input
          type="file"
          hidden
          ref={inputRef}
          onChange={onFileChange}
          accept="image/*,.pdf"
        />

        <Button
          variant="contained"
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? "Upload..." : "Ajouter un document"}
        </Button>

        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        {docsQuery.isError && (
          <Typography color="error">
            Impossible de charger les documents.
          </Typography>
        )}

        {docsQuery.data && docsQuery.data.length === 0 && (
          <Typography color="text.secondary">
            Aucun document pour le moment.
          </Typography>
        )}

        <Stack spacing={1}>
          {docsQuery.data?.map((d: ClaimDocument) => (
            <Paper key={d.id} sx={{ p: 1 }}>
              <Typography>{d.fileName}</Typography>
              {d.uploadedAt && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(d.uploadedAt).toLocaleString()}
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
