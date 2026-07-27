import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import axios from "axios";

import {
  useEffect,
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

import {
  demandeSchema,
} from "../../validations/demande.schema";

import type {
  DemandeFormData,
} from "../../validations/demande.schema";

import type {
  Demande,
} from "../../types/demande";

import demandeService from "../../services/demande.service";

interface Props {
  demande?: Demande;
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

function DemandeForm({
  demande,
}: Props) {
  const navigate = useNavigate();

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const isEditMode = Boolean(demande);

  const {
    register,
    handleSubmit,
    reset,
    watch,

    formState: {
      errors,
    },
  } = useForm<DemandeFormData>({
    resolver: zodResolver(
      demandeSchema
    ),

    mode: "onBlur",

    defaultValues: {
      nomDemandeur: "",
      prenomDemandeur: "",
      cin: "",
      telephone: "",
      email: "",
      referenceFonciere: "",
      adresseBien: "",
      observations: "",
    },
  });

  const observations =
    watch("observations") ?? "";

  useEffect(() => {
    if (!demande) {
      return;
    }

    reset({
      nomDemandeur:
        demande.nomDemandeur,

      prenomDemandeur:
        demande.prenomDemandeur,

      cin:
        demande.cin,

      telephone:
        demande.telephone,

      email:
        demande.email ?? "",

      referenceFonciere:
        demande.referenceFonciere,

      adresseBien:
        demande.adresseBien,

      observations:
        demande.observations ?? "",
    });
  }, [demande, reset]);

  const onSubmit = async (
    data: DemandeFormData
  ) => {
    try {
      setSubmitting(true);

      if (demande) {
        await demandeService
          .updateDemande(
            demande.id,
            data
          );

        toast.success(
          "Demande modifiée avec succès."
        );
      } else {
        await demandeService
          .createDemande(data);

        toast.success(
          "Demande créée avec succès."
        );
      }

      navigate("/demandes", {
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
        p: {
          xs: 2.5,
          sm: 4,
        },
        borderColor: "divider",
      }}
    >
      <Alert
        severity="info"
        sx={{
          mb: 4,
        }}
      >
        Les champs marqués d’un astérisque
        sont obligatoires. Vérifiez les
        informations avant d’enregistrer la
        demande.
      </Alert>

      {/* Identité du demandeur */}

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
            Informations du demandeur
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Identité et coordonnées de la
            personne qui dépose la demande.
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
          placeholder="Ex. Mansour"
          autoComplete="family-name"
          disabled={submitting}
          error={Boolean(
            errors.nomDemandeur
          )}
          helperText={
            errors.nomDemandeur?.message
          }
          {...register(
            "nomDemandeur"
          )}
        />

        <TextField
          required
          fullWidth
          label="Prénom"
          placeholder="Ex. Mohamed"
          autoComplete="given-name"
          disabled={submitting}
          error={Boolean(
            errors.prenomDemandeur
          )}
          helperText={
            errors.prenomDemandeur
              ?.message
          }
          {...register(
            "prenomDemandeur"
          )}
        />

        <TextField
          required
          fullWidth
          label="Numéro de la CIN"
          placeholder="Ex. 12345678"
          disabled={submitting}
          error={Boolean(errors.cin)}
          helperText={
            errors.cin?.message ??
            "Saisissez les 8 chiffres de la CIN."
          }
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              maxLength: 8,
            },
          }}
          {...register("cin")}
        />

        <TextField
          required
          fullWidth
          label="Téléphone"
          placeholder="Ex. 20 000 000"
          autoComplete="tel"
          disabled={submitting}
          error={Boolean(
            errors.telephone
          )}
          helperText={
            errors.telephone?.message
          }
          slotProps={{
            htmlInput: {
              inputMode: "tel",
              maxLength: 20,
            },
          }}
          {...register("telephone")}
        />

        <TextField
          fullWidth
          type="email"
          label="Adresse e-mail"
          placeholder="Ex. nom@exemple.com"
          autoComplete="email"
          disabled={submitting}
          error={Boolean(errors.email)}
          helperText={
            errors.email?.message ??
            "Champ facultatif."
          }
          sx={{
            gridColumn: {
              xs: "auto",
              md: "1 / -1",
            },
          }}
          {...register("email")}
        />
      </Box>

      <Divider
        sx={{
          my: 4,
        }}
      />

      {/* Informations foncières */}

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
          <HomeWorkRoundedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Informations foncières
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Identifiez le titre foncier et la
            localisation du bien concerné.
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
          label="Référence foncière"
          placeholder="Ex. RF-2026-001"
          disabled={submitting}
          error={Boolean(
            errors.referenceFonciere
          )}
          helperText={
            errors.referenceFonciere
              ?.message
          }
          {...register(
            "referenceFonciere"
          )}
        />

        <TextField
          required
          fullWidth
          label="Adresse du bien"
          placeholder="Gouvernorat, ville, localité..."
          disabled={submitting}
          error={Boolean(
            errors.adresseBien
          )}
          helperText={
            errors.adresseBien?.message
          }
          {...register(
            "adresseBien"
          )}
        />
      </Box>

      <Divider
        sx={{
          my: 4,
        }}
      />

      {/* Observations */}

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
          <NotesRoundedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Observations
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Ajoutez toute information utile
            au traitement du dossier.
          </Typography>
        </Box>
      </Box>

      <TextField
        fullWidth
        multiline
        minRows={4}
        label="Observations complémentaires"
        placeholder="Précisions particulières concernant la demande..."
        disabled={submitting}
        error={Boolean(
          errors.observations
        )}
        helperText={
          errors.observations?.message ??
          `${observations.length}/500 caractères`
        }
        slotProps={{
          htmlInput: {
            maxLength: 500,
          },
        }}
        {...register("observations")}
      />

      <Divider
        sx={{
          my: 4,
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
          startIcon={<CloseRoundedIcon />}
          disabled={submitting}
          onClick={() =>
            navigate("/demandes")
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
              : "Enregistrement..."
            : isEditMode
              ? "Enregistrer les modifications"
              : "Enregistrer la demande"}
        </Button>
      </Stack>
    </Paper>
  );
}

export default DemandeForm;