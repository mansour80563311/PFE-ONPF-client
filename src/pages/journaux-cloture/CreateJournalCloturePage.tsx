import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import LockIcon from "@mui/icons-material/Lock";

import axios from "axios";
import { useState } from "react";
import {
  useNavigate,
} from "react-router-dom";
import { toast } from "react-toastify";

import PageHeader from "../../components/common/PageHeader";

import journalClotureService from "../../services/journal-cloture.service";

import type {
  DemandeCloture,
} from "../../types/journal-cloture";

import {
  getStatusColor,
  getStatusLabel,
} from "../../utils/demande";

function CreateJournalCloturePage() {
  const navigate = useNavigate();

  const [dateJour, setDateJour] =
    useState("");

  const [observations, setObservations] =
    useState("");

  const [demandes, setDemandes] =
    useState<DemandeCloture[]>([]);

  const [previewDone, setPreviewDone] =
    useState(false);

  const [loadingPreview, setLoadingPreview] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const getErrorMessage = (
    error: unknown,
    defaultMessage: string
  ): string => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response
        ?.data as
        | {
            message?: string;
            errors?: Array<{
              message?: string;
            }>;
          }
        | undefined;

      return (
        responseData?.errors?.[0]?.message ??
        responseData?.message ??
        defaultMessage
      );
    }

    return defaultMessage;
  };

  const handleDateChange = (
    value: string
  ) => {
    setDateJour(value);

    // La précédente prévisualisation
    // n’est plus valable après un changement de date.
    setDemandes([]);
    setPreviewDone(false);
  };

  const handlePreview = async () => {
    if (!dateJour) {
      toast.error(
        "Sélectionnez la journée à clôturer."
      );

      return;
    }

    try {
      setLoadingPreview(true);

      const result =
        await journalClotureService.preview(
          dateJour
        );

      setDemandes(result);
      setPreviewDone(true);

      if (result.length === 0) {
        toast.info(
          "Aucune demande finalisée pour cette journée."
        );
      } else {
        toast.success(
          `${result.length} demande(s) disponible(s) pour la clôture.`
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

  const handleCreate = async () => {
    if (!dateJour) {
      toast.error(
        "Sélectionnez la journée à clôturer."
      );

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

    try {
      setCreating(true);

      const journal =
        await journalClotureService.create({
          dateJour,
          observations:
            observations.trim() || undefined,
        });

      toast.success(
        "Journée clôturée avec succès."
      );

      navigate(
        `/journaux-cloture/${journal.id}`
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
    <>
      <PageHeader
        title="Nouvelle clôture journalière"
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate("/journaux-cloture")
          }
        >
          Retour à la liste
        </Button>
      </Box>

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
          Informations de la clôture
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr auto",
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
            onChange={(event) =>
              handleDateChange(
                event.target.value
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <Button
            variant="outlined"
            startIcon={
              loadingPreview ? (
                <CircularProgress
                  size={20}
                />
              ) : (
                <SearchIcon />
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
              whiteSpace: "nowrap",
            }}
          >
            {loadingPreview
              ? "Chargement..."
              : "Prévisualiser"}
          </Button>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Observations"
          placeholder="Ajoutez une observation facultative sur la clôture..."
          value={observations}
          onChange={(event) =>
            setObservations(
              event.target.value
            )
          }
          slotProps={{
            htmlInput: {
              maxLength: 500,
            },
          }}
          helperText={`${observations.length}/500 caractères`}
          sx={{
            mt: 3,
          }}
        />
      </Paper>

      <Paper
        sx={{
          p: 4,
          mt: 4,
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
          Demandes disponibles
        </Typography>

        {!previewDone ? (
          <Alert severity="info">
            Sélectionnez une date et cliquez
            sur « Prévisualiser ».
          </Alert>
        ) : demandes.length === 0 ? (
          <Alert severity="warning">
            Aucune demande validée ou rejetée
            n’est disponible pour cette
            journée.
          </Alert>
        ) : (
          <>
            <Alert
              severity="success"
              sx={{ mb: 3 }}
            >
              {demandes.length} demande(s)
              seront intégrée(s) dans le
              journal de clôture.
            </Alert>

            <TableContainer>
              <Table>
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
                      >
                        <TableCell>
                          {demande.numero}
                        </TableCell>

                        <TableCell>
                          {
                            demande.prenomDemandeur
                          }{" "}
                          {
                            demande.nomDemandeur
                          }
                        </TableCell>

                        <TableCell>
                          {demande.cin || "-"}
                        </TableCell>

                        <TableCell>
                          {demande.referenceFonciere ||
                            "-"}
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
          </>
        )}
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="outlined"
          disabled={creating}
          onClick={() =>
            navigate("/journaux-cloture")
          }
        >
          Annuler
        </Button>

        <Button
          variant="contained"
          startIcon={
            creating ? (
              <CircularProgress
                size={20}
              />
            ) : (
              <LockIcon />
            )
          }
          disabled={
            creating ||
            !previewDone ||
            demandes.length === 0
          }
          onClick={handleCreate}
        >
          {creating
            ? "Clôture en cours..."
            : "Clôturer la journée"}
        </Button>
      </Box>
    </>
  );
}

export default CreateJournalCloturePage;