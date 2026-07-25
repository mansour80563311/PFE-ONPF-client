import { CircularProgress, Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import UserTable from "../../components/users/UserTable";

import { useUsers } from "../../hooks/useUsers";
import PaginationBar from "../../components/common/PaginationBar";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";

function UserListPage() {

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
const navigate = useNavigate();

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
        <PageHeader
          title="Gestion des utilisateurs"
          subtitle="Créez et administrez les comptes ainsi que leurs rôles d’accès."
          icon={<GroupsRoundedIcon />}
          actions={
            <Button
              variant="contained"
              startIcon={<PersonAddRoundedIcon />}
              onClick={() =>
                navigate("/users/create")
              }
            >
              Nouvel utilisateur
            </Button>
          }
        />

      <SearchBar
        value={search}
        onChange={setSearch}
        loading={searching}
        placeholder="Rechercher un utilisateur..."
      />

      <UserTable users={users} onReload={loadUsers}/>

        <PaginationBar
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        />
    </>
  );
}

export default UserListPage;