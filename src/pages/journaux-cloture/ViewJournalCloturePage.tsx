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

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import type {
  ReactNode,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";

import {
  useJournalCloture,
} from "../../hooks/useJournalCloture";

import {
  formatDate,
  formatDateTime,
} from "../../utils/date";

import {
  getStatusColor,
  getStatusLabel,
} from "../../utils/demande";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

interface DetailItemProps {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
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
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function DetailItem({
  label,
  value,
  fullWidth = false,
}: DetailItemProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        gridColumn: fullWidth
          ? "1 / -1"
          : "auto",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.6,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </Typography>

      <Typography
        component="div"
        sx={{
          fontWeight: 600,
          lineHeight: 1.6,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ViewJournalCloturePage() {
  const navigate = useNavigate();

  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const {
    journal,
    loading,
    error,
  } = useJournalCloture(id ?? "");

  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          minHeight: 320,
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
          <CircularProgress size={34} />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Chargement du journal de
            clôture...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (error) {
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
          Chargement impossible
        </AlertTitle>

        Une erreur est survenue pendant le
        chargement du journal de clôture.
      </Alert>
    );
  }

  if (!journal) {
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
          Journal introuvable
        </AlertTitle>

        Le journal de clôture demandé
        n’existe pas ou n’est plus
        disponible.
      </Alert>
    );
  }

  const demandes =
    journal.demandes ?? [];

  const demandesCount =
    journal._count?.demandes ??
    demandes.length;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <PageHeader
        title={`Journal ${journal.numero}`}
        subtitle="Consultez les informations de la clôture et les demandes qui lui sont rattachées."
        icon={<LockClockRoundedIcon />}
        breadcrumbs={[
          {
            label: "Journaux de clôture",
            onClick: () =>
              navigate(
                "/journaux-cloture"
              ),
          },
          {
            label: journal.numero,
          },
        ]}
      />

      <Button
        startIcon={
          <ArrowBackRoundedIcon />
        }
        onClick={() =>
          navigate(
            "/journaux-cloture"
          )
        }
        sx={{
          mb: 3,
        }}
      >
        Retour à la liste
      </Button>

      {/* Résumé du journal */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderColor:
              "rgba(10, 74, 70, 0.18)",
            bgcolor:
              "rgba(10, 74, 70, 0.06)",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
            }}
          >
            <LockClockRoundedIcon
              sx={{
                color: "primary.main",
              }}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mb: 0.35,
                  fontWeight: 700,
                }}
              >
                Numéro du journal
              </Typography>

              <Typography
                sx={{
                  color: "primary.main",
                  fontWeight: 800,
                  overflowWrap: "anywhere",
                }}
              >
                {journal.numero}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
            }}
          >
            <CalendarMonthRoundedIcon
              sx={{
                color: "primary.main",
              }}
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mb: 0.35,
                  fontWeight: 700,
                }}
              >
                Journée clôturée
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {formatDate(
                  journal.dateJour
                )}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
            }}
          >
            <EventAvailableRoundedIcon
              sx={{
                color: "primary.main",
              }}
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mb: 0.35,
                  fontWeight: 700,
                }}
              >
                Clôture effectuée le
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                }}
              >
                {formatDateTime(
                  journal.dateCloture
                )}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
            }}
          >
            <FolderCopyRoundedIcon
              sx={{
                color: "primary.main",
              }}
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mb: 0.35,
                  fontWeight: 700,
                }}
              >
                Demandes rattachées
              </Typography>

              <Chip
                label={`${demandesCount} demande${
                  demandesCount > 1
                    ? "s"
                    : ""
                }`}
                color="primary"
                size="small"
                variant="outlined"
              />
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Informations générales */}

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
        <SectionHeader
          icon={<PersonRoundedIcon />}
          title="Informations de la clôture"
          subtitle="Responsable ayant effectué la clôture et informations administratives du journal."
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            columnGap: 4,
            rowGap: 3,
          }}
        >
          <DetailItem
            label="Responsable"
            value={`${journal.responsable.prenom} ${journal.responsable.nom}`}
          />

          <DetailItem
            label="Identifiant du responsable"
            value={
              journal.responsable.login ||
              "Non disponible"
            }
          />

          <DetailItem
            label="Date de création du journal"
            value={formatDateTime(
              journal.createdAt
            )}
          />

          <DetailItem
            label="Dernière modification"
            value={formatDateTime(
              journal.updatedAt
            )}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <SectionHeader
          icon={<NotesRoundedIcon />}
          title="Observations"
          subtitle="Informations complémentaires enregistrées lors de la clôture."
        />

        <Box
          sx={{
            minHeight: 88,
            p: 2.5,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.75,
              color: journal.observations
                ? "text.primary"
                : "text.secondary",
            }}
          >
            {journal.observations ||
              "Aucune observation n’a été enregistrée."}
          </Typography>
        </Box>
      </Paper>

      {/* Demandes rattachées */}

      <Paper
        variant="outlined"
        sx={{
          width: "100%",
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
          <SectionHeader
            icon={<AssignmentRoundedIcon />}
            title="Demandes clôturées"
            subtitle="Demandes finalisées et rattachées à ce journal de clôture."
          />

          {demandes.length > 0 && (
            <Chip
              icon={
                <FolderCopyRoundedIcon />
              }
              label={`${demandes.length} demande${
                demandes.length > 1
                  ? "s"
                  : ""
              }`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {demandes.length === 0 ? (
          <Alert
            severity="info"
            variant="outlined"
          >
            Aucune demande n’est rattachée à
            ce journal.
          </Alert>
        ) : (
          <>
            {/* Tableau sur ordinateur */}

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
                  minWidth: 1050,
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
                      Dernière modification
                    </TableCell>

                    <TableCell align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {demandes.map(
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
                          {demande.referenceFonciere ||
                            "—"}
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
                          {demande.updatedAt
                            ? formatDateTime(
                                demande.updatedAt
                              )
                            : "—"}
                        </TableCell>

                        <TableCell align="center">
                          <Tooltip title="Consulter la demande">
                            <IconButton
                              component={Link}
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

            {/* Cartes sur téléphone */}

            <Stack
              spacing={2}
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
              }}
            >
              {demandes.map(
                (demande) => (
                  <Paper
                    key={demande.id}
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderColor:
                        "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        alignItems:
                          "flex-start",
                        justifyContent:
                          "space-between",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display:
                              "block",
                            mb: 0.35,
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
                            overflowWrap:
                              "anywhere",
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

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(0, 1fr))",
                        },
                        gap: 2,
                      }}
                    >
                      <DetailItem
                        label="Demandeur"
                        value={`${demande.prenomDemandeur} ${demande.nomDemandeur}`}
                      />

                      <DetailItem
                        label="CIN"
                        value={
                          demande.cin ||
                          "Non renseignée"
                        }
                      />

                      <DetailItem
                        label="Référence foncière"
                        value={
                          demande.referenceFonciere ||
                          "Non renseignée"
                        }
                      />

                      <DetailItem
                        label="Dernière modification"
                        value={
                          demande.updatedAt
                            ? formatDateTime(
                                demande.updatedAt
                              )
                            : "Non disponible"
                        }
                      />
                    </Box>

                    {demande.motifRejet && (
                      <Alert
                        severity="error"
                        variant="outlined"
                        sx={{
                          mt: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            mb: 0.4,
                          }}
                        >
                          Motif du rejet
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          {
                            demande.motifRejet
                          }
                        </Typography>
                      </Alert>
                    )}

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
    </Box>
  );
}

export default ViewJournalCloturePage;