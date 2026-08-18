import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import axios from "axios";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import PageHeader from "../../components/common/PageHeader";

import journalClotureService from "../../services/journal-cloture.service";

import type {
  DemandeCloture,
} from "../../types/journal-cloture";

import {
  getStatusColor,
  getStatusLabel,
} from "../../utils/demande";

import {
  formatDate,
} from "../../utils/date";

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}

function getTodayInputValue(): string {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getErrorMessage(
  error: unknown,
  defaultMessage: string
): string {
  if (axios.isAxiosError(error)) {
    const responseData =
      error.response?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData?.errors?.[0]?.message ??
      responseData?.message ??
      defaultMessage
    );
  }

  return defaultMessage;
}

function CreateJournalCloturePage() {
  const navigate = useNavigate();

  const today =
    getTodayInputValue();

  const [
    dateJour,
    setDateJour,
  ] = useState("");

  const [
    observations,
    setObservations,
  ] = useState("");

  const [
    demandes,
    setDemandes,
  ] = useState<DemandeCloture[]>([]);

  const [
    previewDone,
    setPreviewDone,
  ] = useState(false);

  const [
    loadingPreview,
    setLoadingPreview,
  ] = useState(false);

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    confirmOpen,
    setConfirmOpen,
  ] = useState(false);

  const handleDateChange = (
    value: string
  ) => {
    setDateJour(value);

    /*
     * La prévisualisation précédente ne
     * correspond plus à la nouvelle date.
     */
    setDemandes([]);
    setPreviewDone(false);
  };

  const validateSelectedDate =
    (): boolean => {
      if (!dateJour) {
        toast.error(
          "Sélectionnez la journée à clôturer."
        );

        return false;
      }

      if (dateJour > today) {
        toast.error(
          "Une journée future ne peut pas être clôturée."
        );

        return false;
      }

      return true;
    };

  const handlePreview = async () => {
    if (!validateSelectedDate()) {
      return;
    }

    try {
      setLoadingPreview(true);
      setPreviewDone(false);
      setDemandes([]);

      const result =
        await journalClotureService.preview(
          dateJour
        );

      setDemandes(result);
      setPreviewDone(true);

      if (result.length === 0) {
        toast.info(
          "Aucune demande validée au niveau du guichet n’est disponible pour cette journée."
        );
      } else {
        toast.success(
          `${result.length} demande${
            result.length > 1 ? "s" : ""
          } disponible${
            result.length > 1 ? "s" : ""
          } pour la clôture.`
        );
      }
    } catch (error) {
      setDemandes([]);
      setPreviewDone(false);

      toast.error(
        getErrorMessage(
          error,
          "Impossible de prévisualiser la clôture."
        )
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleOpenConfirmation = () => {
    if (!validateSelectedDate()) {
      return;
    }

    if (!previewDone) {
      toast.error(
        "Prévisualisez d’abord les demandes de la journée."
      );

      return;
    }

    if (demandes.length === 0) {
      toast.error(
        "Aucune demande ne peut être clôturée."
      );

      return;
    }

    setConfirmOpen(true);
  };

  const handleCreate = async () => {
    try {
      setCreating(true);

      const journal =
        await journalClotureService.create({
          dateJour,

          observations:
            observations.trim() ||
            undefined,
        });

      toast.success(
        "Journée clôturée avec succès."
      );

      navigate(
        `/journaux-cloture/${journal.id}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Erreur lors de la clôture de la journée."
        )
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <PageHeader
        title="Nouvelle clôture journalière"
        subtitle="Prévisualisez les demandes validées au niveau du guichet avant de générer le journal de clôture."
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
            label: "Nouvelle clôture",
          },
        ]}
      />

      <Button
        startIcon={
          <ArrowBackRoundedIcon />
        }
        disabled={creating}
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

      {/* Avertissement */}

      <Alert
        severity="warning"
        variant="outlined"
        icon={
          <WarningAmberRoundedIcon />
        }
        sx={{
          mb: 3,
          alignItems: "flex-start",
        }}
      >
        <AlertTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Vérification obligatoire
        </AlertTitle>

        La clôture rattache définitivement
        les demandes validées au niveau du
        guichet pour la journée au journal
        généré. Vérifiez la date et la liste
        des demandes avant de confirmer.
      </Alert>

      {/* Paramètres */}

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
            <CalendarMonthRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Informations de la clôture
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.35,
              }}
            >
              Sélectionnez la journée puis
              chargez les demandes pouvant
              être clôturées.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1fr) auto",
            },
            gap: 2,
            alignItems: "start",
          }}
        >
          <TextField
            fullWidth
            required
            type="date"
            label="Journée à clôturer"
            value={dateJour}
            disabled={
              loadingPreview ||
              creating
            }
            onChange={(event) =>
              handleDateChange(
                event.target.value
              )
            }
            helperText="Sélectionnez aujourd’hui ou une journée antérieure."
            slotProps={{
              inputLabel: {
                shrink: true,
              },

              htmlInput: {
                max: today,
              },
            }}
          />

          <Button
            variant="outlined"
            startIcon={
              loadingPreview ? (
                <CircularProgress
                  size={20}
                  color="inherit"
                />
              ) : (
                <PreviewRoundedIcon />
              )
            }
            disabled={
              loadingPreview ||
              creating ||
              !dateJour
            }
            onClick={handlePreview}
            sx={{
              minHeight: 56,
              px: 3,
              whiteSpace: "nowrap",
            }}
          >
            {loadingPreview
              ? "Prévisualisation..."
              : "Prévisualiser"}
          </Button>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Observations"
          placeholder="Ajoutez une observation facultative concernant cette clôture..."
          value={observations}
          disabled={creating}
          onChange={(event) =>
            setObservations(
              event.target.value
            )
          }
          helperText={`${observations.length}/500 caractères`}
          slotProps={{
            htmlInput: {
              maxLength: 500,
            },
          }}
          sx={{
            mt: 3,
          }}
        />
      </Paper>

      {/* Prévisualisation */}

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
              <FactCheckRoundedIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Demandes disponibles
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                }}
              >
                Demandes validées au niveau du
                guichet pouvant être
                intégrées au journal.
              </Typography>
            </Box>
          </Box>

          {previewDone &&
            demandes.length > 0 && (
              <Chip
                icon={
                  <AssignmentRoundedIcon />
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

        {!previewDone ? (
          <Alert
            severity="info"
            variant="outlined"
          >
            Sélectionnez une date puis
            cliquez sur « Prévisualiser »
            pour afficher les demandes
            disponibles.
          </Alert>
        ) : demandes.length === 0 ? (
          <Alert
            severity="warning"
            variant="outlined"
          >
            <AlertTitle
              sx={{
                fontWeight: 700,
              }}
            >
              Aucune demande disponible
            </AlertTitle>

            Aucune demande validée au niveau du
            guichet n’est disponible pour
            cette journée.
          </Alert>
        ) : (
          <>
            <Alert
              severity="success"
              variant="outlined"
              sx={{
                mb: 3,
              }}
            >
              <strong>
                {demandes.length} demande
                {demandes.length > 1
                  ? "s"
                  : ""}
              </strong>{" "}
              seront rattachées au journal
              de la journée du{" "}
              <strong>
                {formatDate(dateJour)}
              </strong>
              .
            </Alert>

            {/* Tableau ordinateur */}

            <Paper
              variant="outlined"
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              <TableContainer>
                <Table
                  sx={{
                    minWidth: 850,
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
                                fontWeight:
                                  800,
                              }}
                            >
                              {
                                demande.numero
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  600,
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
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

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
              {demandes.map(
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
                          Demandeur
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight:
                              600,
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
                          CIN
                        </Typography>

                        <Typography variant="body2">
                          {demande.cin ||
                            "Non renseignée"}
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
                          {demande.referenceFonciere ||
                            "Non renseignée"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                )
              )}
            </Stack>
          </>
        )}
      </Paper>

      {/* Actions */}

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: {
            xs: 2,
            sm: 2.5,
          },
          borderColor: "divider",
        }}
      >
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
            variant="outlined"
            disabled={creating}
            onClick={() =>
              navigate(
                "/journaux-cloture"
              )
            }
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            startIcon={
              <LockRoundedIcon />
            }
            disabled={
              creating ||
              loadingPreview ||
              !previewDone ||
              demandes.length === 0
            }
            onClick={
              handleOpenConfirmation
            }
          >
            Clôturer la journée
          </Button>
        </Stack>
      </Paper>

      {/* Confirmation */}

      <Dialog
        open={confirmOpen}
        fullWidth
        maxWidth="sm"
        aria-labelledby="confirmation-cloture-title"
        onClose={
          creating
            ? undefined
            : () =>
                setConfirmOpen(false)
        }
      >
        <DialogTitle
          id="confirmation-cloture-title"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            fontWeight: 700,
          }}
        >
          <LockClockRoundedIcon
            color="primary"
          />

          Confirmer la clôture
        </DialogTitle>

        <DialogContent dividers>
          <Alert
            severity="warning"
            variant="outlined"
            sx={{
              mb: 3,
            }}
          >
            Vérifiez les informations avant
            de confirmer cette opération.
          </Alert>

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
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mb: 0.5,
                  fontWeight: 700,
                }}
              >
                Journée concernée
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {dateJour
                  ? formatDate(dateJour)
                  : "—"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mb: 0.5,
                  fontWeight: 700,
                }}
              >
                Demandes à clôturer
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {demandes.length} demande
                {demandes.length > 1
                  ? "s"
                  : ""}
              </Typography>
            </Box>
          </Box>

          {observations.trim() && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: "#F7FAF9",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mb: 0.75,
                  fontWeight: 700,
                }}
              >
                Observations
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.65,
                }}
              >
                {observations.trim()}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
          }}
        >
          <Button
            disabled={creating}
            onClick={() =>
              setConfirmOpen(false)
            }
          >
            Retour
          </Button>

          <Button
            variant="contained"
            startIcon={
              creating ? (
                <CircularProgress
                  size={19}
                  color="inherit"
                />
              ) : (
                <LockRoundedIcon />
              )
            }
            disabled={creating}
            onClick={handleCreate}
          >
            {creating
              ? "Clôture en cours..."
              : "Confirmer la clôture"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CreateJournalCloturePage;