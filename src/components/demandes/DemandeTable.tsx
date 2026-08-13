import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import {
  Link,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  toast,
} from "react-toastify";

import demandeService from "../../services/demande.service";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  ROLES,
} from "../../utils/roles";

import {
  NatureDemande,
  StatutDemande,
} from "../../types/demande";

import {
  StatutPaiement,
} from "../../types/paiement";

import {
  getStatusColor,
  getStatusLabel,
  isDemandeTerminee,
} from "../../utils/demande";

import type {
  Demande,
} from "../../types/demande";


interface Props {
  demandes:
    Demande[];

  onReload:
    () => Promise<void>;
}


/**
 * ============================================================
 * OUTILS D'AFFICHAGE
 * ============================================================
 */

/**
 * Retourne le libellé de la nature métier.
 */
function getNatureLabel(
  demande: Demande
): string {
  switch (
    demande.nature
  ) {
    case NatureDemande.INSCRIPTION:
      return "Inscription";

    case NatureDemande.PRESTATION:
      return "Prestation";

    default:
      return "Ancien modèle";
  }
}


function getNatureColor(
  demande: Demande
):
  | "primary"
  | "info"
  | "default" {
  switch (
    demande.nature
  ) {
    case NatureDemande.INSCRIPTION:
      return "primary";

    case NatureDemande.PRESTATION:
      return "info";

    default:
      return "default";
  }
}


/**
 * Retourne le libellé du statut de paiement.
 *
 * L'absence d'objet paiement signifie
 * qu'aucun encaissement n'a été réalisé.
 */
function getPaiementLabel(
  demande: Demande
): string {
  if (
    !demande.paiement
  ) {
    return "Non payé";
  }

  switch (
    demande
      .paiement
      .statut
  ) {
    case StatutPaiement.PAYE:
      return "Payé";

    case StatutPaiement.REMBOURSE:
      return "Remboursé";

    default:
      return "Statut inconnu";
  }
}


/**
 * Retourne la couleur utilisée par
 * le badge de paiement.
 */
function getPaiementColor(
  demande: Demande
):
  | "success"
  | "warning"
  | "error"
  | "default" {
  if (
    !demande.paiement
  ) {
    return "warning";
  }

  switch (
    demande
      .paiement
      .statut
  ) {
    case StatutPaiement.PAYE:
      return "success";

    case StatutPaiement.REMBOURSE:
      return "error";

    default:
      return "default";
  }
}


/**
 * Affichage du titre foncier.
 *
 * Nouveau modèle :
 * numéro + gouvernorat.
 *
 * Ancien modèle :
 * référence foncière historique.
 */
function TitreFoncierCell({
  demande,
}: {
  demande: Demande;
}) {
  if (
    demande.nature == null
  ) {
    return (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
        }}
      >
        {demande.referenceFonciere ||
          "Non renseignée"}
      </Typography>
    );
  }

  if (
    !demande.titreFoncier
  ) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Sans titre foncier
      </Typography>
    );
  }

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
        }}
      >
        {
          demande
            .titreFoncier
            .numero
        }
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {
          demande
            .titreFoncier
            .gouvernorat
            .nom
        }
      </Typography>
    </Box>
  );
}


function DemandeTable({
  demandes,
  onReload,
}: Props) {
  const {
    user,
  } = useAuth();

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] =
    useState(false);

  const [
    selectedDemande,
    setSelectedDemande,
  ] =
    useState<Demande | null>(
      null
    );

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  const isAdmin =
    user?.role ===
    ROLES.ADMIN;

  const isAgent =
    user?.role ===
    ROLES.AGENT;


  /**
   * ==========================================================
   * DROITS DE MODIFICATION
   * ==========================================================
   */

  const canEditDemande = (
    demande: Demande
  ): boolean => {
    if (
      !user
    ) {
      return false;
    }

    /**
     * Une demande terminée ne peut
     * plus être modifiée.
     */
    if (
      isDemandeTerminee(
        demande.statut
      )
    ) {
      return false;
    }

    /**
     * Dès qu'un paiement existe,
     * la demande devient verrouillée.
     */
    if (
      demande.paiement
    ) {
      return false;
    }

    /**
     * L'administrateur conserve l'accès
     * à toute demande non terminée
     * et non payée.
     */
    if (
      isAdmin
    ) {
      return true;
    }

    /**
     * L'agent ne peut modifier que sa
     * propre demande avant transmission
     * et avant paiement.
     */
    return (
      isAgent &&
      demande.utilisateur.id ===
        user.id &&
      demande.statut ===
        StatutDemande.EN_ATTENTE
    );
  };


  const canDeleteDemande = (
    demande: Demande
  ): boolean => {
    return canEditDemande(
      demande
    );
  };


  /**
   * ==========================================================
   * SUPPRESSION
   * ==========================================================
   */

  const handleDeleteClick = (
    demande: Demande
  ) => {
    setSelectedDemande(
      demande
    );

    setDeleteDialogOpen(
      true
    );
  };


  const handleCloseDeleteDialog =
    () => {
      if (
        deleting
      ) {
        return;
      }

      setDeleteDialogOpen(
        false
      );

      setSelectedDemande(
        null
      );
    };


  const handleConfirmDelete =
    async () => {
      if (
        !selectedDemande
      ) {
        return;
      }

      try {
        setDeleting(
          true
        );

        await demandeService
          .deleteDemande(
            selectedDemande.id
          );

        setDeleteDialogOpen(
          false
        );

        setSelectedDemande(
          null
        );

        await onReload();

        toast.success(
          "Demande supprimée avec succès."
        );
      } catch {
        toast.error(
          "Erreur lors de la suppression de la demande."
        );
      } finally {
        setDeleting(
          false
        );
      }
    };


  /**
   * ==========================================================
   * AFFICHAGE
   * ==========================================================
   */

  return (
    <>
      <TableContainer
        component={
          Paper
        }
        variant="outlined"
      >
        <Table
          sx={{
            minWidth: 1100,
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
                Nature
              </TableCell>

              <TableCell>
                Titre / Gouvernorat
              </TableCell>

              <TableCell>
                Traitement
              </TableCell>

              <TableCell>
                Paiement
              </TableCell>

              <TableCell>
                Créée par
              </TableCell>

              <TableCell
                align="center"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>


          <TableBody>
            {demandes.length ===
            0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    8
                  }
                  align="center"
                  sx={{
                    py: 6,

                    color:
                      "text.secondary",
                  }}
                >
                  Aucune demande trouvée.
                </TableCell>
              </TableRow>
            ) : (
              demandes.map(
                (
                  demande
                ) => {
                  const canEdit =
                    canEditDemande(
                      demande
                    );

                  const canDelete =
                    canDeleteDemande(
                      demande
                    );

                  return (
                    <TableRow
                      key={
                        demande.id
                      }
                      hover
                    >
                      {/* Numéro */}

                      <TableCell
                        sx={{
                          fontWeight:
                            700,

                          color:
                            "primary.main",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          demande.numero
                        }
                      </TableCell>


                      {/* Demandeur */}

                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              demande
                                .prenomDemandeur
                            }{" "}
                            {
                              demande
                                .nomDemandeur
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            CIN : {
                              demande.cin
                            }
                          </Typography>
                        </Box>
                      </TableCell>


                      {/* Nature */}

                      <TableCell>
                        <Chip
                          label={
                            getNatureLabel(
                              demande
                            )
                          }
                          color={
                            getNatureColor(
                              demande
                            )
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>


                      {/* Titre / Gouvernorat */}

                      <TableCell>
                        <TitreFoncierCell
                          demande={
                            demande
                          }
                        />
                      </TableCell>


                      {/* Statut de traitement */}

                      <TableCell>
                        <Chip
                          label={
                            getStatusLabel(
                              demande.statut
                            )
                          }
                          color={
                            getStatusColor(
                              demande.statut
                            )
                          }
                          size="small"
                        />
                      </TableCell>


                      {/* Statut du paiement */}

                      <TableCell>
                        <Tooltip
                          title={
                            demande.paiement
                              ? `Reçu : ${demande.paiement.numeroRecu}`
                              : "Aucun paiement enregistré"
                          }
                        >
                          <Chip
                            label={
                              getPaiementLabel(
                                demande
                              )
                            }
                            color={
                              getPaiementColor(
                                demande
                              )
                            }
                            size="small"
                            variant={
                              demande.paiement
                                ? "filled"
                                : "outlined"
                            }
                          />
                        </Tooltip>
                      </TableCell>


                      {/* Créateur */}

                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              demande
                                .utilisateur
                                .prenom
                            }{" "}
                            {
                              demande
                                .utilisateur
                                .nom
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              demande
                                .utilisateur
                                .login
                            }
                          </Typography>
                        </Box>
                      </TableCell>


                      {/* Actions */}

                      <TableCell
                        align="center"
                      >
                        <Tooltip
                          title="Consulter la demande"
                        >
                          <IconButton
                            component={
                              Link
                            }
                            to={`/demandes/${demande.id}`}
                            color="info"
                            aria-label={`Consulter la demande ${demande.numero}`}
                          >
                            <VisibilityRoundedIcon />
                          </IconButton>
                        </Tooltip>


                        {canEdit && (
                          <Tooltip
                            title="Modifier la demande"
                          >
                            <IconButton
                              component={
                                Link
                              }
                              to={`/demandes/edit/${demande.id}`}
                              color="primary"
                              aria-label={`Modifier la demande ${demande.numero}`}
                            >
                              <EditRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        )}


                        {canDelete && (
                          <Tooltip
                            title="Supprimer la demande"
                          >
                            <IconButton
                              color="error"
                              aria-label={`Supprimer la demande ${demande.numero}`}
                              onClick={() =>
                                handleDeleteClick(
                                  demande
                                )
                              }
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>


      {/* ===================================================== */}
      {/* DIALOGUE DE SUPPRESSION */}
      {/* ===================================================== */}

      <Dialog
        open={
          deleteDialogOpen
        }
        onClose={
          handleCloseDeleteDialog
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Supprimer la demande
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer
            la demande{" "}
            <strong>
              {
                selectedDemande
                  ?.numero
              }
            </strong>
            ?
          </DialogContentText>

          <DialogContentText
            sx={{
              mt: 2,

              color:
                "error.main",
            }}
          >
            Cette action est définitive.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseDeleteDialog
            }
            disabled={
              deleting
            }
          >
            Annuler
          </Button>

          <Button
            color="error"
            variant="contained"
            disabled={
              deleting
            }
            onClick={
              handleConfirmDelete
            }
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


export default DemandeTable;