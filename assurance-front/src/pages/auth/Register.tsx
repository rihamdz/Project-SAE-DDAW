import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authService } from "../../services/auth.service";

const schema = z.object({
  fullName: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultValues = useMemo<FormValues>(
    () => ({ fullName: "", email: "", password: "" }),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await authService.register(values);
      localStorage.setItem("token", res.token);

      // si tu veux auto-login via AuthProvider, on fera après
      // ici on redirige direct (par défaut côté client)
      if (res.user.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else navigate("/client/dashboard", { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Inscription impossible. Réessayez.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Inscription
      </Typography>
      <Typography color="text.secondary">
        Créez votre compte et accédez à votre espace.
      </Typography>

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            label="Nom complet"
            fullWidth
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            {...register("fullName")}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />

          <TextField
            label="Mot de passe"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} /> : undefined}
          >
            Créer le compte
          </Button>
        </Stack>
      </form>

      <Divider />

      <Button component={Link} to="/login" variant="text">
        Déjà un compte ? Se connecter
      </Button>
    </Stack>
  );
}
