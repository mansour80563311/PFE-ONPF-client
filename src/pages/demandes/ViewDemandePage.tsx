import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import PageHeader from "../../components/common/PageHeader";

import { useDemande } from "../../hooks/useDemande";
import demandeService from "../../services/demande.service";

import DemandeDetails from "../../components/demandes/DemandeDetails";
import DemandeHistory from "../../components/demandes/DemandeHistory";
import { useDemandeHistory } from "../../hooks/useDemandeHistory";


import {
  StatutDemande,
} from "../../types/demande";

function ViewDemandePage() {
  const { id } = useParams<{
    id: string;
  }>();

  const {
    demande,
    loading,
    reload,
  } = useDemande(id!);

 const {
    historique,
    loadingHistory,
    historyError,
    reloadHistory,
    } = useDemandeHistory(id!);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [nextStatus, setNextStatus] =
    useState<StatutDemande | null>(null);

  const [updating, setUpdating] =
    useState(false);

const [motifRejet, setMotifRejet] =
  useState("");

  const openStatusDialog = (
    statut: StatutDemande
  ) => {
    setNextStatus(statut);
    setMotifRejet("");
    setDialogOpen(true);
  };

  const closeStatusDialog = () => {
    if (updating) return;

    setDialogOpen(false);
    setNextStatus(null);
    setMotifRejet("");
  };

  const getConfirmationMessage = () => {
    switch (nextStatus) {
      case StatutDemande.EN_COURS:
        return "Voulez-vous commencer le traitement de cette demande ?";

      case StatutDemande.VALIDEE:
        return "Voulez-vous valider définitivement cette demande ? Elle ne pourra plus être modifiée ni supprimée.";

      case StatutDemande.REJETEE:
        return "Voulez-vous rejeter définitivement cette demande ?";

      default:
        return "";
    }
  };

  const getConfirmationButtonLabel = () => {
    switch (nextStatus) {
      case StatutDemande.EN_COURS:
        return "Mettre en cours";

      case StatutDemande.VALIDEE:
        return "Valider";

      case StatutDemande.REJETEE:
        return "Rejeter";

      default:
        return "Confirmer";
    }
  };

    const handleConfirmStatus = async () => {
    if (!id || !nextStatus) return;

    if (
        nextStatus === StatutDemande.REJETEE &&
        motifRejet.trim().length < 5
    ) {
        toast.error(
        "Le motif de rejet doit contenir au moins 5 caractères."
        );

        return;
    }

    try {
        setUpdating(true);

        await demandeService.updateStatus(id, {
        statut: nextStatus,

        ...(nextStatus ===
            StatutDemande.REJETEE && {
            motifRejet: motifRejet.trim(),
        }),
        });

        await reload();
        await reloadHistory();

        toast.success(
        nextStatus === StatutDemande.REJETEE
            ? "La demande a été rejetée."
            : "Statut de la demande mis à jour."
        );

        setDialogOpen(false);
        setNextStatus(null);
        setMotifRejet("");
    } catch {
        toast.error(
        "Erreur lors de la mise à jour du statut."
        );
    } finally {
        setUpdating(false);
    }
    };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 5,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!demande) {
    return (
      <Alert severity="error">
        Demande introuvable.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title={`Demande ${demande.numero}`}
      />

      {/* Actions selon le statut */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        {demande.statut ===
          StatutDemande.EN_ATTENTE && (
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() =>
              openStatusDialog(
                StatutDemande.EN_COURS
              )
            }
          >
            Mettre en cours
          </Button>
        )}

        {demande.statut ===
          StatutDemande.EN_COURS && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() =>
                openStatusDialog(
                  StatutDemande.VALIDEE
                )
              }
            >
              Valider
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() =>
                openStatusDialog(
                  StatutDemande.REJETEE
                )
              }
            >
              Rejeter
            </Button>
          </>
        )}
      </Stack>

      {demande.statut ===
        StatutDemande.VALIDEE && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
        >
          Cette demande est validée et son
          traitement est terminé.
        </Alert>
      )}

      {demande.statut ===
        StatutDemande.REJETEE && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          Cette demande a été rejetée et son
          traitement est terminé.
        </Alert>
      )}
      // details demande
      <DemandeDetails demande={demande} />

        <Box sx={{ mt: 4 }}>
        <DemandeHistory
            historique={historique}
            loading={loadingHistory}
            error={historyError}
        />
        </Box>

      {/* Boîte de confirmation */}

      <Dialog
        open={dialogOpen}
        onClose={closeStatusDialog}
      >
        <DialogTitle>
          Confirmation
        </DialogTitle>

        <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
            {getConfirmationMessage()}
        </DialogContentText>

        {nextStatus === StatutDemande.REJETEE && (
            <TextField
            autoFocus
            fullWidth
            required
            multiline
            minRows={4}
            label="Motif du rejet"
            placeholder="Indiquez clairement pourquoi cette demande est rejetée..."
            value={motifRejet}
            onChange={(event) =>
                setMotifRejet(event.target.value)
            }
            error={
                motifRejet.length > 0 &&
                motifRejet.trim().length < 5
            }
            helperText={
                motifRejet.length > 0 &&
                motifRejet.trim().length < 5
                ? "Le motif doit contenir au moins 5 caractères."
                : `${motifRejet.length}/500 caractères`
            }
            slotProps={{
                htmlInput: {
                maxLength: 500,
                },
            }}
            />
        )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeStatusDialog}
            disabled={updating}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            color={
              nextStatus ===
              StatutDemande.VALIDEE
                ? "success"
                : nextStatus ===
                    StatutDemande.REJETEE
                  ? "error"
                  : "primary"
            }
            onClick={handleConfirmStatus}
            disabled={
                updating ||
                (
                    nextStatus === StatutDemande.REJETEE &&
                    motifRejet.trim().length < 5
                )
                }
          >
            {updating
              ? "Traitement..."
              : getConfirmationButtonLabel()}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ViewDemandePage;