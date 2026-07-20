import {
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  demandeSchema,
  type DemandeFormData,
} from "../../validations/demande.schema";

import demandeService from "../../services/demande.service";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useEffect, useState } from "react";

import type { Demande } from "../../types/demande";

interface Props {
  demande?: Demande;
}

function DemandeForm({
  demande,
}: Props) {

  const [submitting, setSubmitting] =
    useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DemandeFormData>({
    resolver: zodResolver(demandeSchema),
  });

useEffect(() => {

  if (!demande) return;

  reset({
    nomDemandeur: demande.nomDemandeur,
    prenomDemandeur: demande.prenomDemandeur,
    cin: demande.cin,
    telephone: demande.telephone,
    email: demande.email ?? "",
    referenceFonciere:
      demande.referenceFonciere,
    adresseBien: demande.adresseBien,
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

      await demandeService.updateDemande(
        demande.id,
        data
      );

      toast.success(
        "Demande modifiée avec succès."
      );

    } else {

      await demandeService.createDemande(
        data
      );

      toast.success(
        "Demande créée avec succès."
      );

    }

    navigate("/demandes");

  } catch (error: unknown) {

    if (axios.isAxiosError(error)) {

      toast.error(
        error.response?.data?.message ??
        "Une erreur est survenue."
      );

    } else {

      toast.error(
        "Une erreur inattendue est survenue."
      );

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
      {demande
        ? "Modifier une demande"
        : "Nouvelle demande"}
    </Typography>

    <form onSubmit={handleSubmit(onSubmit)}>

      <TextField
        label="Nom"
        fullWidth
        sx={{ mb: 2 }}
        {...register("nomDemandeur")}
        error={!!errors.nomDemandeur}
        helperText={errors.nomDemandeur?.message}
      />

      <TextField
        label="Prénom"
        fullWidth
        sx={{ mb: 2 }}
        {...register("prenomDemandeur")}
        error={!!errors.prenomDemandeur}
        helperText={errors.prenomDemandeur?.message}
      />

      <TextField
        label="CIN"
        fullWidth
        sx={{ mb: 2 }}
        {...register("cin")}
        error={!!errors.cin}
        helperText={errors.cin?.message}
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
        label="Email"
        fullWidth
        sx={{ mb: 2 }}
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        label="Référence foncière"
        fullWidth
        sx={{ mb: 2 }}
        {...register("referenceFonciere")}
        error={!!errors.referenceFonciere}
        helperText={errors.referenceFonciere?.message}
      />

      <TextField
        label="Adresse du bien"
        fullWidth
        sx={{ mb: 2 }}
        {...register("adresseBien")}
        error={!!errors.adresseBien}
        helperText={errors.adresseBien?.message}
      />

      <TextField
        label="Observations"
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 3 }}
        {...register("observations")}
        error={!!errors.observations}
        helperText={errors.observations?.message}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
      >
        {submitting
          ? demande
            ? "Modification..."
            : "Création..."
          : demande
            ? "Modifier"
            : "Créer"}
      </Button>

    </form>
  </Paper>
);

}

export default DemandeForm;