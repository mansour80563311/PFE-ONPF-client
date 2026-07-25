import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import axios from "axios";

import {
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import authService from "../../services/auth.service";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  loginSchema,
} from "../../validations/auth.schema";

import type {
  LoginFormData,
} from "../../validations/auth.schema";

interface ApiErrorResponse {
  message?: string;
}

function LoginForm() {
  const navigate = useNavigate();

  const {
    login,
  } = useAuth();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    authenticationError,
    setAuthenticationError,
  ] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      login: "",
      password: "",
    },
  });

  const getErrorMessage = (
    error: unknown
  ): string => {
    if (axios.isAxiosError(error)) {
      const responseData =
        error.response?.data as
          | ApiErrorResponse
          | undefined;

      return (
        responseData?.message ??
        "Identifiant ou mot de passe incorrect."
      );
    }

    return (
      "Une erreur inattendue est survenue. " +
      "Veuillez réessayer."
    );
  };

  const onSubmit = async (
    data: LoginFormData
  ) => {
    try {
      setAuthenticationError(null);

      const response =
        await authService.login(data);

      login(
        response.data.token,
        response.data.user
      );

      toast.success(
        "Connexion réussie."
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setAuthenticationError(
        getErrorMessage(error)
      );
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <Stack spacing={2.5}>
        {authenticationError && (
          <Alert
            severity="error"
            variant="outlined"
          >
            {authenticationError}
          </Alert>
        )}

        <TextField
          label="Identifiant"
          placeholder="Saisissez votre identifiant"
          fullWidth
          autoFocus
          autoComplete="username"
          disabled={isSubmitting}
          error={Boolean(errors.login)}
          helperText={
            errors.login?.message
          }
          {...register("login")}
        />

        <TextField
          label="Mot de passe"
          placeholder="Saisissez votre mot de passe"
          type={
            showPassword
              ? "text"
              : "password"
          }
          fullWidth
          autoComplete="current-password"
          disabled={isSubmitting}
          error={Boolean(
            errors.password
          )}
          helperText={
            errors.password?.message
          }
          {...register("password")}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    type="button"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    onClick={() =>
                      setShowPassword(
                        (currentValue) =>
                          !currentValue
                      )
                    }
                  >
                    {showPassword ? (
                      <VisibilityOffRoundedIcon />
                    ) : (
                      <VisibilityRoundedIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              <LoginRoundedIcon />
            )
          }
          sx={{
            minHeight: 50,
            mt: 1,
          }}
        >
          {isSubmitting
            ? "Connexion en cours..."
            : "Se connecter"}
        </Button>

        <Typography
          variant="caption"
          align="center"
          color="text.secondary"
        >
          L’accès à cette application est
          strictement réservé au personnel
          habilité de l’ONPF.
        </Typography>
      </Stack>
    </Box>
  );
}

export default LoginForm;