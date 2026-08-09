import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PriceCheckRoundedIcon from "@mui/icons-material/PriceCheckRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

import {
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import PageHeader from "../../components/common/PageHeader";

import {
  useJournalCaisse,
} from "../../hooks/useJournalCaisse";

import {
  useAuth,
} from "../../hooks/useAuth";

import journalCaisseService from "../../services/journal-caisse.service";

import {
  StatutJournalCaisse,
} from "../../types/journal-caisse";

import {
  ROLES,
} from "../../utils/roles";

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

function formatDateJour(
  value?: string | null
): string {
  if (!value) {
    return "Non renseignée";
  }

  /*
   * Le champ dateJour est une date SQL,
   * par exemple 2026-08-04T00:00:00.000Z.
   *
   * On utilise directement la partie YYYY-MM-DD
   * pour éviter les décalages de fuseau horaire.
   */
  const datePart =
    value.slice(
      0,
      10
    );

  const [
    year,
    month,
    day,
  ] = datePart.split(
    "-"
  );

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatDateTime(
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

function ViewJournalCaissePage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const {
    user,
  } = useAuth();

  const journalId =
    id ?? "";

  const {
    journal,
    loading,
    refreshing,
    closing,
    errorMessage,
    reload,
    closeJournal,
  } = useJournalCaisse(
    journalId
  );

  const [
    closeDialogOpen,
    setCloseDialogOpen,
  ] = useState(false);

  const [
    observations,
    setObservations,
  ] = useState("");

  const [
    receiptLoadingId,
    setReceiptLoadingId,
  ] = useState<
    string | null
  >(null);

  const canClose =
    Boolean(
      journal &&
        journal.statut ===
          StatutJournalCaisse.OUVERT &&
        (
          user?.role ===
            ROLES.ADMIN ||
          user?.role ===
            ROLES.CAISSIER
        )
    );

  const canOpenReceipt =
    user?.role ===
      ROLES.ADMIN ||
    user?.role ===
      ROLES.CAISSIER;

  const handleReload =
    async () => {
      try {
        await reload();
      } catch {
        toast.error(
          "Le journal n’a pas pu être actualisé."
        );
      }
    };

  const handleCloseJournal =
    async () => {
      try {
        await closeJournal({
          observations:
            observations
              .trim() ||
            undefined,
        });

        setCloseDialogOpen(
          false
        );

        setObservations(
          ""
        );

        toast.success(
          "Journal de caisse clôturé avec succès."
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "La clôture du journal a échoué."
        );
      }
    };

  const handleOpenReceipt =
    async (
      paiementId: string,
      numeroRecu: string
    ) => {
      try {
        setReceiptLoadingId(
          paiementId
        );

        const blob =
          await journalCaisseService
            .getRecuPdf(
              paiementId
            );

        const blobUrl =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          blobUrl;

        link.target =
          "_blank";

        link.rel =
          "noopener noreferrer";

        link.setAttribute(
          "aria-label",
          `Ouvrir le reçu ${numeroRecu}`
        );

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        /*
         * Le délai laisse le temps au navigateur
         * d’ouvrir le document avant de libérer
         * l’adresse temporaire.
         */
        window.setTimeout(
          () => {
            URL.revokeObjectURL(
              blobUrl
            );
          },
          60_000
        );
      } catch {
        toast.error(
          "Le reçu PDF n’a pas pu être ouvert."
        );
      } finally {
        setReceiptLoadingId(
          null
        );
      }
    };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight:
            360,

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

  if (
    !journal
  ) {
    return (
      <>
        <PageHeader
          title="Journal de caisse"
          subtitle="Le journal demandé n’a pas pu être chargé."
          icon={
            <PointOfSaleRoundedIcon />
          }
          actions={
            <Button
              variant="outlined"
              startIcon={
                <ArrowBackRoundedIcon />
              }
              onClick={() =>
                navigate(
                  "/journaux-caisse"
                )
              }
            >
              Retour
            </Button>
          }
        />

        <Alert severity="error">
          {errorMessage ??
            "Journal de caisse introuvable."}
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={
          journal.numero
        }
        subtitle="Détail des encaissements, des reçus et des totaux financiers du journal."
        icon={
          <PointOfSaleRoundedIcon />
        }
        actions={
          <Stack
            direction={{
              xs:
                "column",

              sm:
                "row",
            }}
            spacing={
              1
            }
          >
            <Button
              variant="outlined"
              startIcon={
                <ArrowBackRoundedIcon />
              }
              onClick={() =>
                navigate(
                  "/journaux-caisse"
                )
              }
            >
              Retour
            </Button>

            <Button
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
                void handleReload();
              }}
            >
              Actualiser
            </Button>

            {canClose && (
              <Button
                variant="contained"
                color="warning"
                startIcon={
                  <LockRoundedIcon />
                }
                onClick={() =>
                  setCloseDialogOpen(
                    true
                  )
                }
              >
                Clôturer la caisse
              </Button>
            )}
          </Stack>
        }
      />

      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            mb:
              3,
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Informations principales */}

      <Paper
        variant="outlined"
        sx={{
          p:
            3,

          mb:
            3,
        }}
      >
        <Box
          sx={{
            display:
              "grid",

            gridTemplateColumns: {
              xs:
                "1fr",

              md:
                "repeat(2, minmax(0, 1fr))",

              xl:
                "repeat(4, minmax(0, 1fr))",
            },

            gap:
              3,
          }}
        >
          <Stack
            direction="row"
            spacing={
              1.5
            }
          >
            <CalendarMonthRoundedIcon
              color="primary"
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Journée
              </Typography>

              <Typography
                sx={{
                  fontWeight:
                    700,
                }}
              >
                {formatDateJour(
                  journal.dateJour
                )}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={
              1.5
            }
          >
            <PersonRoundedIcon
              color="primary"
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Caissier
              </Typography>

              <Typography
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
            </Box>
          </Stack>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Statut
            </Typography>

            <Box
              sx={{
                mt:
                  0.5,
              }}
            >
              <Chip
                label={
                  journal.statut ===
                  StatutJournalCaisse.CLOTURE
                    ? "Clôturé"
                    : "Ouvert"
                }
                color={
                  journal.statut ===
                  StatutJournalCaisse.CLOTURE
                    ? "success"
                    : "warning"
                }
                variant={
                  journal.statut ===
                  StatutJournalCaisse.CLOTURE
                    ? "filled"
                    : "outlined"
                }
                size="small"
              />
            </Box>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Date de clôture
            </Typography>

            <Typography
              sx={{
                mt:
                  0.5,

                fontWeight:
                  700,
              }}
            >
              {journal.dateCloture
                ? formatDateTime(
                    journal.dateCloture
                  )
                : "Journal non clôturé"}
            </Typography>
          </Box>
        </Box>

        {journal.observations && (
          <>
            <Divider
              sx={{
                my:
                  3,
              }}
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Observations de clôture
              </Typography>

              <Typography
                sx={{
                  mt:
                    0.5,
                }}
              >
                {
                  journal.observations
                }
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Totaux financiers */}

      <Box
        sx={{
          display:
            "grid",

          gridTemplateColumns: {
            xs:
              "1fr",

            sm:
              "repeat(2, minmax(0, 1fr))",

            xl:
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

            gap:
              1.5,

            alignItems:
              "center",
          }}
        >
          <ReceiptLongRoundedIcon
            color="info"
          />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Nombre de paiements
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  800,
              }}
            >
              {
                journal
                  .totals
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

            gap:
              1.5,

            alignItems:
              "center",
          }}
        >
          <PriceCheckRoundedIcon
            color="primary"
          />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Montant exigible
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  800,
              }}
            >
              {formatMontant(
                journal
                  .totals
                  .montantTotalExigible
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

            gap:
              1.5,

            alignItems:
              "center",
          }}
        >
          <AccountBalanceWalletRoundedIcon
            color="warning"
          />

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
                journal
                  .totals
                  .monnaieTotaleRendue
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

            gap:
              1.5,

            alignItems:
              "center",
          }}
        >
          <PaymentsRoundedIcon
            color="success"
          />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Total encaissé
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  800,
              }}
            >
              {formatMontant(
                journal
                  .totals
                  .montantTotalEncaisse
              )}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Paiements du journal */}

      <Paper
        variant="outlined"
        sx={{
          overflow:
            "hidden",
        }}
      >
        <Box
          sx={{
            px:
              3,

            py:
              2.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight:
                800,
            }}
          >
            Paiements du journal
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Liste des encaissements rattachés à cette caisse.
          </Typography>
        </Box>

        <Divider />

        <TableContainer>
          <Table
            sx={{
              minWidth:
                1100,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  Reçu
                </TableCell>

                <TableCell>
                  Demande
                </TableCell>

                <TableCell>
                  Demandeur
                </TableCell>

                <TableCell>
                  Référence foncière
                </TableCell>

                <TableCell>
                  Montant exigible
                </TableCell>

                <TableCell>
                  Montant remis
                </TableCell>

                <TableCell>
                  Monnaie rendue
                </TableCell>

                <TableCell>
                  Encaissé
                </TableCell>

                <TableCell>
                  Heure
                </TableCell>

                <TableCell
                  align="center"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {journal
                .paiements
                .length ===
              0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      10
                    }
                    align="center"
                    sx={{
                      py:
                        6,

                      color:
                        "text.secondary",
                    }}
                  >
                    Aucun paiement n’est rattaché à ce journal.
                  </TableCell>
                </TableRow>
              ) : (
                journal
                  .paiements
                  .map(
                    (
                      paiement
                    ) => (
                      <TableRow
                        key={
                          paiement.id
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
                            paiement.numeroRecu
                          }
                        </TableCell>

                        <TableCell>
                          {
                            paiement
                              .demande
                              .numero
                          }
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              paiement
                                .demande
                                .prenomDemandeur
                            }{" "}
                            {
                              paiement
                                .demande
                                .nomDemandeur
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            CIN :{" "}
                            {
                              paiement
                                .demande
                                .cin
                            }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {
                            paiement
                              .demande
                              .referenceFonciere
                          }
                        </TableCell>

                        <TableCell>
                          {formatMontant(
                            paiement
                              .montantExigible
                          )}
                        </TableCell>

                        <TableCell>
                          {formatMontant(
                            paiement
                              .montantRemis
                          )}
                        </TableCell>

                        <TableCell>
                          {formatMontant(
                            paiement
                              .monnaieRendue
                          )}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight:
                              800,

                            color:
                              "success.main",
                          }}
                        >
                          {formatMontant(
                            paiement
                              .montantEncaisse
                          )}
                        </TableCell>

                        <TableCell>
                          {formatDateTime(
                            paiement
                              .datePaiement
                          )}
                        </TableCell>

                        <TableCell
                          align="center"
                        >
                          {canOpenReceipt ? (
                            <Tooltip title="Ouvrir le reçu PDF">
                              <span>
                                <IconButton
                                  color="error"
                                  disabled={
                                    receiptLoadingId ===
                                    paiement.id
                                  }
                                  onClick={() => {
                                    void handleOpenReceipt(
                                      paiement.id,
                                      paiement.numeroRecu
                                    );
                                  }}
                                  aria-label={`Ouvrir le reçu ${paiement.numeroRecu}`}
                                >
                                  {receiptLoadingId ===
                                  paiement.id ? (
                                    <CircularProgress
                                      size={
                                        22
                                      }
                                    />
                                  ) : (
                                    <PictureAsPdfRoundedIcon />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Lecture seule
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogue de clôture */}

      <Dialog
        open={
          closeDialogOpen
        }
        onClose={() => {
          if (
            !closing
          ) {
            setCloseDialogOpen(
              false
            );
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Clôturer le journal de caisse
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              mb:
                2,
            }}
          >
            Après la clôture, aucun nouvel encaissement ne pourra être ajouté à cette caisse pendant la journée.
          </DialogContentText>

          <Alert
            severity="warning"
            sx={{
              mb:
                2,
            }}
          >
            Journal :{" "}
            <strong>
              {journal.numero}
            </strong>
            <br />
            Total encaissé :{" "}
            <strong>
              {formatMontant(
                journal
                  .totals
                  .montantTotalEncaisse
              )}
            </strong>
          </Alert>

          <TextField
            label="Observations"
            value={
              observations
            }
            onChange={(
              event
            ) =>
              setObservations(
                event.target.value
              )
            }
            multiline
            minRows={
              3
            }
            fullWidth
            disabled={
              closing
            }
            slotProps={{
              htmlInput: {
                maxLength:
                  500,
              },
            }}
            helperText={`${observations.length}/500 caractères`}
          />
        </DialogContent>

        <DialogActions>
          <Button
            type="button"
            disabled={
              closing
            }
            onClick={() =>
              setCloseDialogOpen(
                false
              )
            }
          >
            Annuler
          </Button>

          <Button
            type="button"
            variant="contained"
            color="warning"
            startIcon={
              closing ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <LockRoundedIcon />
              )
            }
            disabled={
              closing ||
              observations.length >
                500
            }
            onClick={() => {
              void handleCloseJournal();
            }}
          >
            {closing
              ? "Clôture..."
              : "Confirmer la clôture"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ViewJournalCaissePage;