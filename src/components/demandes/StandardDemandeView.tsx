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
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import axios from "axios";

import {
  useCallback,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import PageHeader from "../common/PageHeader";
import DemandeDetails from "./DemandeDetails";
import DemandeDocuments from "./DemandeDocuments";
import DemandeHistory from "./DemandeHistory";
import PaiementSection from "../paiements/PaiementSection";
import ResponsableControleSection from "./ResponsableControleSection";

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
  StatutVerificationCni,
} from "../../types/demande";

import type {
  StatutVerificationCni as StatutVerificationCniType,
} from "../../types/demande";

import {
  StatutPaiement,
} from "../../types/paiement";

import type {
  Paiement,
} from "../../types/paiement";

import {
  StatutDocument,
  TypeDocument,
} from "../../types/demande-document";

import {
  ROLES,
} from "../../utils/roles";

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
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

function getCniStatusLabel(
  statut: StatutVerificationCniType
): string {
  switch (statut) {
    case StatutVerificationCni.VERIFIEE:
      return "Identité vérifiée";

    case StatutVerificationCni.ECHEC:
      return "Échec de la vérification";

    case StatutVerificationCni.INDISPONIBLE:
      return "Service indisponible";

    case StatutVerificationCni.NON_VERIFIEE:
    default:
      return "Identité non vérifiée";
  }
}

function formatCniSource(
  source?: string | null
): string {
  if (!source) {
    return "Non renseignée";
  }

  if (
    source ===
    "SERVICE_CNI_SIMULE"
  ) {
    return "Service CNI simulé";
  }

  return source;
}

/*
 * Vue complète utilisée par :
 *
 * - l’Administrateur ;
 * - l’Agent ;
 * - le Responsable.
 */
function StandardDemandeView() {
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

  const {
    demande,
    loading,
    errorMessage,
    reload,
  } = useDemande(
    id ?? ""
  );

  const {
    historique,
    loadingHistory,
    historyError,
    reloadHistory,
  } = useDemandeHistory(
    id ?? ""
  );

  const {
    documents,
    loadingDocuments,
    documentsError,
    reloadDocuments,
    dossierDocumentaireComplet,
    missingRequiredDocuments,
  } = useDemandeDocuments(
    id ?? ""
  );

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
    nextStatus,
    setNextStatus,
  ] =
    useState<StatutDemande | null>(
      null
    );

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    verifyingStoredCni,
    setVerifyingStoredCni,
  ] = useState(false);

  const [
    paiementDetecte,
    setPaiementDetecte,
  ] = useState(false);

  const [
    motifRejet,
    setMotifRejet,
  ] = useState("");

  const handlePaiementChange =
    useCallback(
      (
        paiement:
          Paiement | null
      ) => {
        setPaiementDetecte(
          paiement?.statut ===
            StatutPaiement.PAYE
        );
      },
      []
    );

  const getErrorMessage = (
    error: unknown
  ): string => {
    if (
      axios.isAxiosError(
        error
      )
    ) {
      const responseData =
        error.response
          ?.data as
          | ApiErrorResponse
          | undefined;

      return (
        responseData
          ?.errors?.[0]
          ?.message ??
        responseData
          ?.message ??
        "Une erreur est survenue."
      );
    }

    return "Une erreur inattendue est survenue.";
  };

  const openStatusDialog = (
    statut: StatutDemande
  ) => {
    setNextStatus(
      statut
    );

    setMotifRejet("");

    setDialogOpen(
      true
    );
  };

  const closeStatusDialog =
    () => {
      if (updating) {
        return;
      }

      setDialogOpen(
        false
      );

      setNextStatus(
        null
      );

      setMotifRejet("");
    };

  const getConfirmationMessage =
    (): string => {
      switch (
        nextStatus
      ) {
        case StatutDemande.EN_COURS:
          return (
            "Voulez-vous transmettre cette demande au responsable ? " +
            "Après transmission, elle ne pourra plus être modifiée par l’agent."
          );

        case StatutDemande.VALIDEE:
          return (
            "Voulez-vous valider ce dossier au niveau du guichet ? " +
            "Toutes les pièces obligatoires doivent avoir été contrôlées et marquées conformes. " +
            "Un éventuel complément de paiement reste dû, mais ne bloque pas cette validation."
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
      switch (
        nextStatus
      ) {
        case StatutDemande.EN_COURS:
          return "Transmettre";

        case StatutDemande.VALIDEE:
          return "Valider le dossier";

        case StatutDemande.REJETEE:
          return "Rejeter";

        default:
          return "Confirmer";
      }
    };

  const handleConfirmStatus =
    async () => {
      if (
        !id ||
        !nextStatus
      ) {
        return;
      }

      if (
        nextStatus ===
          StatutDemande.REJETEE &&
        motifRejet
          .trim()
          .length < 5
      ) {
        toast.error(
          "Le motif de rejet doit contenir au moins 5 caractères."
        );

        return;
      }

      try {
        setUpdating(
          true
        );

        await demandeService
          .updateStatus(
            id,
            {
              statut:
                nextStatus,

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
            "Le dossier a été validé au niveau du guichet."
          );
        } else {
          toast.success(
            "La demande a été rejetée."
          );
        }

        setDialogOpen(
          false
        );

        setNextStatus(
          null
        );

        setMotifRejet("");
      } catch (error) {
        toast.error(
          getErrorMessage(
            error
          )
        );
      } finally {
        setUpdating(
          false
        );
      }
    };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "center",
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
    user?.role ===
    ROLES.ADMIN;

  const isAgent =
    user?.role ===
    ROLES.AGENT;

  const isResponsable =
    user?.role ===
    ROLES.RESPONSABLE;

  const isDemandeOwner =
    user?.id ===
    demande.utilisateur.id;

  const isCniVerified =
    demande
      .statutVerificationCni ===
    StatutVerificationCni.VERIFIEE;

  /**
   * Le paiement peut être connu directement
   * dans la demande ou être remonté par
   * PaiementSection après son chargement.
   */
  const paiementEffectue =
    demande.paiement?.statut ===
      StatutPaiement.PAYE ||
    paiementDetecte;

  const canManageTransmission =
    demande.statut ===
      StatutDemande.EN_ATTENTE &&
    (
      isAdmin ||
      (
        isAgent &&
        isDemandeOwner
      )
    );

  const canTransmit =
    canManageTransmission &&
    isCniVerified &&
    !loadingDocuments &&
    !documentsError &&
    dossierDocumentaireComplet &&
    paiementEffectue;

  const canVerifyStoredCni =
    canManageTransmission &&
    !isCniVerified;

  /*
   * Le Responsable Guichet doit avoir explicitement
   * contrôlé toutes les pièces obligatoires avant de
   * pouvoir valider le dossier.
   *
   * La simple présence des documents ne suffit pas :
   * CIN ou passeport, contrat et procuration doivent
   * tous être marqués CONFORME.
   */
  const identityDocumentConforme =
    documents.some(
      (documentItem) =>
        (
          documentItem.type ===
            TypeDocument.CIN ||
          documentItem.type ===
            TypeDocument.PASSEPORT
        ) &&
        documentItem.statut ===
          StatutDocument.CONFORME
    );

  const contratConforme =
    documents.some(
      (documentItem) =>
        documentItem.type ===
          TypeDocument.CONTRAT &&
        documentItem.statut ===
          StatutDocument.CONFORME
    );

  const procurationConforme =
    documents.some(
      (documentItem) =>
        documentItem.type ===
          TypeDocument.PROCURATION &&
        documentItem.statut ===
          StatutDocument.CONFORME
    );

  const allRequiredDocumentsConformes =
    identityDocumentConforme &&
    contratConforme &&
    procurationConforme;

  /*
   * Le Responsable valide le dossier au niveau du guichet.
   * Il ne dispose plus de l'action de rejet.
   *
   * L'Administrateur conserve provisoirement les actions
   * Valider / Rejeter pour les interventions exceptionnelles.
   */
  const canValidate =
    demande.statut ===
      StatutDemande.EN_COURS &&
    (
      isResponsable ||
      isAdmin
    );

  const canValidateNow =
    canValidate &&
    !loadingDocuments &&
    !documentsError &&
    allRequiredDocumentsConformes;

  const canReject =
    demande.statut ===
      StatutDemande.EN_COURS &&
    isAdmin;

  const handleVerifyStoredCni =
    async () => {
      try {
        setVerifyingStoredCni(
          true
        );

        await demandeService
          .verifierCni(
            demande.id
          );

        await reload();

        toast.success(
          "L’identité CNI de la demande a été vérifiée avec succès."
        );
      } catch (error) {
        await reload();

        toast.error(
          getErrorMessage(
            error
          )
        );
      } finally {
        setVerifyingStoredCni(
          false
        );
      }
    };

  const statusActions =
    canManageTransmission ||
    canValidate ||
    canReject ? (
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
      >
        {canManageTransmission && (
          <Button
            variant="contained"
            startIcon={
              <PlayArrowRoundedIcon />
            }
            disabled={
              updating ||
              verifyingStoredCni ||
              !canTransmit
            }
            onClick={() =>
              openStatusDialog(
                StatutDemande.EN_COURS
              )
            }
          >
            {!isCniVerified
              ? "Identité CNI non vérifiée"
              : loadingDocuments
                ? "Vérification des pièces..."
                : documentsError
                  ? "Pièces indisponibles"
                  : !dossierDocumentaireComplet
                    ? "Pièces justificatives incomplètes"
                    : !paiementEffectue
                      ? "Paiement non effectué"
                      : "Transmettre au responsable"}
          </Button>
        )}

        {canValidate && (
          <Button
            variant="contained"
            color="success"
            startIcon={
              <CheckCircleRoundedIcon />
            }
            disabled={
              updating ||
              !canValidateNow
            }
            onClick={() =>
              openStatusDialog(
                StatutDemande.VALIDEE
              )
            }
          >
            {loadingDocuments
              ? "Vérification des pièces..."
              : documentsError
                ? "Pièces indisponibles"
                : !allRequiredDocumentsConformes
                  ? "Pièces à contrôler"
                  : "Valider le dossier"}
          </Button>
        )}

        {canReject && (
          <Button
            variant="contained"
            color="error"
            startIcon={
              <CancelRoundedIcon />
            }
            disabled={
              updating
            }
            onClick={() =>
              openStatusDialog(
                StatutDemande.REJETEE
              )
            }
          >
            Rejeter
          </Button>
        )}
      </Stack>
    ) : undefined;

  return (
    <>
      <PageHeader
        title={`Demande ${demande.numero}`}
        subtitle="Consultez les pièces justificatives, les informations, le paiement et l’historique du traitement."
        icon={
          <AssignmentRoundedIcon />
        }
        actions={
          statusActions
        }
        breadcrumbs={[
          {
            label:
              "Demandes",

            onClick: () =>
              navigate(
                "/demandes"
              ),
          },

          {
            label:
              demande.numero,
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
            sx={{
              mb: 3,
            }}
          >
            Cette demande est encore en
            préparation. Ajoutez les pièces
            justificatives nécessaires puis
            assurez-vous que le paiement est
            effectué avant de transmettre la
            demande au responsable.
          </Alert>
        )}

      {demande.statut ===
        StatutDemande.EN_COURS &&
        isAgent && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
            }}
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
            sx={{
              mb: 3,
            }}
          >
            Contrôlez les informations du dossier et ouvrez chaque pièce
            justificative obligatoire avant de la marquer conforme. Si une
            donnée foncière doit être rectifiée, utilisez la section
            « Contrôle du Responsable Guichet ». La validation du dossier
            devient disponible uniquement lorsque toutes les pièces
            obligatoires sont conformes.
          </Alert>
        )}

      {demande.statut ===
        StatutDemande.EN_COURS &&
        canValidate &&
        !loadingDocuments &&
        !documentsError &&
        !allRequiredDocumentsConformes && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
            }}
          >
            La validation au niveau du guichet est bloquée tant que la pièce
            d’identité, le contrat et la procuration n’ont pas tous été
            contrôlés et marqués conformes.
          </Alert>
        )}

      {demande.statut ===
        StatutDemande.VALIDEE && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
            }}
          >
            Cette demande a été validée au niveau du guichet. Elle doit
            ensuite être prise en compte dans la clôture journalière avant
            sa transmission au service étude.
          </Alert>
        )}

      {demande.statut ===
        StatutDemande.REJETEE && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
          >
            Cette demande a été rejetée dans le cadre d’une intervention
            administrative. Ses données sont verrouillées.
          </Alert>
        )}

      {canManageTransmission &&
        !isCniVerified && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
            }}
          >
            Cette demande ne peut pas être
            transmise au responsable, car
            l’identité du demandeur n’a pas
            été vérifiée par le service CNI.
          </Alert>
        )}

      {canManageTransmission &&
        isCniVerified &&
        !loadingDocuments &&
        !documentsError &&
        !dossierDocumentaireComplet && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
            }}
          >
            Le dossier documentaire est incomplet.
            Pièce(s) manquante(s) :{" "}
            {missingRequiredDocuments.join(", ")}.
            Ajoutez toutes les pièces obligatoires
            avant le paiement et la transmission
            au responsable.
          </Alert>
        )}

      {canManageTransmission &&
        isCniVerified &&
        !loadingDocuments &&
        !documentsError &&
        dossierDocumentaireComplet &&
        !paiementEffectue && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
            }}
          >
            Cette demande ne peut pas être
            transmise au responsable tant que
            son paiement n’a pas été enregistré
            par la caisse.
          </Alert>
        )}

      {/*
       * Pièces justificatives placées en haut.
       *
       * L’Agent peut ainsi téléverser les
       * documents immédiatement après la
       * création de la demande.
       */}

      <Box
        sx={{
          mb: 4,
        }}
      >
        <DemandeDocuments
          demandeId={
            demande.id
          }
          demandeStatut={
            demande.statut
          }
          documentsLocked={
            paiementEffectue
          }
          documents={
            documents
          }
          loading={
            loadingDocuments
          }
          error={
            documentsError
          }
          onReload={
            reloadDocuments
          }
        />
      </Box>

      {/* Informations de la demande */}

      <DemandeDetails
        demande={
          demande
        }
      />

      {/* Contrôle métier du Responsable Guichet */}

      {demande.statut ===
        StatutDemande.EN_COURS &&
        (
          isResponsable ||
          isAdmin
        ) && (
          <Box
            sx={{
              mt: 4,
            }}
          >
            <ResponsableControleSection
              demande={demande}
              onCorrectionApplied={async () => {
                await Promise.all([
                  reload(),
                  reloadHistory(),
                ]);
              }}
            />
          </Box>
        )}

      {/* Vérification de l’identité CNI */}

      <Paper
        variant="outlined"
        sx={{
          mt: 4,

          p: {
            xs: 2.5,
            sm: 3,
          },

          borderColor:
            isCniVerified
              ? "success.light"
              : "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems:
              "flex-start",
            justifyContent:
              "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems:
                "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                flexShrink: 0,
                borderRadius: 2.5,

                color:
                  isCniVerified
                    ? "success.main"
                    : "text.secondary",

                bgcolor:
                  isCniVerified
                    ? "rgba(46, 125, 50, 0.10)"
                    : "action.hover",
              }}
            >
              <VerifiedUserRoundedIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Vérification de l’identité CNI
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Informations officielles
                récupérées lors de la
                vérification du numéro CIN.
              </Typography>
            </Box>
          </Box>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            sx={{
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
            }}
          >
            {canVerifyStoredCni && (
              <Button
                type="button"
                variant="outlined"
                startIcon={
                  verifyingStoredCni ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <RefreshRoundedIcon />
                  )
                }
                disabled={
                  verifyingStoredCni ||
                  updating
                }
                onClick={() => {
                  void handleVerifyStoredCni();
                }}
              >
                {verifyingStoredCni
                  ? "Vérification..."
                  : demande
                        .statutVerificationCni ===
                      StatutVerificationCni.ECHEC
                    ? "Réessayer la vérification"
                    : demande
                          .statutVerificationCni ===
                        StatutVerificationCni.INDISPONIBLE
                      ? "Relancer la vérification"
                      : "Vérifier l’identité CNI"}
              </Button>
            )}

            <Chip
              icon={
                isCniVerified ? (
                  <CheckCircleRoundedIcon />
                ) : undefined
              }
              label={getCniStatusLabel(
                demande
                  .statutVerificationCni
              )}
              color={
                demande
                  .statutVerificationCni ===
                StatutVerificationCni.VERIFIEE
                  ? "success"
                  : demande
                        .statutVerificationCni ===
                      StatutVerificationCni.ECHEC
                    ? "error"
                    : demande
                          .statutVerificationCni ===
                        StatutVerificationCni.INDISPONIBLE
                      ? "warning"
                      : "default"
              }
              variant={
                isCniVerified
                  ? "filled"
                  : "outlined"
              }
            />
          </Stack>
        </Box>

        {demande
          .sourceVerificationCni ===
          "SERVICE_CNI_SIMULE" && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
            }}
          >
            Cette identité a été vérifiée
            avec le service CNI simulé
            utilisé pendant le développement
            du projet.
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              sm: "repeat(2, minmax(0, 1fr))",

              lg: "repeat(3, minmax(0, 1fr))",
            },

            gap: 2.5,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Numéro CIN
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {demande.cin}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Nom officiel
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {demande.nomDemandeur}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Prénom officiel
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {demande.prenomDemandeur}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Date de naissance
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {formatDate(
                demande
                  .dateNaissanceDemandeur
              )}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Adresse officielle
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {demande
                .adresseDemandeur ??
                "Non renseignée"}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Date de vérification
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {formatDateTime(
                demande
                  .dateVerificationCni
              )}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Source
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {formatCniSource(
                demande
                  .sourceVerificationCni
              )}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Référence de vérification
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                overflowWrap:
                  "anywhere",
              }}
            >
              {demande
                .referenceVerificationCni ??
                "Non renseignée"}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Message de vérification
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {demande
                .messageVerificationCni ??
                "Non renseigné"}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Paiement */}

      <Box
        sx={{
          mt: 4,
        }}
      >
        <PaiementSection
          demande={
            demande
          }
          onPaiementChange={
            handlePaiementChange
          }
          onPaiementCreated={
            reload
          }
        />
      </Box>

      {/* Historique */}

      <Box
        sx={{
          mt: 4,
        }}
      >
        <DemandeHistory
          historique={
            historique
          }
          loading={
            loadingHistory
          }
          error={
            historyError
          }
        />
      </Box>

      {/* Confirmation du changement de statut */}

      <Dialog
        open={
          dialogOpen
        }
        onClose={
          closeStatusDialog
        }
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
            sx={{
              mb: 2,
            }}
          >
            {
              getConfirmationMessage()
            }
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
              value={
                motifRejet
              }
              disabled={
                updating
              }
              onChange={(
                event
              ) =>
                setMotifRejet(
                  event
                    .target
                    .value
                )
              }
              error={
                motifRejet.length >
                  0 &&
                motifRejet
                  .trim()
                  .length <
                  5
              }
              helperText={
                motifRejet.length >
                  0 &&
                motifRejet
                  .trim()
                  .length <
                  5
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
            disabled={
              updating
            }
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
                motifRejet
                  .trim()
                  .length <
                  5
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

export default StandardDemandeView;