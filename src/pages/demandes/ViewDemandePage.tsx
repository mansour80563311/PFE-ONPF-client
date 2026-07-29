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

import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

import axios from "axios";

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
import DemandeDetails from "../../components/demandes/DemandeDetails";
import DemandeDocuments from "../../components/demandes/DemandeDocuments";
import DemandeHistory from "../../components/demandes/DemandeHistory";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  useDemande,
} from "../../hooks/useDemande";

import {
  useDemandeHistory,
} from "../../hooks/useDemandeHistory";

import {
  useDemandeDocuments,
} from "../../hooks/useDemandeDocuments";

import demandeService from "../../services/demande.service";

import {
  StatutDemande,
} from "../../types/demande";

import {
  ROLES,
} from "../../utils/roles";

interface ApiErrorResponse {
  message?: string;
  errors?: Array<{
    message?: string;
  }>;
}

function ViewDemandePage() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const {
    user,
  } = useAuth();

  const {
    demande,
    loading,
    errorMessage,
    reload,
  } = useDemande(id ?? "");

  const {
    historique,
    loadingHistory,
    historyError,
    reloadHistory,
  } = useDemandeHistory(id!);

  const {
    documents,
    loadingDocuments,
    documentsError,
    reloadDocuments,
  } = useDemandeDocuments(id!);

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
    nextStatus,
    setNextStatus,
  ] = useState<StatutDemande | null>(
    null
  );

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    motifRejet,
    setMotifRejet,
  ] = useState("");

  const getErrorMessage = (
    error: unknown
  ): string => {
    if (axios.isAxiosError(error)) {
      const responseData =
        error.response?.data as
          | ApiErrorResponse
          | undefined;

      return (
        responseData?.errors?.[0]
          ?.message ??
        responseData?.message ??
        "Erreur lors de la mise à jour du statut."
      );
    }

    return (
      "Une erreur inattendue est survenue."
    );
  };

  const openStatusDialog = (
    statut: StatutDemande
  ) => {
    setNextStatus(statut);
    setMotifRejet("");
    setDialogOpen(true);
  };

  const closeStatusDialog = () => {
    if (updating) {
      return;
    }

    setDialogOpen(false);
    setNextStatus(null);
    setMotifRejet("");
  };

  const getConfirmationMessage =
    (): string => {
      switch (nextStatus) {
        case StatutDemande.EN_COURS:
          return (
            "Voulez-vous transmettre cette demande au responsable ? " +
            "Après transmission, elle ne pourra plus être modifiée par l’agent."
          );

        case StatutDemande.VALIDEE:
          return (
            "Voulez-vous valider définitivement cette demande ? " +
            "Tous les documents obligatoires doivent être conformes."
          );

        case StatutDemande.REJETEE:
          return (
            "Voulez-vous rejeter définitivement cette demande ? " +
            "Le motif du rejet sera conservé dans l’historique."
          );

        default:
          return "";
      }
    };

  const getConfirmationButtonLabel =
    (): string => {
      switch (nextStatus) {
        case StatutDemande.EN_COURS:
          return "Transmettre";

        case StatutDemande.VALIDEE:
          return "Valider";

        case StatutDemande.REJETEE:
          return "Rejeter";

        default:
          return "Confirmer";
      }
    };

  const handleConfirmStatus =
    async () => {
      if (!id || !nextStatus) {
        return;
      }

      if (
        nextStatus ===
          StatutDemande.REJETEE &&
        motifRejet.trim().length < 5
      ) {
        toast.error(
          "Le motif de rejet doit contenir au moins 5 caractères."
        );

        return;
      }

      try {
        setUpdating(true);

        await demandeService.updateStatus(
          id,
          {
            statut: nextStatus,

            ...(nextStatus ===
              StatutDemande.REJETEE && {
              motifRejet:
                motifRejet.trim(),
            }),
          }
        );

        await Promise.all([
          reload(),
          reloadHistory(),
          reloadDocuments(),
        ]);

        if (
          nextStatus ===
          StatutDemande.EN_COURS
        ) {
          toast.success(
            "La demande a été transmise au responsable."
          );
        } else if (
          nextStatus ===
          StatutDemande.VALIDEE
        ) {
          toast.success(
            "La demande a été validée."
          );
        } else {
          toast.success(
            "La demande a été rejetée."
          );
        }

        setDialogOpen(false);
        setNextStatus(null);
        setMotifRejet("");
      } catch (error) {
        toast.error(
          getErrorMessage(error)
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
          py: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (
    errorMessage ||
    !demande
  ) {
    return (
      <Alert severity="error">
        {errorMessage ??
          "Demande introuvable."}
      </Alert>
    );
  }
  const isAdmin =
    user?.role === ROLES.ADMIN;

  const isAgent =
    user?.role === ROLES.AGENT;

  const isResponsable =
    user?.role === ROLES.RESPONSABLE;

  const isDemandeOwner =
    user?.id === demande.utilisateur.id;

  const canTransmit =
    demande.statut ===
      StatutDemande.EN_ATTENTE &&
    (
      isAdmin ||
      (
        isAgent &&
        isDemandeOwner
      )
    );

  const canDecide =
    demande.statut ===
      StatutDemande.EN_COURS &&
    (
      isAdmin ||
      isResponsable
    );

  const statusActions =
    canTransmit || canDecide ? (
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
      >
        {canTransmit && (
          <Button
            variant="contained"
            startIcon={
              <PlayArrowRoundedIcon />
            }
            disabled={updating}
            onClick={() =>
              openStatusDialog(
                StatutDemande.EN_COURS
              )
            }
          >
            Transmettre au responsable
          </Button>
        )}

        {canDecide && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={
                <CheckCircleRoundedIcon />
              }
              disabled={updating}
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
              startIcon={
                <CancelRoundedIcon />
              }
              disabled={updating}
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
    ) : undefined;

  return (
    <>
      <PageHeader
        title={`Demande ${demande.numero}`}
        subtitle="Consultez les informations, les pièces justificatives et l’historique du traitement."
        icon={<AssignmentRoundedIcon />}
        actions={statusActions}
        breadcrumbs={[
          {
            label: "Demandes",
            onClick: () =>
              navigate("/demandes"),
          },
          {
            label: demande.numero,
          },
        ]}
      />

      {/* Messages selon le statut et le rôle */}

      {demande.statut ===
        StatutDemande.EN_ATTENTE &&
        isAgent &&
        isDemandeOwner && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
          >
            Cette demande est encore en
            préparation. Vérifiez les
            informations et ajoutez les
            pièces justificatives avant de
            la transmettre au responsable.
          </Alert>
        )}

      {demande.statut ===
        StatutDemande.EN_COURS &&
        isAgent && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
          >
            Cette demande a été transmise.
            Elle est maintenant en cours de
            vérification par le responsable.
          </Alert>
        )}

      {demande.statut ===
        StatutDemande.EN_COURS &&
        isResponsable && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
          >
            Vérifiez les informations et la
            conformité de toutes les pièces
            avant de valider ou de rejeter
            cette demande.
          </Alert>
        )}

      {demande.statut ===
        StatutDemande.VALIDEE && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
          >
            Cette demande est validée. Son
            traitement est terminé et ses
            données sont verrouillées.
          </Alert>
        )}

      {demande.statut ===
        StatutDemande.REJETEE && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            Cette demande a été rejetée. Son
            traitement est terminé et ses
            données sont verrouillées.
          </Alert>
        )}

      {/* Informations de la demande */}

      <DemandeDetails
        demande={demande}
      />

      {/* Pièces justificatives */}

      <Box sx={{ mt: 4 }}>
        <DemandeDocuments
          demandeId={demande.id}
          demandeStatut={
            demande.statut
          }
          documents={documents}
          loading={loadingDocuments}
          error={documentsError}
          onReload={reloadDocuments}
        />
      </Box>

      {/* Historique */}

      <Box sx={{ mt: 4 }}>
        <DemandeHistory
          historique={historique}
          loading={loadingHistory}
          error={historyError}
        />
      </Box>

      {/* Confirmation du changement de statut */}

      <Dialog
        open={dialogOpen}
        onClose={closeStatusDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {nextStatus ===
          StatutDemande.EN_COURS
            ? "Transmettre la demande"
            : nextStatus ===
                StatutDemande.VALIDEE
              ? "Valider la demande"
              : nextStatus ===
                  StatutDemande.REJETEE
                ? "Rejeter la demande"
                : "Confirmation"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{ mb: 2 }}
          >
            {getConfirmationMessage()}
          </DialogContentText>

          {nextStatus ===
            StatutDemande.REJETEE && (
            <TextField
              autoFocus
              fullWidth
              required
              multiline
              minRows={4}
              label="Motif du rejet"
              placeholder="Indiquez clairement pourquoi cette demande est rejetée..."
              value={motifRejet}
              disabled={updating}
              onChange={(event) =>
                setMotifRejet(
                  event.target.value
                )
              }
              error={
                motifRejet.length > 0 &&
                motifRejet.trim()
                  .length < 5
              }
              helperText={
                motifRejet.length > 0 &&
                motifRejet.trim()
                  .length < 5
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
            onClick={
              closeStatusDialog
            }
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
            disabled={
              updating ||
              (
                nextStatus ===
                  StatutDemande.REJETEE &&
                motifRejet.trim()
                  .length < 5
              )
            }
            onClick={
              handleConfirmStatus
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