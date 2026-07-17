import { Button, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormData } from "../../validations/auth.schema";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import authService from "../../services/auth.service";

import { AxiosError } from "axios";

import { useAuth } from "../../hooks/useAuth";

function LoginForm() {
    const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

const navigate = useNavigate();


const onSubmit = async (data: LoginFormData) => {

  try {

    const response = await authService.login(data);


    login(
        response.data.token,
        response.data.user
    );


    toast.success(
      "Connexion réussie"
    );


    navigate("/dashboard");


} catch (error) {
  const axiosError = error as AxiosError<{
    message: string;
  }>;

  toast.error(
    axiosError.response?.data?.message ??
    "Erreur de connexion"
  );
}

};

  return (
    <Paper
      elevation={4}
      sx={{
        width: 400,
        padding: 4,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 3 }}
      >
        Connexion
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Login"
          fullWidth
          margin="normal"
          {...register("login")}
          error={!!errors.login}
          helperText={errors.login?.message}
        />

        <TextField
          label="Mot de passe"
          type="password"
          fullWidth
          margin="normal"
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
          }}
        >
          Se connecter
        </Button>
      </form>
    </Paper>
  );
}

export default LoginForm;