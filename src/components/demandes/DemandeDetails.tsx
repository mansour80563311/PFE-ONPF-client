import {
  Chip,
  Grid,
  Paper,
  Typography,
    Alert,
} from "@mui/material";

import type { Demande } from "../../types/demande";

import {
  getStatusColor,
  getStatusLabel,
} from "../../utils/demande";

import {
  formatDateTime,
} from "../../utils/date";

interface Props {
  demande: Demande;
}

function DemandeDetails({ demande }: Props) {
  return (
    <Paper
        sx={{
            p: 4,
            width: "100%",
            borderRadius: 3,
        }}
>
      {/* ========================= */}
      {/* Informations demandeur */}
      {/* ========================= */}

        <Typography
        variant="h6"
        sx={{
            mt: 4,
            mb: 3,
            fontWeight: 600,
            bgcolor: "grey.100",
            p: 1.5,
            borderRadius: 2,
        }}
        >
        📌 Informations du demandeur
        </Typography>

      <Grid container spacing={3}>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            Nom
          </Typography>

          <Typography>
            {demande.nomDemandeur}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            Prénom
          </Typography>

          <Typography>
            {demande.prenomDemandeur}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            CIN
          </Typography>

          <Typography>
            {demande.cin}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            Téléphone
          </Typography>

          <Typography>
            {demande.telephone}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2">
            Email
          </Typography>

          <Typography>
            {demande.email || "-"}
          </Typography>
        </Grid>

      </Grid>

      {/* ========================= */}
      {/* Informations foncières */}
      {/* ========================= */}

      <Typography
        variant="h6"
        sx={{
          mt: 5,
          mb: 3,
          fontWeight: 600,
          bgcolor: "grey.100",
          p: 1.5,
          borderRadius: 2,
        }}
      >
        🏠 Informations foncières
      </Typography>

      <Grid container spacing={3}>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            Référence foncière
          </Typography>

          <Typography>
            {demande.referenceFonciere}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2">
            Adresse du bien
          </Typography>

          <Typography>
            {demande.adresseBien}
          </Typography>
        </Grid>

      </Grid>

      {/* ========================= */}
      {/* Suivi */}
      {/* ========================= */}

      <Typography
        variant="h6"
        sx={{
          mt: 5,
          mb: 3,
          fontWeight: 600,
        bgcolor: "grey.100",
          p: 1.5,
          borderRadius: 2,
        }}
      >
        📄 Suivi de la demande
      </Typography>

      <Grid container spacing={3}>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            Numéro
          </Typography>

          <Typography>
            {demande.numero}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            Statut
          </Typography>

          <Chip
            label={getStatusLabel(demande.statut)}
            color={getStatusColor(demande.statut)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            Créée par
          </Typography>

          <Typography>
            {demande.utilisateur.prenom}{" "}
            {demande.utilisateur.nom}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            Date de création
          </Typography>

          <Typography>
            {formatDateTime(demande.createdAt)}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2">
            Dernière modification
          </Typography>

          <Typography>
            {formatDateTime(demande.updatedAt)}
          </Typography>
        </Grid>

      </Grid>

      {/* ========================= */}
      {/* Observations */}
      {/* ========================= */}

      <Typography
        variant="h6"
        sx={{
          mt: 5,
          mb: 3,
          fontWeight: 600,
          bgcolor: "grey.100",
          p: 1.5,
          borderRadius: 2,
        }}
      >
        📝 Observations
      </Typography>

      <Typography>
        {demande.observations || "-"}
      </Typography>

      {demande.motifRejet && (
        <>
            <Typography
            variant="h6"
            sx={{
                mt: 5,
                mb: 3,
                fontWeight: 600,
            }}
            >
            ⛔ Motif du rejet
            </Typography>

            <Alert severity="error">
            {demande.motifRejet}
            </Alert>
        </>
        )}

    </Paper>
  );
}

export default DemandeDetails;