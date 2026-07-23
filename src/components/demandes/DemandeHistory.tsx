import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type {
  HistoriqueStatutDemande,
} from "../../types/demande";

import {
  getStatusColor,
  getStatusLabel,
} from "../../utils/demande";

import {
  formatDateTime,
} from "../../utils/date";

interface Props {
  historique: HistoriqueStatutDemande[];
  loading: boolean;
  error: boolean;
}

function DemandeHistory({
  historique,
  loading,
  error,
}: Props) {
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 4,
        }}
      >
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Impossible de charger l’historique de la demande.
      </Alert>
    );
  }

  if (historique.length === 0) {
    return (
      <Alert severity="info">
        Aucun changement de statut enregistré.
      </Alert>
    );
  }

  return (
    <Paper
      sx={{
        p: 4,
        width: "100%",
        borderRadius: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
        }}
      >
        🕒 Historique du traitement
      </Typography>

      <Stack spacing={3}>
        {historique.map((item, index) => (
          <Box key={item.id}>
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={2}
                sx={{
                alignItems: {
                  xs: "flex-start",
                  md: "center",
                },
              }}
            >
              <Chip
                label={getStatusLabel(
                  item.ancienStatut
                )}
                color={getStatusColor(
                  item.ancienStatut
                )}
                size="small"
                variant="outlined"
              />

              <Typography                
               sx={{
                  fontWeight: 600,
                }}
              >
                →
              </Typography>

              <Chip
                label={getStatusLabel(
                  item.nouveauStatut
                )}
                color={getStatusColor(
                  item.nouveauStatut
                )}
                size="small"
              />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: { md: "auto" } }}
              >
                {formatDateTime(item.createdAt)}
              </Typography>
            </Stack>

            <Typography sx={{ mt: 2 }}>
              Action effectuée par{" "}
              <strong>
                {item.utilisateur.prenom}{" "}
                {item.utilisateur.nom}
              </strong>
            </Typography>

            {item.motif && (
              <Alert
                severity="error"
                sx={{ mt: 2 }}
              >
                <strong>Motif :</strong>{" "}
                {item.motif}
              </Alert>
            )}

            {index < historique.length - 1 && (
              <Divider sx={{ mt: 3 }} />
            )}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default DemandeHistory;