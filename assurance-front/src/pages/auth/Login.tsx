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
import { useAuth } from "../../auth/AuthProvider";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultValues = useMemo<FormValues>(
    () => ({ email: "", password: "" }),
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
    try {
      const user = await login(values.email, values.password);

      // ✅ Redirection selon role
      if (user.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else navigate("/client/dashboard", { replace: true });
    } catch (err: any) {
      // Message d’erreur simple (à adapter si ton backend renvoie un message précis)
      const message =
        err?.response?.data?.message ||
        "Email ou mot de passe incorrect. Réessayez.";
      setErrorMsg(message);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Connexion
      </Typography>
      <Typography color="text.secondary">
        Accédez à votre espace client ou admin.
      </Typography>

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
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
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
          >
            Se connecter
          </Button>
        </Stack>
      </form>

      <Divider />

      <Button component={Link} to="/register" variant="text">
        Créer un compte
      </Button>
    </Stack>
  );
}
