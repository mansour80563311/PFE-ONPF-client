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

import type { User } from "../../types/user";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import { useState } from "react";



import userService from "../../services/user.service";
import { toast } from "react-toastify";

interface Props {
  users: User[];
  onReload: () => Promise<void>;
}


function UserTable({ users, onReload }: Props) {
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] =
        useState<User | null>(null);
    
    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setOpen(true);
        };

        const handleClose = () => {
        setOpen(false);
        setSelectedUser(null);
        };

        const handleConfirmDelete = async () => {
        if (!selectedUser) return;

        try {

            await userService.deleteUser(selectedUser.id);

            handleClose();

            await onReload();

            toast.success("Utilisateur supprimé.");

            

        } catch {

            toast.error("Erreur lors de la suppression.");

        }
        };

 return (
  <>
    <TableContainer component={Paper}>
      <Table>

        <TableHead>

          <TableRow>

            <TableCell>Nom</TableCell>

            <TableCell>Prénom</TableCell>

            <TableCell>Login</TableCell>

            <TableCell>Email</TableCell>

            <TableCell>Rôle</TableCell>

            <TableCell>Statut</TableCell>

            <TableCell align="center">
              Actions
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {users.map((user) => (

            <TableRow key={user.id}>

              <TableCell>{user.nom}</TableCell>

              <TableCell>{user.prenom}</TableCell>

              <TableCell>{user.login}</TableCell>

              <TableCell>{user.email}</TableCell>

              <TableCell>{user.role.nom}</TableCell>

              <TableCell>

                <Chip
                  label={
                    user.statut
                      ? "Actif"
                      : "Inactif"
                  }
                  color={
                    user.statut
                      ? "success"
                      : "error"
                  }
                  size="small"
                />

              </TableCell>

                <TableCell align="center">
                <IconButton
                    component={Link}
                    to={`/users/edit/${user.id}`}
                    color="primary"
                >
                    <EditIcon />
                </IconButton>

                <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(user)}
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

            Voulez-vous vraiment supprimer
            l'utilisateur

            <strong>
                {" "}
                {selectedUser?.nom} {selectedUser?.prenom}
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

export default UserTable;



