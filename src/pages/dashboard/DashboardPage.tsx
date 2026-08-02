import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import PageHeader from "../../components/common/PageHeader";

import {
  useDashboard,
} from "../../hooks/useDashboard";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  ROLES,
} from "../../utils/roles";

import {
  formatDate,
  formatDateTime,
} from "../../utils/date";

import {
  getStatusColor,
  getStatusLabel,
} from "../../utils/demande";

function StandardDashboardPage() {
  const navigate = useNavigate();

  const {
    user,
  } = useAuth();

  const {
    dashboard,
    loading,
    error,
  } = useDashboard();

  const canViewJournaux =
    user?.role === ROLES.ADMIN ||
    user?.role ===
      ROLES.RESPONSABLE;

  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          minHeight: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderColor: "divider",
        }}
      >
        <Stack
          spacing={1.5}
          sx={{
            alignItems: "center",
          }}
        >
          <CircularProgress size={36} />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Chargement du tableau de
            bord...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (error || !dashboard) {
    return (
      <Alert
        severity="error"
        variant="outlined"
      >
        <AlertTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Tableau de bord indisponible
        </AlertTitle>

        {error ??
          "Les données du tableau de bord sont indisponibles."}
      </Alert>
    );
  }

  const {
    statistiques,
    dernieresDemandes,
    derniersJournaux,
  } = dashboard;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue générale de l’activité et du traitement des inscriptions foncières."
        icon={<DashboardRoundedIcon />}
      />

      {/* Cartes statistiques */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2.5,
        }}
      >
        <DashboardStatCard
          title="Total des demandes"
          value={
            statistiques.totalDemandes
          }
          icon={
            <AssignmentRoundedIcon />
          }
          description="Ensemble des demandes enregistrées."
        />

        <DashboardStatCard
          title="Demandes en attente"
          value={
            statistiques.demandesEnAttente
          }
          icon={
            <HourglassEmptyRoundedIcon />
          }
          description="Demandes encore modifiables par l’agent."
        />

        <DashboardStatCard
          title="Demandes en cours"
          value={
            statistiques.demandesEnCours
          }
          icon={
            <AutorenewRoundedIcon />
          }
          description="Demandes transmises pour vérification."
        />

        <DashboardStatCard
          title="Demandes validées"
          value={
            statistiques.demandesValidees
          }
          icon={
            <CheckCircleRoundedIcon />
          }
          description="Dossiers acceptés après vérification."
        />

        <DashboardStatCard
          title="Demandes rejetées"
          value={
            statistiques.demandesRejetees
          }
          icon={
            <CancelRoundedIcon />
          }
          description="Dossiers rejetés avec un motif."
        />

        <DashboardStatCard
          title="Demandes clôturées"
          value={
            statistiques.demandesCloturees
          }
          icon={
            <LockClockRoundedIcon />
          }
          description="Demandes rattachées à un journal."
        />

        <DashboardStatCard
          title="Documents non conformes"
          value={
            statistiques.documentsNonConformes
          }
          icon={
            <DescriptionRoundedIcon />
          }
          description="Pièces signalées comme non conformes."
        />
      </Box>

      {/* Dernières demandes */}

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: {
            xs: 2.5,
            sm: 4,
          },
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent:
              "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
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
              <AssignmentRoundedIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Dernières demandes
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                }}
              >
                Demandes récemment
                enregistrées dans le
                système.
              </Typography>
            </Box>
          </Box>

          <Button
            endIcon={
              <ArrowForwardRoundedIcon />
            }
            onClick={() =>
              navigate("/demandes")
            }
          >
            Voir toutes les demandes
          </Button>
        </Box>

        {dernieresDemandes.length ===
        0 ? (
          <Alert
            severity="info"
            variant="outlined"
          >
            Aucune demande n’a encore été
            enregistrée.
          </Alert>
        ) : (
          <>
            {/* Tableau ordinateur */}

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
                borderColor: "divider",
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  minWidth: 1000,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Numéro
                    </TableCell>

                    <TableCell>
                      Demandeur
                    </TableCell>

                    <TableCell>
                      CIN
                    </TableCell>

                    <TableCell>
                      Référence foncière
                    </TableCell>

                    <TableCell>
                      Statut
                    </TableCell>

                    <TableCell>
                      Date de création
                    </TableCell>

                    <TableCell align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dernieresDemandes.map(
                    (demande) => (
                      <TableRow
                        key={demande.id}
                        hover
                        sx={{
                          "&:last-child td":
                            {
                              borderBottom:
                                0,
                            },
                        }}
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              color:
                                "primary.main",
                              fontWeight: 800,
                            }}
                          >
                            {demande.numero}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            {
                              demande.prenomDemandeur
                            }{" "}
                            {
                              demande.nomDemandeur
                            }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {demande.cin ||
                            "—"}
                        </TableCell>

                        <TableCell>
                          {
                            demande.referenceFonciere
                          }
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={getStatusLabel(
                              demande.statut
                            )}
                            color={getStatusColor(
                              demande.statut
                            )}
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          {formatDateTime(
                            demande.createdAt
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Tooltip title="Consulter la demande">
                            <IconButton
                              component={
                                Link
                              }
                              to={`/demandes/${demande.id}`}
                              color="primary"
                              aria-label={`Consulter la demande ${demande.numero}`}
                            >
                              <VisibilityRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Cartes mobile */}

            <Stack
              spacing={2}
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
              }}
            >
              {dernieresDemandes.map(
                (demande) => (
                  <Paper
                    key={demande.id}
                    variant="outlined"
                    sx={{
                      p: 2.25,
                      borderColor:
                        "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display:
                              "block",
                            fontWeight:
                              700,
                          }}
                        >
                          Numéro
                        </Typography>

                        <Typography
                          sx={{
                            color:
                              "primary.main",
                            fontWeight: 800,
                          }}
                        >
                          {demande.numero}
                        </Typography>
                      </Box>

                      <Chip
                        label={getStatusLabel(
                          demande.statut
                        )}
                        color={getStatusColor(
                          demande.statut
                        )}
                        size="small"
                      />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1.5}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display:
                              "block",
                            fontWeight:
                              700,
                          }}
                        >
                          Demandeur
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {
                            demande.prenomDemandeur
                          }{" "}
                          {
                            demande.nomDemandeur
                          }
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display:
                              "block",
                            fontWeight:
                              700,
                          }}
                        >
                          Référence foncière
                        </Typography>

                        <Typography variant="body2">
                          {
                            demande.referenceFonciere
                          }
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display:
                              "block",
                            fontWeight:
                              700,
                          }}
                        >
                          Date de création
                        </Typography>

                        <Typography variant="body2">
                          {formatDateTime(
                            demande.createdAt
                          )}
                        </Typography>
                      </Box>
                    </Stack>

                    <Button
                      component={Link}
                      to={`/demandes/${demande.id}`}
                      fullWidth
                      variant="outlined"
                      startIcon={
                        <VisibilityRoundedIcon />
                      }
                      sx={{
                        mt: 2.5,
                      }}
                    >
                      Consulter la demande
                    </Button>
                  </Paper>
                )
              )}
            </Stack>
          </>
        )}
      </Paper>

      {/* Journaux : uniquement ADMIN et RESPONSABLE */}

      {canViewJournaux && (
        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: {
              xs: 2.5,
              sm: 4,
            },
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              justifyContent:
                "space-between",
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems:
                  "flex-start",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  borderRadius: 2.5,
                  color: "primary.main",
                  bgcolor:
                    "rgba(10, 74, 70, 0.10)",
                }}
              >
                <LockClockRoundedIcon />
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Derniers journaux de
                  clôture
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                  }}
                >
                  Dernières journées
                  clôturées dans le
                  système.
                </Typography>
              </Box>
            </Box>

            <Button
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              onClick={() =>
                navigate(
                  "/journaux-cloture"
                )
              }
            >
              Voir tous les journaux
            </Button>
          </Box>

          {derniersJournaux.length ===
          0 ? (
            <Alert
              severity="info"
              variant="outlined"
            >
              Aucun journal de clôture
              enregistré.
            </Alert>
          ) : (
            <>
              {/* Tableau ordinateur */}

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  display: {
                    xs: "none",
                    md: "block",
                  },
                  borderColor:
                    "divider",
                  overflowX: "auto",
                }}
              >
                <Table
                  sx={{
                    minWidth: 900,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Numéro
                      </TableCell>

                      <TableCell>
                        Journée clôturée
                      </TableCell>

                      <TableCell>
                        Date de clôture
                      </TableCell>

                      <TableCell>
                        Responsable
                      </TableCell>

                      <TableCell>
                        Demandes
                      </TableCell>

                      <TableCell align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {derniersJournaux.map(
                      (journal) => (
                        <TableRow
                          key={journal.id}
                          hover
                          sx={{
                            "&:last-child td":
                              {
                                borderBottom:
                                  0,
                              },
                          }}
                        >
                          <TableCell>
                            <Typography
                              sx={{
                                color:
                                  "primary.main",
                                fontWeight:
                                  800,
                              }}
                            >
                              {
                                journal.numero
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {formatDate(
                              journal.dateJour
                            )}
                          </TableCell>

                          <TableCell>
                            {formatDateTime(
                              journal.dateCloture
                            )}
                          </TableCell>

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                alignItems:
                                  "center",
                              }}
                            >
                              <PersonRoundedIcon
                                sx={{
                                  fontSize:
                                    19,
                                  color:
                                    "primary.main",
                                }}
                              />

                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  journal
                                    .responsable
                                    .prenom
                                }{" "}
                                {
                                  journal
                                    .responsable
                                    .nom
                                }
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={
                                <FolderCopyRoundedIcon />
                              }
                              label={`${
                                journal
                                  ._count
                                  .demandes
                              } demande${
                                journal
                                  ._count
                                  .demandes >
                                1
                                  ? "s"
                                  : ""
                              }`}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip title="Consulter le journal">
                              <IconButton
                                component={
                                  Link
                                }
                                to={`/journaux-cloture/${journal.id}`}
                                color="primary"
                                aria-label={`Consulter le journal ${journal.numero}`}
                              >
                                <VisibilityRoundedIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Cartes mobile */}

              <Stack
                spacing={2}
                sx={{
                  display: {
                    xs: "flex",
                    md: "none",
                  },
                }}
              >
                {derniersJournaux.map(
                  (journal) => (
                    <Paper
                      key={journal.id}
                      variant="outlined"
                      sx={{
                        p: 2.25,
                        borderColor:
                          "divider",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display:
                                "block",
                              fontWeight:
                                700,
                            }}
                          >
                            Journal
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                "primary.main",
                              fontWeight:
                                800,
                            }}
                          >
                            {journal.numero}
                          </Typography>
                        </Box>

                        <Chip
                          label={`${
                            journal._count
                              .demandes
                          } demande${
                            journal._count
                              .demandes > 1
                              ? "s"
                              : ""
                          }`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Stack>

                      <Divider
                        sx={{
                          my: 2,
                        }}
                      />

                      <Stack spacing={1.5}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display:
                                "block",
                              fontWeight:
                                700,
                            }}
                          >
                            Journée clôturée
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              alignItems:
                                "center",
                            }}
                          >
                            <CalendarMonthRoundedIcon
                              sx={{
                                fontSize:
                                  18,
                                color:
                                  "text.secondary",
                              }}
                            />

                            <Typography variant="body2">
                              {formatDate(
                                journal.dateJour
                              )}
                            </Typography>
                          </Stack>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display:
                                "block",
                              fontWeight:
                                700,
                            }}
                          >
                            Responsable
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              journal
                                .responsable
                                .prenom
                            }{" "}
                            {
                              journal
                                .responsable
                                .nom
                            }
                          </Typography>
                        </Box>
                      </Stack>

                      <Button
                        component={Link}
                        to={`/journaux-cloture/${journal.id}`}
                        fullWidth
                        variant="outlined"
                        startIcon={
                          <VisibilityRoundedIcon />
                        }
                        sx={{
                          mt: 2.5,
                        }}
                      >
                        Consulter le journal
                      </Button>
                    </Paper>
                  )
                )}
              </Stack>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}

/*
 * Tableau de bord réservé au Caissier.
 *
 * Il ne charge pas les statistiques générales,
 * car le Caissier doit uniquement consulter
 * les demandes en attente de paiement.
 */
function CaissierDashboardPage() {
  const navigate =
    useNavigate();

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      <PageHeader
        title="Espace caisse"
        subtitle="Consultez les demandes en attente et enregistrez les paiements effectués par les citoyens."
        icon={
          <DashboardRoundedIcon />
        }
      />

      <Alert
        severity="info"
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <AlertTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Gestion des encaissements
        </AlertTitle>

        La liste de la caisse contient uniquement
        les demandes en attente qui ne possèdent
        pas encore de paiement.
      </Alert>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2.5,
            sm: 4,
          },

          borderColor:
            "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent:
              "space-between",
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems:
                "flex-start",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                flexShrink: 0,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                borderRadius: 2.5,
                color:
                  "primary.main",
                bgcolor:
                  "rgba(10, 74, 70, 0.10)",
              }}
            >
              <AssignmentRoundedIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Demandes à encaisser
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  maxWidth: 650,
                }}
              >
                Ouvrez la liste des demandes,
                consultez le montant exigible,
                saisissez le montant remis par
                le citoyen et validez le paiement
                en espèces.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={
              <AssignmentRoundedIcon />
            }
            endIcon={
              <ArrowForwardRoundedIcon />
            }
            onClick={() =>
              navigate(
                "/demandes"
              )
            }
            sx={{
              whiteSpace:
                "nowrap",
            }}
          >
            Ouvrir les demandes à encaisser
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

/*
 * Sélection du tableau de bord selon
 * le rôle de l’utilisateur connecté.
 */
function DashboardPage() {
  const {
    user,
  } = useAuth();

  if (!user) {
    return (
      <Paper
        variant="outlined"
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  if (
    user.role ===
    ROLES.CAISSIER
  ) {
    return (
      <CaissierDashboardPage />
    );
  }

  return (
    <StandardDashboardPage />
  );
}

export default DashboardPage;