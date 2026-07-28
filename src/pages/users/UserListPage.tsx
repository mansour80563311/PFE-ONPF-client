import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";

import {
  useNavigate,
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import PaginationBar from "../../components/common/PaginationBar";
import SearchBar from "../../components/common/SearchBar";
import UserTable from "../../components/users/UserTable";

import {
  useUsers,
} from "../../hooks/useUsers";

function UserListPage() {
  const navigate = useNavigate();

  const {
    users,
    loading,
    searching,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    loadUsers,
  } = useUsers();

  const hasSearch =
    search.trim().length > 0;

  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderColor: "divider",
        }}
      >
        <Stack
          spacing={1.5}
          sx={{
            alignItems: "center",
          }}
        >
          <CircularProgress size={34} />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Chargement des utilisateurs...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle="Créez et administrez les comptes ainsi que leurs rôles d’accès."
        icon={<GroupsRoundedIcon />}
        actions={
          <Button
            variant="contained"
            startIcon={
              <PersonAddRoundedIcon />
            }
            onClick={() =>
              navigate("/users/create")
            }
          >
            Nouvel utilisateur
          </Button>
        }
      />

      <Paper
        variant="outlined"
        sx={{
          mb: 3,
          p: {
            xs: 2,
            sm: 2.5,
          },
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          sx={{
            alignItems: {
              xs: "stretch",
              md: "center",
            },
          }}
        >
          <Box
            sx={{
              flex: 1,
            }}
          >
            <Typography
              sx={{
                mb: 0.5,
                fontWeight: 700,
              }}
            >
              Rechercher un utilisateur
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Recherche par nom, prénom,
              identifiant ou adresse e-mail.
            </Typography>
          </Box>

          <Box
            sx={{
              width: {
                xs: "100%",
                md: 430,
              },
            }}
          >
            <SearchBar
              value={search}
              onChange={setSearch}
              loading={searching}
              placeholder="Nom, prénom, login ou e-mail..."
            />
          </Box>
        </Stack>
      </Paper>

      {users.length === 0 ? (
        <Alert
          severity="info"
          variant="outlined"
        >
          <Typography
            sx={{
              mb: 0.5,
              fontWeight: 700,
            }}
          >
            {hasSearch
              ? "Aucun utilisateur ne correspond à votre recherche."
              : "Aucun utilisateur n’a été trouvé."}
          </Typography>

          <Typography variant="body2">
            {hasSearch
              ? "Modifiez les termes saisis ou effacez la recherche."
              : "Utilisez le bouton « Nouvel utilisateur » pour créer un compte."}
          </Typography>
        </Alert>
      ) : (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
            }}
          >
            {users.length} utilisateur
            {users.length > 1 ? "s" : ""}{" "}
            affiché
            {users.length > 1 ? "s" : ""}
            {hasSearch
              ? " pour cette recherche"
              : ""}
            .
          </Typography>

          <UserTable
            users={users}
            onReload={loadUsers}
          />

          {totalPages > 1 && (
            <Box
              sx={{
                mt: 4,
              }}
            >
              <PaginationBar
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default UserListPage;