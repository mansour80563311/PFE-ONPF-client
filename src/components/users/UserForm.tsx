import {
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Controller } from "react-hook-form";

import { useRoles } from "../../hooks/useRoles";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  userSchema,
  type UserFormData,
} from "../../validations/user.schema";

import userService from "../../services/user.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import type { User } from "../../types/user";


interface Props {
  user?: User;
}
function UserForm({
  user,
}: Props) {
const [submitting, setSubmitting] = useState(false);
const {
  register,
  handleSubmit,
  control,
  reset,
  formState: { errors },
} = useForm<UserFormData>({
    
  resolver: zodResolver(
userSchema
),
  defaultValues: {
    statut: true,
  },
});
//
 const {
    roles,
    
  } = useRoles();

  
  const navigate = useNavigate();//

  useEffect(() => {

  if (!user) return;

  reset({
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone,
    login: user.login,
    password: "",
    roleId: user.roleId,
    statut: user.statut,
  });

}, [user, reset]);
  //
 
const onSubmit = async (data: UserFormData) => {
  try {
    setSubmitting(true);

    if (user) {

      await userService.updateUser(user.id, data);

      toast.success("Utilisateur modifié avec succès");

    } else {

      await userService.createUser(data);

      toast.success("Utilisateur créé avec succès");

    }

    navigate("/users");

  } catch (error: unknown) {

    if (axios.isAxiosError(error)) {
      toast.error(
        error.response?.data?.message ??
        "Une erreur est survenue"
      );
    } else {
      toast.error("Une erreur inattendue est survenue.");
    }

  } finally {
    setSubmitting(false);
  }
};


  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: 700,
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3 }}
      >
        {user
            ? "Modifier un utilisateur"
            : "Nouvel utilisateur"}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>

        <TextField
          label="Nom"
          fullWidth
          sx={{ mb: 2 }}
          {...register("nom")}
          error={!!errors.nom}
          helperText={errors.nom?.message}
        />

        <TextField
          label="Prénom"
          fullWidth
          sx={{ mb: 2 }}
          {...register("prenom")}
          error={!!errors.prenom}
          helperText={errors.prenom?.message}
        />

        <TextField
          label="Email"
          fullWidth
          sx={{ mb: 2 }}
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          label="Téléphone"
          fullWidth
          sx={{ mb: 2 }}
          {...register("telephone")}
          error={!!errors.telephone}
          helperText={errors.telephone?.message}
        />

        <TextField
          label="Login"
          fullWidth
          sx={{ mb: 2 }}
          {...register("login")}
          error={!!errors.login}
          helperText={errors.login?.message}
        />

        <TextField
          label="Mot de passe"
          type="password"
          fullWidth
          sx={{ mb: 3 }}
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <FormControl
            fullWidth
            sx={{ mb: 2 }}
            >
            <InputLabel>Rôle</InputLabel>

            <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                <Select
                    {...field}
                    label="Rôle"
                >
                    {roles.map((role) => (
                    <MenuItem
                        key={role.id}
                        value={role.id}
                    >
                        {role.nom}
                    </MenuItem>
                    ))}
                </Select>
                
                )}
            />

            <Typography
                color="error"
                variant="caption"
            >
                {errors.roleId?.message}
            </Typography>

        </FormControl>
        <Controller
            name="statut"
            control={control}
            render={({ field }) => (
                <FormControlLabel
                control={
                    <Switch
                    checked={field.value}
                    onChange={(e) =>
                        field.onChange(e.target.checked)
                    }
                    />
                }
                label="Utilisateur actif"
                />
            )}
            />

            <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            >
            {submitting
                ? user
                ? "Modification..."
                : "Création..."
                : user
                ? "Modifier"
                : "Créer"}
            </Button>

      </form>

    </Paper>
  );
}

export default UserForm;