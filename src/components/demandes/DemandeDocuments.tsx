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
  IconButton,
  MenuItem,
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

import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import axios from "axios";

import {
  useState,
} from "react";

import {
  toast,
} from "react-toastify";

import demandeDocumentService from "../../services/demande-document.service";

import {
  StatutDocument,
  TypeDocument,
} from "../../types/demande-document";

import {
  StatutDemande,
} from "../../types/demande";

import type {
  DemandeDocument,
} from "../../types/demande-document";

import {
  formatFileSize,
  getDocumentStatusColor,
  getDocumentStatusLabel,
  getDocumentTypeLabel,
} from "../../utils/document";

import {
  formatDateTime,
} from "../../utils/date";

import {
  isDemandeTerminee,
} from "../../utils/demande";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  ROLES,
} from "../../utils/roles";

interface Props {
  demandeId: string;
  demandeStatut: StatutDemande;
  documents: DemandeDocument[];
  loading: boolean;
  error: boolean;
  onReload: () => Promise<void>;
}

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}

const DOCUMENT_TYPES: TypeDocument[] = [
  TypeDocument.CIN,
  TypeDocument.PASSEPORT,
  TypeDocument.CONTRAT,
  TypeDocument.PROCURATION,
];

function getErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (axios.isAxiosError(error)) {
    const responseData =
      error.response?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData?.errors?.[0]?.message ??
      responseData?.message ??
      fallbackMessage
    );
  }

  return fallbackMessage;
}

function DemandeDocuments({
  demandeId,
  demandeStatut,
  documents,
  loading,
  error,
  onReload,
}: Props) {
  const {
    user,
  } = useAuth();

  const isAdmin =
    user?.role === ROLES.ADMIN;

  const isAgent =
    user?.role === ROLES.AGENT;

  const isResponsable =
    user?.role === ROLES.RESPONSABLE;

  const demandeTerminee =
    isDemandeTerminee(demandeStatut);

  /*
   * L’Agent ou l’Administrateur peut
   * ajouter des pièces uniquement tant
   * que la demande est EN_ATTENTE.
   */
  const canUploadDocuments =
    demandeStatut ===
      StatutDemande.EN_ATTENTE &&
    (
      isAdmin ||
      isAgent
    );

  /*
   * Le Responsable ou l’Administrateur
   * peut vérifier les pièces uniquement
   * lorsque la demande est EN_COURS.
   */
  const canVerifyDocuments =
    demandeStatut ===
      StatutDemande.EN_COURS &&
    (
      isAdmin ||
      isResponsable
    );

  /*
   * L’Agent ou l’Administrateur peut
   * supprimer une pièce uniquement avant
   * la transmission de la demande.
   */
  const canDeleteDocuments =
    demandeStatut ===
      StatutDemande.EN_ATTENTE &&
    (
      isAdmin ||
      isAgent
    );

  const [
    uploadDialogOpen,
    setUploadDialogOpen,
  ] = useState(false);

  const [
    selectedType,
    setSelectedType,
  ] = useState<TypeDocument | "">("");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    statusDialogOpen,
    setStatusDialogOpen,
  ] = useState(false);

  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState<DemandeDocument | null>(
    null
  );

  const [
    nextDocumentStatus,
    setNextDocumentStatus,
  ] = useState<StatutDocument | null>(
    null
  );

  const [
    motifNonConformite,
    setMotifNonConformite,
  ] = useState("");

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const identityDocumentExists =
    documents.some(
      (documentItem) =>
        documentItem.type ===
          TypeDocument.CIN ||
        documentItem.type ===
          TypeDocument.PASSEPORT
    );

  const availableTypes =
    DOCUMENT_TYPES.filter((type) => {
      const sameTypeExists =
        documents.some(
          (documentItem) =>
            documentItem.type === type
        );

      if (sameTypeExists) {
        return false;
      }

      const isIdentityType =
        type === TypeDocument.CIN ||
        type === TypeDocument.PASSEPORT;

      if (
        isIdentityType &&
        identityDocumentExists
      ) {
        return false;
      }

      return true;
    });

  const closeUploadDialog = () => {
    if (uploading) {
      return;
    }

    setUploadDialogOpen(false);
    setSelectedType("");
    setSelectedFile(null);
  };

  const handleOpenUploadDialog = () => {
    if (!canUploadDocuments) {
      toast.error(
        "Les documents peuvent uniquement être ajoutés par l’agent avant la transmission de la demande."
      );

      return;
    }

    setUploadDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!canUploadDocuments) {
      toast.error(
        "Vous n’êtes pas autorisé à ajouter un document à cette demande."
      );

      return;
    }

    if (
      !selectedType ||
      !selectedFile
    ) {
      toast.error(
        "Sélectionnez un type et un fichier."
      );

      return;
    }

    try {
      setUploading(true);

      await demandeDocumentService
        .uploadDocument(
          demandeId,
          selectedType,
          selectedFile
        );

      await onReload();

      toast.success(
        "Document ajouté avec succès."
      );

      setUploadDialogOpen(false);
      setSelectedType("");
      setSelectedFile(null);
    } catch (uploadError) {
      console.error(
        "Erreur upload document :",
        uploadError
      );

      toast.error(
        getErrorMessage(
          uploadError,
          "Erreur lors de l’ajout du document."
        )
      );
    } finally {
      setUploading(false);
    }
  };

  /*
   * Visualiser un document dans un nouvel
   * onglet sans contourner l’authentification.
   *
   * Une fenêtre vide est ouverte immédiatement
   * pour éviter le blocage des pop-up pendant
   * l’attente de la réponse de l’API.
   */
  const handleView = async (
    documentItem: DemandeDocument
  ) => {
    const previewWindow =
      window.open(
        "",
        "_blank"
      );

    if (!previewWindow) {
      toast.error(
        "Le navigateur a bloqué l’ouverture du document. Autorisez les fenêtres pop-up."
      );

      return;
    }

    previewWindow.opener = null;

    previewWindow.document.title =
      "Chargement du document";

    previewWindow.document.body.innerHTML = `
      <div
        style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
          color: #555;
        "
      >
        Chargement du document...
      </div>
    `;

    try {
      const blob =
        await demandeDocumentService
          .downloadDocument(
            demandeId,
            documentItem.id
          );

      const url =
        window.URL.createObjectURL(
          blob
        );

      previewWindow.location.href =
        url;

      /*
       * Le navigateur dispose d’un délai
       * suffisant pour charger le Blob avant
       * que l’URL temporaire soit libérée.
       */
      window.setTimeout(() => {
        window.URL.revokeObjectURL(
          url
        );
      }, 60000);
    } catch (viewError) {
      previewWindow.close();

      console.error(
        "Erreur visualisation document :",
        viewError
      );

      toast.error(
        getErrorMessage(
          viewError,
          "Impossible d’ouvrir le document."
        )
      );
    }
  };

  const handleDownload = async (
    documentItem: DemandeDocument
  ) => {
    try {
      const blob =
        await demandeDocumentService
          .downloadDocument(
            demandeId,
            documentItem.id
          );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        window.document.createElement(
          "a"
        );

      link.href = url;
      link.download =
        documentItem.nomOriginal;

      window.document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error(
        "Erreur téléchargement document :",
        downloadError
      );

      toast.error(
        getErrorMessage(
          downloadError,
          "Impossible de télécharger le document."
        )
      );
    }
  };

  const openStatusDialog = (
    documentItem: DemandeDocument,
    statut: StatutDocument
  ) => {
    if (!canVerifyDocuments) {
      toast.error(
        "Seul le responsable peut vérifier la conformité des documents lorsque la demande est en cours."
      );

      return;
    }

    setSelectedDocument(documentItem);
    setNextDocumentStatus(statut);
    setMotifNonConformite("");
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    if (updatingStatus) {
      return;
    }

    setStatusDialogOpen(false);
    setSelectedDocument(null);
    setNextDocumentStatus(null);
    setMotifNonConformite("");
  };

  const handleConfirmStatus =
    async () => {
      if (!canVerifyDocuments) {
        toast.error(
          "Vous n’êtes pas autorisé à vérifier ce document."
        );

        return;
      }

      if (
        !selectedDocument ||
        !nextDocumentStatus
      ) {
        return;
      }

      if (
        nextDocumentStatus ===
          StatutDocument.NON_CONFORME &&
        motifNonConformite.trim()
          .length < 5
      ) {
        toast.error(
          "Le motif doit contenir au moins 5 caractères."
        );

        return;
      }

      try {
        setUpdatingStatus(true);

        await demandeDocumentService
          .updateStatus(
            demandeId,
            selectedDocument.id,
            nextDocumentStatus,
            nextDocumentStatus ===
              StatutDocument.NON_CONFORME
              ? motifNonConformite.trim()
              : undefined
          );

        await onReload();

        toast.success(
          nextDocumentStatus ===
            StatutDocument.CONFORME
            ? "Le document est déclaré conforme."
            : "Le document est déclaré non conforme."
        );

        setStatusDialogOpen(false);
        setSelectedDocument(null);
        setNextDocumentStatus(null);
        setMotifNonConformite("");
      } catch (statusError) {
        console.error(
          "Erreur vérification document :",
          statusError
        );

        toast.error(
          getErrorMessage(
            statusError,
            "Erreur lors de la vérification du document."
          )
        );
      } finally {
        setUpdatingStatus(false);
      }
    };

  const openDeleteDialog = (
    documentItem: DemandeDocument
  ) => {
    if (!canDeleteDocuments) {
      toast.error(
        "Les documents peuvent uniquement être supprimés par l’agent avant la transmission de la demande."
      );

      return;
    }

    setSelectedDocument(documentItem);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setSelectedDocument(null);
  };

  const handleDelete = async () => {
    if (!canDeleteDocuments) {
      toast.error(
        "Vous n’êtes pas autorisé à supprimer ce document."
      );

      return;
    }

    if (!selectedDocument) {
      return;
    }

    try {
      setDeleting(true);

      await demandeDocumentService
        .deleteDocument(
          demandeId,
          selectedDocument.id
        );

      await onReload();

      toast.success(
        "Document supprimé avec succès."
      );

      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    } catch (deleteError) {
      console.error(
        "Erreur suppression document :",
        deleteError
      );

      toast.error(
        getErrorMessage(
          deleteError,
          "Erreur lors de la suppression du document."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 4,
        }}
      >
        <CircularProgress
          size={30}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Impossible de charger les pièces
        justificatives.
      </Alert>
    );
  }

  return (
    <>
      <Paper
        sx={{
          p: 4,
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{
            mb: 3,
            justifyContent:
              "space-between",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
              }}
            >
              📎 Pièces justificatives
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              CIN ou passeport, contrat et
              procuration
            </Typography>
          </Box>

          {canUploadDocuments && (
            <Button
              variant="contained"
              startIcon={
                <UploadFileIcon />
              }
              disabled={
                availableTypes.length === 0
              }
              onClick={
                handleOpenUploadDialog
              }
            >
              Ajouter un document
            </Button>
          )}
        </Stack>

        {demandeTerminee && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
          >
            Les documents d’une demande
            terminée ne peuvent plus être
            modifiés.
          </Alert>
        )}

        {!demandeTerminee &&
          isAgent &&
          demandeStatut ===
            StatutDemande.EN_ATTENTE && (
            <Alert
              severity="info"
              sx={{ mb: 3 }}
            >
              Ajoutez les pièces
              justificatives nécessaires
              avant de transmettre la
              demande au responsable.
            </Alert>
          )}

        {!demandeTerminee &&
          isAgent &&
          demandeStatut ===
            StatutDemande.EN_COURS && (
            <Alert
              severity="info"
              sx={{ mb: 3 }}
            >
              La demande a été transmise.
              Les documents sont maintenant
              en lecture seule pour l’agent.
            </Alert>
          )}

        {!demandeTerminee &&
          isResponsable &&
          demandeStatut ===
            StatutDemande.EN_COURS && (
            <Alert
              severity="warning"
              sx={{ mb: 3 }}
            >
              Vérifiez chaque pièce
              justificative et déclarez-la
              conforme ou non conforme avant
              de prendre une décision.
            </Alert>
          )}

        {documents.length === 0 ? (
          <Alert severity="info">
            Aucune pièce justificative
            ajoutée.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Type
                  </TableCell>

                  <TableCell>
                    Fichier
                  </TableCell>

                  <TableCell>
                    Taille
                  </TableCell>

                  <TableCell>
                    Statut
                  </TableCell>

                  <TableCell>
                    Ajouté par
                  </TableCell>

                  <TableCell>
                    Date
                  </TableCell>

                  <TableCell align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {documents.map(
                  (documentItem) => (
                    <TableRow
                      key={documentItem.id}
                    >
                      <TableCell>
                        {getDocumentTypeLabel(
                          documentItem.type
                        )}
                      </TableCell>

                      <TableCell>
                        {
                          documentItem.nomOriginal
                        }
                      </TableCell>

                      <TableCell>
                        {formatFileSize(
                          documentItem.taille
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getDocumentStatusLabel(
                            documentItem.statut
                          )}
                          color={getDocumentStatusColor(
                            documentItem.statut
                          )}
                          size="small"
                        />

                        {documentItem
                          .motifNonConformite && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{
                              display:
                                "block",
                              mt: 1,
                            }}
                          >
                            {
                              documentItem
                                .motifNonConformite
                            }
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        {
                          documentItem
                            .utilisateur.prenom
                        }{" "}
                        {
                          documentItem
                            .utilisateur.nom
                        }
                      </TableCell>

                      <TableCell>
                        {formatDateTime(
                          documentItem.createdAt
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          title="Voir le document"
                          aria-label={`Voir ${documentItem.nomOriginal}`}
                          onClick={() =>
                            handleView(
                              documentItem
                            )
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>

                        <IconButton
                          color="primary"
                          title="Télécharger"
                          aria-label={`Télécharger ${documentItem.nomOriginal}`}
                          onClick={() =>
                            handleDownload(
                              documentItem
                            )
                          }
                        >
                          <DownloadIcon />
                        </IconButton>

                        {canVerifyDocuments &&
                          documentItem.statut ===
                            StatutDocument.DEPOSE && (
                            <>
                              <IconButton
                                color="success"
                                title="Déclarer conforme"
                                aria-label={`Déclarer ${documentItem.nomOriginal} conforme`}
                                onClick={() =>
                                  openStatusDialog(
                                    documentItem,
                                    StatutDocument.CONFORME
                                  )
                                }
                              >
                                <CheckCircleIcon />
                              </IconButton>

                              <IconButton
                                color="warning"
                                title="Déclarer non conforme"
                                aria-label={`Déclarer ${documentItem.nomOriginal} non conforme`}
                                onClick={() =>
                                  openStatusDialog(
                                    documentItem,
                                    StatutDocument.NON_CONFORME
                                  )
                                }
                              >
                                <CancelIcon />
                              </IconButton>
                            </>
                          )}

                        {canDeleteDocuments && (
                          <IconButton
                            color="error"
                            title="Supprimer"
                            aria-label={`Supprimer ${documentItem.nomOriginal}`}
                            onClick={() =>
                              openDeleteDialog(
                                documentItem
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialogue d’ajout */}

      <Dialog
        open={uploadDialogOpen}
        onClose={closeUploadDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Ajouter une pièce justificative
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={3}
            sx={{ mt: 1 }}
          >
            <TextField
              select
              fullWidth
              label="Type de document"
              value={selectedType}
              onChange={(event) =>
                setSelectedType(
                  event.target
                    .value as TypeDocument
                )
              }
            >
              {availableTypes.map(
                (type) => (
                  <MenuItem
                    key={type}
                    value={type}
                  >
                    {getDocumentTypeLabel(
                      type
                    )}
                  </MenuItem>
                )
              )}
            </TextField>

            <Box>
              <input
                id="demande-document-file"
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) =>
                  setSelectedFile(
                    event.target
                      .files?.[0] ??
                      null
                  )
                }
              />

              <label htmlFor="demande-document-file">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={
                    <UploadFileIcon />
                  }
                >
                  Choisir un fichier
                </Button>
              </label>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {selectedFile
                  ? `${selectedFile.name} — ${formatFileSize(
                      selectedFile.size
                    )}`
                  : "Formats acceptés : PDF, JPG et PNG — 5 Mo maximum"}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              closeUploadDialog
            }
            disabled={uploading}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={
              uploading ||
              !selectedType ||
              !selectedFile
            }
          >
            {uploading
              ? "Envoi..."
              : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de vérification */}

      <Dialog
        open={statusDialogOpen}
        onClose={closeStatusDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Vérification du document
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{ mb: 2 }}
          >
            {nextDocumentStatus ===
            StatutDocument.CONFORME
              ? "Confirmez-vous que ce document est conforme ?"
              : "Indiquez pourquoi ce document est non conforme."}
          </DialogContentText>

          {nextDocumentStatus ===
            StatutDocument.NON_CONFORME && (
            <TextField
              autoFocus
              fullWidth
              required
              multiline
              minRows={4}
              label="Motif de non-conformité"
              value={motifNonConformite}
              onChange={(event) =>
                setMotifNonConformite(
                  event.target.value
                )
              }
              error={
                motifNonConformite.length >
                  0 &&
                motifNonConformite
                  .trim().length < 5
              }
              helperText={
                motifNonConformite.length >
                  0 &&
                motifNonConformite
                  .trim().length < 5
                  ? "Le motif doit contenir au moins 5 caractères."
                  : `${motifNonConformite.length}/500 caractères`
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
            disabled={updatingStatus}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            color={
              nextDocumentStatus ===
              StatutDocument.CONFORME
                ? "success"
                : "error"
            }
            disabled={
              updatingStatus ||
              (
                nextDocumentStatus ===
                  StatutDocument.NON_CONFORME &&
                motifNonConformite
                  .trim().length < 5
              )
            }
            onClick={
              handleConfirmStatus
            }
          >
            {updatingStatus
              ? "Traitement..."
              : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de suppression */}

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>
          Supprimer le document
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer
            le fichier{" "}
            <strong>
              {
                selectedDocument?.nomOriginal
              }
            </strong>
            ?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              closeDeleteDialog
            }
            disabled={deleting}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting
              ? "Suppression..."
              : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DemandeDocuments;