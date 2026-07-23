import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

import demandeService from "../../services/demande.service";



import type { Demande } from "../../types/demande";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  getStatusColor,
  getStatusLabel,
  isDemandeTerminee,
} from "../../utils/demande";

interface Props {
  demandes: Demande[];
  onReload: () => Promise<void>;
}

function DemandeTable({
  demandes,
  onReload,
}: Props) {
  const [open, setOpen] = useState(false);

  const [selectedDemande, setSelectedDemande] =
    useState<Demande | null>(null);

  const handleDeleteClick = (
    demande: Demande
  ) => {
    setSelectedDemande(demande);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDemande(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDemande) return;

    try {
      await demandeService.deleteDemande(
        selectedDemande.id
      );

      handleClose();

      await onReload();

      toast.success("Demande supprimée.");
    } catch {
      toast.error(
        "Erreur lors de la suppression."
      );
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>

          <TableHead>
            <TableRow>

              <TableCell>
                N°
              </TableCell>

              <TableCell>
                Nom
              </TableCell>

              <TableCell>
                Prénom
              </TableCell>

              <TableCell>
                CIN
              </TableCell>

              <TableCell>
                Référence
              </TableCell>

              <TableCell>
                Statut
              </TableCell>

              <TableCell>
                Créée par
              </TableCell>

              <TableCell align="center">
                Actions
              </TableCell>

            </TableRow>
          </TableHead>

          <TableBody>

            {demandes.map((demande) => (

              <TableRow key={demande.id}>

                <TableCell>
                  {demande.numero}
                </TableCell>

                <TableCell>
                  {demande.nomDemandeur}
                </TableCell>

                <TableCell>
                  {demande.prenomDemandeur}
                </TableCell>

                <TableCell>
                  {demande.cin}
                </TableCell>

                <TableCell>
                  {demande.referenceFonciere}
                </TableCell>

                <TableCell>

                  
                <Chip
                  label={getStatusLabel(demande.statut)}
                  color={getStatusColor(demande.statut)}
                  size="small"
                />

                </TableCell>

                <TableCell>
                  {demande.utilisateur.nom}{" "}
                  {demande.utilisateur.prenom}
                </TableCell>

              <TableCell align="center">
                <IconButton
                  component={Link}
                  to={`/demandes/${demande.id}`}
                  color="info"
                  title="Voir la demande"
                >
                  <VisibilityIcon />
                </IconButton>

                <IconButton
                  component={Link}
                  to={`/demandes/edit/${demande.id}`}
                  color="primary"
                  disabled={isDemandeTerminee(
                    demande.statut
                  )}
                  title={
                    isDemandeTerminee(demande.statut)
                      ? "Une demande terminée ne peut plus être modifiée."
                      : "Modifier la demande"
                  }
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
                  disabled={isDemandeTerminee(
                    demande.statut
                  )}
                  title={
                    isDemandeTerminee(demande.statut)
                      ? "Une demande terminée ne peut plus être supprimée."
                      : "Supprimer la demande"
                  }
                  onClick={() =>
                    handleDeleteClick(demande)
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
              </TableRow>

            ))}

          </TableBody>

        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          Confirmation
        </DialogTitle>

        <DialogContent>

          <DialogContentText>

            Voulez-vous vraiment supprimer la demande

            <strong>
              {" "}
              {selectedDemande?.numero}
            </strong>

            ?

          </DialogContentText>

        </DialogContent>

        <DialogActions>

          <Button onClick={handleClose}>
            Annuler
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Supprimer
          </Button>

        </DialogActions>

      </Dialog>
    </>
  );
}

export default DemandeTable;