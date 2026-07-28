import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import {
  Controller,
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

import {
  userSchema,
} from "../../validations/user.schema";

import type {
  UserFormData,
} from "../../validations/user.schema";

import type {
  User,
} from "../../types/user";

import {
  useRoles,
} from "../../hooks/useRoles";

import userService from "../../services/user.service";

interface Props {
  user?: User;
}

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}

function getErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError(error)) {
    const responseData =
      error.response?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData?.errors?.[0]?.message ??
      responseData?.message ??
      "Une erreur est survenue."
    );
  }

  return "Une erreur inattendue est survenue.";
}

function getRoleLabel(
  role: string
): string {
  const roleLabels: Record<
    string,
    string
  > = {
    ADMIN: "Administrateur",
    AGENT: "Agent",
    RESPONSABLE: "Responsable",
  };

  return roleLabels[role] ?? role;
}

function UserForm({
  user,
}: Props) {
  const navigate = useNavigate();

  const {
    roles,
  } = useRoles();

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const isEditMode = Boolean(user);

  const {
    register,
    handleSubmit,
    control,
    reset,

    formState: {
      errors,
    },
  } = useForm<UserFormData>({
    resolver: zodResolver(
      userSchema
    ),

    mode: "onBlur",

    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      login: "",
      password: "",
      roleId: "",
      statut: true,
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone:
        user.telephone ?? "",
      login: user.login,
      password: "",
      roleId: user.roleId,
      statut: user.statut,
    });
  }, [user, reset]);

  const onSubmit = async (
    data: UserFormData
  ) => {
    try {
      setSubmitting(true);

      if (user) {
        await userService.updateUser(
          user.id,
          data
        );

        toast.success(
          "Utilisateur modifié avec succès."
        );
      } else {
        await userService.createUser(
          data
        );

        toast.success(
          "Utilisateur créé avec succès."
        );
      }

      navigate("/users", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper
      component="form"
      noValidate
      variant="outlined"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: "100%",
        maxWidth: 1000,
        p: {
          xs: 2.5,
          sm: 4,
        },
        borderColor: "divider",
      }}
    >
      <Alert
        severity="info"
        variant="outlined"
        sx={{
          mb: 4,
        }}
      >
        Les champs marqués d’un astérisque
        sont obligatoires. Le rôle détermine
        les fonctionnalités accessibles par
        l’utilisateur.
      </Alert>

      {/* Informations personnelles */}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2.5,
            color: "primary.main",
            bgcolor:
              "rgba(10, 74, 70, 0.10)",
          }}
        >
          <PersonRoundedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Informations personnelles
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
            }}
          >
            Identité et coordonnées de
            l’utilisateur.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
          gap: 2.5,
        }}
      >
        <TextField
          required
          fullWidth
          autoFocus
          label="Nom"
          autoComplete="family-name"
          disabled={submitting}
          error={Boolean(errors.nom)}
          helperText={
            errors.nom?.message
          }
          {...register("nom")}
        />

        <TextField
          required
          fullWidth
          label="Prénom"
          autoComplete="given-name"
          disabled={submitting}
          error={Boolean(errors.prenom)}
          helperText={
            errors.prenom?.message
          }
          {...register("prenom")}
        />

        <TextField
          required
          fullWidth
          type="email"
          label="Adresse e-mail"
          placeholder="nom@onpf.tn"
          autoComplete="email"
          disabled={submitting}
          error={Boolean(errors.email)}
          helperText={
            errors.email?.message
          }
          {...register("email")}
        />

        <TextField
          fullWidth
          label="Téléphone"
          placeholder="Ex. 20 000 000"
          autoComplete="tel"
          disabled={submitting}
          error={Boolean(
            errors.telephone
          )}
          helperText={
            errors.telephone?.message ??
            "Champ facultatif."
          }
          slotProps={{
            htmlInput: {
              inputMode: "tel",
              maxLength: 20,
            },
          }}
          {...register("telephone")}
        />
      </Box>

      <Box
        sx={{
          my: 4,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      />

      {/* Accès et sécurité */}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2.5,
            color: "primary.main",
            bgcolor:
              "rgba(10, 74, 70, 0.10)",
          }}
        >
          <BadgeRoundedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Accès et sécurité
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
            }}
          >
            Identifiant de connexion, mot
            de passe et niveau d’accès.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
          gap: 2.5,
        }}
      >
        <TextField
          required
          fullWidth
          label="Identifiant de connexion"
          placeholder="Ex. agent.guichet"
          autoComplete="username"
          disabled={submitting}
          error={Boolean(errors.login)}
          helperText={
            errors.login?.message
          }
          {...register("login")}
        />

        <TextField
          fullWidth
          required={!isEditMode}
          type={
            showPassword
              ? "text"
              : "password"
          }
          label={
            isEditMode
              ? "Nouveau mot de passe"
              : "Mot de passe"
          }
          autoComplete="new-password"
          disabled={submitting}
          error={Boolean(
            errors.password
          )}
          helperText={
            errors.password?.message ??
            (isEditMode
              ? "Laissez ce champ vide pour conserver le mot de passe actuel."
              : "Définissez un mot de passe sécurisé.")
          }
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockRoundedIcon
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  />
                </InputAdornment>
              ),

              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    disabled={submitting}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
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
          {...register("password")}
        />

        <FormControl
          fullWidth
          required
          error={Boolean(
            errors.roleId
          )}
          disabled={submitting}
        >
          <InputLabel id="user-role-label">
            Rôle
          </InputLabel>

          <Controller
            name="roleId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? ""}
                labelId="user-role-label"
                label="Rôle"
              >
                {roles.map((role) => (
                  <MenuItem
                    key={role.id}
                    value={role.id}
                  >
                    {getRoleLabel(
                      role.nom
                    )}
                  </MenuItem>
                ))}
              </Select>
            )}
          />

          <FormHelperText>
            {errors.roleId?.message ??
              "Sélectionnez les autorisations attribuées à cet utilisateur."}
          </FormHelperText>
        </FormControl>

        <Controller
          name="statut"
          control={control}
          render={({ field }) => (
            <Paper
              variant="outlined"
              sx={{
                minHeight: 56,
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                borderColor: field.value
                  ? "success.light"
                  : "divider",
                bgcolor: field.value
                  ? "rgba(46, 125, 50, 0.04)"
                  : "action.hover",
              }}
            >
              <FormControlLabel
                sx={{
                  width: "100%",
                  m: 0,
                }}
                control={
                  <Switch
                    checked={Boolean(
                      field.value
                    )}
                    disabled={submitting}
                    color="success"
                    onChange={(event) =>
                      field.onChange(
                        event.target.checked
                      )
                    }
                  />
                }
                label={
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Compte{" "}
                      {field.value
                        ? "actif"
                        : "inactif"}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {field.value
                        ? "L’utilisateur peut se connecter."
                        : "L’accès au système est désactivé."}
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          )}
        />
      </Box>

      <Box
        sx={{
          my: 4,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      />

      {/* Actions */}

      <Stack
        direction={{
          xs: "column-reverse",
          sm: "row",
        }}
        spacing={1.5}
        sx={{
          justifyContent: "flex-end",

          "& > button": {
            width: {
              xs: "100%",
              sm: "auto",
            },
          },
        }}
      >
        <Button
          type="button"
          variant="outlined"
          startIcon={
            <CancelRoundedIcon />
          }
          disabled={submitting}
          onClick={() =>
            navigate("/users")
          }
        >
          Annuler
        </Button>

        <Button
          type="submit"
          variant="contained"
          startIcon={
            submitting ? (
              <CircularProgress
                size={19}
                color="inherit"
              />
            ) : (
              <SaveRoundedIcon />
            )
          }
          disabled={submitting}
        >
          {submitting
            ? isEditMode
              ? "Modification..."
              : "Création..."
            : isEditMode
              ? "Enregistrer les modifications"
              : "Créer l’utilisateur"}
        </Button>
      </Stack>
    </Paper>
  );
}

export default UserForm;