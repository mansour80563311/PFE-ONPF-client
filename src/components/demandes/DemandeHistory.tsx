import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

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
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          py: 6,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
          }}
        >
          <CircularProgress size={30} />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Chargement de l’historique...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        variant="outlined"
      >
        Impossible de charger l’historique
        de la demande.
      </Alert>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        p: {
          xs: 2.5,
          sm: 4,
        },
        borderColor: "divider",
      }}
    >
      {/* En-tête */}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          mb: 4,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            borderRadius: 2.5,
            color: "primary.main",
            bgcolor:
              "rgba(10, 74, 70, 0.10)",
          }}
        >
          <HistoryRoundedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Historique du traitement
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
              lineHeight: 1.5,
            }}
          >
            Retrouvez les changements de
            statut et les utilisateurs ayant
            effectué chaque action.
          </Typography>
        </Box>
      </Box>

      {historique.length === 0 ? (
        <Alert
          severity="info"
          variant="outlined"
        >
          Aucun changement de statut n’a
          encore été enregistré pour cette
          demande.
        </Alert>
      ) : (
        <Box>
          {historique.map(
            (item, index) => {
              const isLast =
                index ===
                historique.length - 1;

              return (
                <Box
                  key={item.id}
                  sx={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns:
                      "42px minmax(0, 1fr)",
                    columnGap: {
                      xs: 1.5,
                      sm: 2.5,
                    },
                    pb: isLast ? 0 : 3.5,
                  }}
                >
                  {/* Axe de la timeline */}

                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      justifyContent:
                        "center",
                    }}
                  >
                    {!isLast && (
                      <Box
                        sx={{
                          position:
                            "absolute",
                          top: 34,
                          bottom: -14,
                          width: 2,
                          bgcolor: "divider",
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        borderRadius: "50%",
                        bgcolor:
                          "primary.main",
                        color:
                          "primary.contrastText",
                        border:
                          "4px solid #FFFFFF",
                        boxShadow:
                          "0 0 0 1px #DCE5E3",
                        fontSize:
                          "0.75rem",
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </Box>
                  </Box>

                  {/* Carte de l’événement */}

                  <Box
                    sx={{
                      minWidth: 0,
                      p: {
                        xs: 2,
                        sm: 2.5,
                      },
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "#F9FBFA",
                      transition:
                        "border-color 0.2s ease, box-shadow 0.2s ease",

                      "&:hover": {
                        borderColor:
                          "rgba(10, 74, 70, 0.30)",
                        boxShadow:
                          "0 6px 18px rgba(16, 56, 53, 0.06)",
                      },
                    }}
                  >
                    {/* Transition de statut */}

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1.25}
                      sx={{
                        alignItems: {
                          xs: "flex-start",
                          sm: "center",
                        },
                        mb: 2,
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

                      <ArrowForwardRoundedIcon
                        sx={{
                          color:
                            "text.secondary",
                          fontSize: 21,
                          transform: {
                            xs: "rotate(90deg)",
                            sm: "none",
                          },
                        }}
                      />

                      <Chip
                        label={getStatusLabel(
                          item.nouveauStatut
                        )}
                        color={getStatusColor(
                          item.nouveauStatut
                        )}
                        size="small"
                      />
                    </Stack>

                    {/* Auteur et date */}

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, minmax(0, 1fr))",
                        },
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minWidth: 0,
                        }}
                      >
                        <PersonRoundedIcon
                          sx={{
                            fontSize: 19,
                            color:
                              "primary.main",
                          }}
                        />

                        <Typography
                          variant="body2"
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          Action effectuée par{" "}
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {
                              item.utilisateur
                                .prenom
                            }{" "}
                            {
                              item.utilisateur
                                .nom
                            }
                          </Typography>
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <ScheduleRoundedIcon
                          sx={{
                            fontSize: 19,
                            color:
                              "text.secondary",
                          }}
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {formatDateTime(
                            item.createdAt
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Motif éventuel */}

                    {item.motif && (
                      <Alert
                        severity="error"
                        variant="outlined"
                        icon={
                          <ErrorOutlineRoundedIcon />
                        }
                        sx={{
                          mt: 2.5,
                          alignItems:
                            "flex-start",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 0.5,
                            fontWeight: 700,
                          }}
                        >
                          Motif de la décision
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace:
                              "pre-wrap",
                            lineHeight: 1.65,
                          }}
                        >
                          {item.motif}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Box>
              );
            }
          )}
        </Box>
      )}
    </Paper>
  );
}

export default DemandeHistory;