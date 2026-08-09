import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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

import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";

import {
  Link,
} from "react-router-dom";

import {
  useMemo,
} from "react";

import PageHeader from "../../components/common/PageHeader";
import PaginationBar from "../../components/common/PaginationBar";

import {
  useJournauxCaisse,
} from "../../hooks/useJournauxCaisse";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  ROLES,
} from "../../utils/roles";

import {
  StatutJournalCaisse,
} from "../../types/journal-caisse";

import type {
  JournalCaisseResume,
} from "../../types/journal-caisse";

function formatMontant(
  value:
    | string
    | number
): string {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return "0,000 DT";
  }

  return `${amount
    .toFixed(3)
    .replace(".", ",")} DT`;
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "Non renseignée";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function formatDateTime(
  value?: string | null
): string {
  if (!value) {
    return "Non clôturé";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getStatutLabel(
  journal:
    JournalCaisseResume
): string {
  switch (
    journal.statut
  ) {
    case StatutJournalCaisse.CLOTURE:
      return "Clôturé";

    case StatutJournalCaisse.OUVERT:
    default:
      return "Ouvert";
  }
}

function getStatutColor(
  journal:
    JournalCaisseResume
):
  | "success"
  | "warning" {
  return journal.statut ===
    StatutJournalCaisse.CLOTURE
    ? "success"
    : "warning";
}

function JournalCaisseListPage() {
  const {
    user,
  } = useAuth();

  const {
    journaux,
    loading,
    refreshing,
    errorMessage,

    page,
    setPage,

    total,
    totalPages,

    loadJournaux,
  } = useJournauxCaisse();

  const isCaissier =
    user?.role ===
    ROLES.CAISSIER;

  /*
   * Résumé financier des journaux
   * actuellement affichés sur la page.
   */
  const pageSummary =
    useMemo(() => {
      return journaux.reduce(
        (
          accumulator,
          journal
        ) => {
          accumulator
            .nombrePaiements +=
            journal
              .totals
              .nombrePaiements;

          accumulator
            .montantEncaisse +=
            Number(
              journal
                .totals
                .montantTotalEncaisse
            ) || 0;

          accumulator
            .monnaieRendue +=
            Number(
              journal
                .totals
                .monnaieTotaleRendue
            ) || 0;

          return accumulator;
        },
        {
          nombrePaiements:
            0,

          montantEncaisse:
            0,

          monnaieRendue:
            0,
        }
      );
    }, [journaux]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight:
            320,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title={
          isCaissier
            ? "Mes journaux de caisse"
            : "Journaux de caisse"
        }
        subtitle={
          isCaissier
            ? "Consultez vos encaissements journaliers et l’état de clôture de votre caisse."
            : "Consultez les encaissements journaliers, les totaux financiers et l’état de clôture des caisses."
        }
        icon={
          <PointOfSaleRoundedIcon />
        }
        actions={
          <Button
            type="button"
            variant="outlined"
            startIcon={
              refreshing ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <RefreshRoundedIcon />
              )
            }
            disabled={
              refreshing
            }
            onClick={() => {
              void loadJournaux();
            }}
          >
            {refreshing
              ? "Actualisation..."
              : "Actualiser"}
          </Button>
        }
      />

      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Résumé de la page */}

      <Box
        sx={{
          display:
            "grid",

          gridTemplateColumns: {
            xs:
              "1fr",

            sm:
              "repeat(2, minmax(0, 1fr))",

            lg:
              "repeat(4, minmax(0, 1fr))",
          },

          gap:
            2,

          mb:
            3,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p:
              2.5,

            display:
              "flex",

            alignItems:
              "center",

            gap:
              1.5,
          }}
        >
          <Box
            sx={{
              width:
                44,

              height:
                44,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              borderRadius:
                2.5,

              color:
                "primary.main",

              bgcolor:
                "rgba(10, 74, 70, 0.10)",
            }}
          >
            <PointOfSaleRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Nombre de journaux
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  800,
              }}
            >
              {total}
            </Typography>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p:
              2.5,

            display:
              "flex",

            alignItems:
              "center",

            gap:
              1.5,
          }}
        >
          <Box
            sx={{
              width:
                44,

              height:
                44,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              borderRadius:
                2.5,

              color:
                "info.main",

              bgcolor:
                "rgba(2, 136, 209, 0.10)",
            }}
          >
            <ReceiptLongRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Paiements affichés
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  800,
              }}
            >
              {
                pageSummary
                  .nombrePaiements
              }
            </Typography>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p:
              2.5,

            display:
              "flex",

            alignItems:
              "center",

            gap:
              1.5,
          }}
        >
          <Box
            sx={{
              width:
                44,

              height:
                44,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              borderRadius:
                2.5,

              color:
                "success.main",

              bgcolor:
                "rgba(46, 125, 50, 0.10)",
            }}
          >
            <PaymentsRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Total encaissé affiché
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  800,
              }}
            >
              {formatMontant(
                pageSummary
                  .montantEncaisse
              )}
            </Typography>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p:
              2.5,

            display:
              "flex",

            alignItems:
              "center",

            gap:
              1.5,
          }}
        >
          <Box
            sx={{
              width:
                44,

              height:
                44,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              borderRadius:
                2.5,

              color:
                "warning.main",

              bgcolor:
                "rgba(237, 108, 2, 0.10)",
            }}
          >
            <LockClockRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Monnaie rendue
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  800,
              }}
            >
              {formatMontant(
                pageSummary
                  .monnaieRendue
              )}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Tableau des journaux */}

      <TableContainer
        component={
          Paper
        }
        variant="outlined"
      >
        <Table
          sx={{
            minWidth:
              1050,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                Numéro
              </TableCell>

              <TableCell>
                Journée
              </TableCell>

              <TableCell>
                Caissier
              </TableCell>

              <TableCell
                align="center"
              >
                Paiements
              </TableCell>

              <TableCell>
                Total encaissé
              </TableCell>

              <TableCell>
                Monnaie rendue
              </TableCell>

              <TableCell>
                Statut
              </TableCell>

              <TableCell>
                Date de clôture
              </TableCell>

              <TableCell
                align="center"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {journaux.length ===
            0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    9
                  }
                  align="center"
                  sx={{
                    py:
                      6,

                    color:
                      "text.secondary",
                  }}
                >
                  Aucun journal de caisse
                  trouvé.
                </TableCell>
              </TableRow>
            ) : (
              journaux.map(
                (
                  journal
                ) => (
                  <TableRow
                    key={
                      journal.id
                    }
                    hover
                  >
                    <TableCell
                      sx={{
                        fontWeight:
                          700,

                        color:
                          "primary.main",
                      }}
                    >
                      {
                        journal.numero
                      }
                    </TableCell>

                    <TableCell>
                      {formatDate(
                        journal.dateJour
                      )}
                    </TableCell>

                    <TableCell>
                      <Stack
                        spacing={
                          0.25
                        }
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight:
                              700,
                          }}
                        >
                          {
                            journal
                              .caissier
                              .prenom
                          }{" "}
                          {
                            journal
                              .caissier
                              .nom
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          @
                          {
                            journal
                              .caissier
                              .login
                          }
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      <Chip
                        label={
                          journal
                            .totals
                            .nombrePaiements
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      {formatMontant(
                        journal
                          .totals
                          .montantTotalEncaisse
                      )}
                    </TableCell>

                    <TableCell>
                      {formatMontant(
                        journal
                          .totals
                          .monnaieTotaleRendue
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatutLabel(
                          journal
                        )}
                        color={getStatutColor(
                          journal
                        )}
                        size="small"
                        variant={
                          journal.statut ===
                          StatutJournalCaisse.CLOTURE
                            ? "filled"
                            : "outlined"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {formatDateTime(
                        journal
                          .dateCloture
                      )}
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      <Tooltip title="Consulter le journal">
                        <IconButton
                          component={
                            Link
                          }
                          to={`/journaux-caisse/${journal.id}`}
                          color="info"
                          aria-label={`Consulter le journal ${journal.numero}`}
                        >
                          <VisibilityRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 0 && (
        <Box
          sx={{
            mt:
              3,
          }}
        >
          <PaginationBar
            page={
              page
            }
            totalPages={
              totalPages
            }
            onChange={
              setPage
            }
          />
        </Box>
      )}
    </>
  );
}

export default JournalCaisseListPage;