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
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import axios from "axios";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import userService from "../../services/user.service";

import type {
  User,
} from "../../types/user";

interface Props {
  users: User[];
  onReload: () => Promise<void>;
}

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}

function getDeleteErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError(error)) {
    const responseData =
      error.response?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData?.errors?.[0]?.message ??
      responseData?.message ??
      "Erreur lors de la suppression."
    );
  }

  return "Une erreur inattendue est survenue.";
}

function getRoleLabel(
  role: string
): string {
  const roleLabels: Record<
    string,
    string
  > = {
    ADMIN: "Administrateur",
    AGENT: "Agent",
    RESPONSABLE: "Responsable",
  };

  return roleLabels[role] ?? role;
}

function UserTable({
  users,
  onReload,
}: Props) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<User | null>(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const handleDeleteClick = (
    user: User
  ) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    if (deleting) {
      return;
    }

    setOpen(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete =
    async () => {
      if (!selectedUser) {
        return;
      }

      try {
        setDeleting(true);

        await userService.deleteUser(
          selectedUser.id
        );

        setOpen(false);
        setSelectedUser(null);

        await onReload();

        toast.success(
          "Utilisateur supprimé avec succès."
        );
      } catch (error) {
        toast.error(
          getDeleteErrorMessage(error)
        );
      } finally {
        setDeleting(false);
      }
    };

  return (
    <>
      {/* Tableau sur ordinateur */}

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          width: "100%",
          borderColor: "divider",
          overflowX: "auto",
        }}
      >
        <Table
          sx={{
            minWidth: 1050,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                Utilisateur
              </TableCell>

              <TableCell>
                Identifiant
              </TableCell>

              <TableCell>
                Coordonnées
              </TableCell>

              <TableCell>
                Rôle
              </TableCell>

              <TableCell>
                Statut
              </TableCell>

              <TableCell align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                hover
                sx={{
                  "&:last-child td": {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        borderRadius: "50%",
                        color: "primary.main",
                        bgcolor:
                          "rgba(10, 74, 70, 0.10)",
                      }}
                    >
                      <PersonRoundedIcon
                        fontSize="small"
                      />
                    </Box>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {user.prenom}{" "}
                        {user.nom}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Compte utilisateur
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {user.login}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.75}>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{
                        alignItems: "center",
                      }}
                    >
                      <EmailRoundedIcon
                        sx={{
                          fontSize: 17,
                          color:
                            "text.secondary",
                        }}
                      />

                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </Stack>

                    {user.telephone && (
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{
                          alignItems:
                            "center",
                        }}
                      >
                        <PhoneRoundedIcon
                          sx={{
                            fontSize: 17,
                            color:
                              "text.secondary",
                          }}
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {user.telephone}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    label={getRoleLabel(
                      user.role.nom
                    )}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>

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
                        : "default"
                    }
                    size="small"
                    variant={
                      user.statut
                        ? "filled"
                        : "outlined"
                    }
                  />
                </TableCell>

                <TableCell align="center">
                  <Tooltip title="Modifier l’utilisateur">
                    <IconButton
                      component={Link}
                      to={`/users/edit/${user.id}`}
                      color="primary"
                      aria-label={`Modifier ${user.prenom} ${user.nom}`}
                    >
                      <EditRoundedIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Supprimer l’utilisateur">
                    <IconButton
                      color="error"
                      aria-label={`Supprimer ${user.prenom} ${user.nom}`}
                      onClick={() =>
                        handleDeleteClick(
                          user
                        )
                      }
                    >
                      <DeleteRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cartes sur téléphone */}

      <Stack
        spacing={2}
        sx={{
          display: {
            xs: "flex",
            md: "none",
          },
        }}
      >
        {users.map((user) => (
          <Paper
            key={user.id}
            variant="outlined"
            sx={{
              p: 2.5,
              borderColor: "divider",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "flex-start",
                justifyContent:
                  "space-between",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  minWidth: 0,
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    borderRadius: "50%",
                    color: "primary.main",
                    bgcolor:
                      "rgba(10, 74, 70, 0.10)",
                  }}
                >
                  <PersonRoundedIcon />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {user.prenom}{" "}
                    {user.nom}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    @{user.login}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={
                  user.statut
                    ? "Actif"
                    : "Inactif"
                }
                color={
                  user.statut
                    ? "success"
                    : "default"
                }
                size="small"
                variant={
                  user.statut
                    ? "filled"
                    : "outlined"
                }
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    fontWeight: 700,
                  }}
                >
                  Rôle
                </Typography>

                <Chip
                  label={getRoleLabel(
                    user.role.nom
                  )}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    mt: 0.5,
                  }}
                />
              </Box>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                }}
              >
                <EmailRoundedIcon
                  sx={{
                    fontSize: 18,
                    color: "text.secondary",
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    overflowWrap:
                      "anywhere",
                  }}
                >
                  {user.email}
                </Typography>
              </Stack>

              {user.telephone && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <PhoneRoundedIcon
                    sx={{
                      fontSize: 18,
                      color:
                        "text.secondary",
                    }}
                  />

                  <Typography variant="body2">
                    {user.telephone}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                mt: 2.5,
              }}
            >
              <Button
                component={Link}
                to={`/users/edit/${user.id}`}
                fullWidth
                variant="outlined"
                startIcon={
                  <EditRoundedIcon />
                }
              >
                Modifier
              </Button>

              <Button
                fullWidth
                color="error"
                variant="outlined"
                startIcon={
                  <DeleteRoundedIcon />
                }
                onClick={() =>
                  handleDeleteClick(user)
                }
              >
                Supprimer
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Confirmation de suppression */}

      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        aria-labelledby="delete-user-dialog-title"
        onClose={
          deleting
            ? undefined
            : handleClose
        }
      >
        <DialogTitle
          id="delete-user-dialog-title"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            fontWeight: 700,
          }}
        >
          <WarningAmberRoundedIcon
            color="error"
          />

          Confirmer la suppression
        </DialogTitle>

        <DialogContent dividers>
          <Alert
            severity="warning"
            variant="outlined"
            sx={{
              mb: 2.5,
            }}
          >
            Cette opération peut être
            irréversible.
          </Alert>

          <DialogContentText
            component="div"
          >
            Voulez-vous vraiment supprimer
            le compte de{" "}
            <Typography
              component="span"
              sx={{
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              {selectedUser?.prenom}{" "}
              {selectedUser?.nom}
            </Typography>
             ?
          </DialogContentText>

          {selectedUser && (
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: 2,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2">
                Identifiant :{" "}
                <strong>
                  {selectedUser.login}
                </strong>
              </Typography>

              <Typography variant="body2">
                Rôle :{" "}
                <strong>
                  {getRoleLabel(
                    selectedUser.role.nom
                  )}
                </strong>
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
            disabled={deleting}
            onClick={handleClose}
          >
            Annuler
          </Button>

          <Button
            color="error"
            variant="contained"
            startIcon={
              deleting ? (
                <CircularProgress
                  size={19}
                  color="inherit"
                />
              ) : (
                <DeleteRoundedIcon />
              )
            }
            disabled={deleting}
            onClick={
              handleConfirmDelete
            }
          >
            {deleting
              ? "Suppression..."
              : "Supprimer le compte"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UserTable;