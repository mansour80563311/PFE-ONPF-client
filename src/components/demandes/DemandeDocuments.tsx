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
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { useState } from "react";
import { toast } from "react-toastify";

import demandeDocumentService from "../../services/demande-document.service";

import {
  StatutDocument,
  TypeDocument,
} from "../../types/demande-document";

import type {
  DemandeDocument,
} from "../../types/demande-document";

import type {
  StatutDemande,
} from "../../types/demande";

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

interface Props {
  demandeId: string;
  demandeStatut: StatutDemande;
  documents: DemandeDocument[];
  loading: boolean;
  error: boolean;
  onReload: () => Promise<void>;
}

const DOCUMENT_TYPES: TypeDocument[] = [
  TypeDocument.CIN,
  TypeDocument.PASSEPORT,
  TypeDocument.CONTRAT,
  TypeDocument.PROCURATION,
];

function DemandeDocuments({
  demandeId,
  demandeStatut,
  documents,
  loading,
  error,
  onReload,
}: Props) {
  const demandeTerminee =
    isDemandeTerminee(demandeStatut);

  const [uploadDialogOpen, setUploadDialogOpen] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState<TypeDocument | "">("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [statusDialogOpen, setStatusDialogOpen] =
    useState(false);

  const [selectedDocument, setSelectedDocument] =
    useState<DemandeDocument | null>(null);

  const [nextDocumentStatus, setNextDocumentStatus] =
    useState<StatutDocument | null>(null);

  const [
    motifNonConformite,
    setMotifNonConformite,
  ] = useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const identityDocumentExists =
    documents.some(
      (documentItem) =>
        documentItem.type === TypeDocument.CIN ||
        documentItem.type === TypeDocument.PASSEPORT
    );

  const availableTypes = DOCUMENT_TYPES.filter(
    (type) => {
      const sameTypeExists = documents.some(
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
    }
  );

  const closeUploadDialog = () => {
    if (uploading) return;

    setUploadDialogOpen(false);
    setSelectedType("");
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedType || !selectedFile) {
      toast.error(
        "Sélectionnez un type et un fichier."
      );

      return;
    }

    try {
      setUploading(true);

      await demandeDocumentService.uploadDocument(
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
    } catch {
      toast.error(
        "Erreur lors de l’ajout du document."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (
    documentItem: DemandeDocument
  ) => {
    try {
      const blob =
        await demandeDocumentService.downloadDocument(
          demandeId,
          documentItem.id
        );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        window.document.createElement("a");

      link.href = url;
      link.download = documentItem.nomOriginal;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(
        "Impossible de télécharger le document."
      );
    }
  };

  const openStatusDialog = (
    documentItem: DemandeDocument,
    statut: StatutDocument
  ) => {
    setSelectedDocument(documentItem);
    setNextDocumentStatus(statut);
    setMotifNonConformite("");
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    if (updatingStatus) return;

    setStatusDialogOpen(false);
    setSelectedDocument(null);
    setNextDocumentStatus(null);
    setMotifNonConformite("");
  };

  const handleConfirmStatus = async () => {
    if (
      !selectedDocument ||
      !nextDocumentStatus
    ) {
      return;
    }

    if (
      nextDocumentStatus ===
        StatutDocument.NON_CONFORME &&
      motifNonConformite.trim().length < 5
    ) {
      toast.error(
        "Le motif doit contenir au moins 5 caractères."
      );

      return;
    }

    try {
      setUpdatingStatus(true);

      await demandeDocumentService.updateStatus(
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
    } catch {
      toast.error(
        "Erreur lors de la vérification du document."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openDeleteDialog = (
    documentItem: DemandeDocument
  ) => {
    setSelectedDocument(documentItem);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;

    setDeleteDialogOpen(false);
    setSelectedDocument(null);
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      setDeleting(true);

      await demandeDocumentService.deleteDocument(
        demandeId,
        selectedDocument.id
      );

      await onReload();

      toast.success(
        "Document supprimé avec succès."
      );

      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    } catch {
      toast.error(
        "Erreur lors de la suppression du document."
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
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Impossible de charger les pièces justificatives.
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
            justifyContent: "space-between",
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
              CIN ou passeport, contrat et procuration
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={
              demandeTerminee ||
              availableTypes.length === 0
            }
            onClick={() =>
              setUploadDialogOpen(true)
            }
          >
            Ajouter un document
          </Button>
        </Stack>

        {demandeTerminee && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
          >
            Les documents d’une demande terminée
            ne peuvent plus être modifiés.
          </Alert>
        )}

        {documents.length === 0 ? (
          <Alert severity="info">
            Aucune pièce justificative ajoutée.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Fichier</TableCell>
                  <TableCell>Taille</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Ajouté par</TableCell>
                  <TableCell>Date</TableCell>

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
                        {documentItem.nomOriginal}
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
                              display: "block",
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
                          documentItem.utilisateur
                            .prenom
                        }{" "}
                        {
                          documentItem.utilisateur
                            .nom
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
                          title="Télécharger"
                          onClick={() =>
                            handleDownload(
                              documentItem
                            )
                          }
                        >
                          <DownloadIcon />
                        </IconButton>

                        {!demandeTerminee &&
                          documentItem.statut ===
                            StatutDocument.DEPOSE && (
                            <>
                              <IconButton
                                color="success"
                                title="Déclarer conforme"
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

                        <IconButton
                          color="error"
                          title="Supprimer"
                          disabled={demandeTerminee}
                          onClick={() =>
                            openDeleteDialog(
                              documentItem
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
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
                  event.target.value as TypeDocument
                )
              }
            >
              {availableTypes.map((type) => (
                <MenuItem
                  key={type}
                  value={type}
                >
                  {getDocumentTypeLabel(type)}
                </MenuItem>
              ))}
            </TextField>

            <Box>
              <input
                id="demande-document-file"
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) =>
                  setSelectedFile(
                    event.target.files?.[0] ??
                      null
                  )
                }
              />

              <label htmlFor="demande-document-file">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
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
            onClick={closeUploadDialog}
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
                motifNonConformite.length > 0 &&
                motifNonConformite.trim()
                  .length < 5
              }
              helperText={
                motifNonConformite.length > 0 &&
                motifNonConformite.trim()
                  .length < 5
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
            onClick={closeStatusDialog}
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
                motifNonConformite.trim()
                  .length < 5
              )
            }
            onClick={handleConfirmStatus}
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
            Voulez-vous vraiment supprimer le fichier{" "}
            <strong>
              {selectedDocument?.nomOriginal}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
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