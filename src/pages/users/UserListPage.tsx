import { CircularProgress, Button } from "@mui/material";

import { Link } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import UserTable from "../../components/users/UserTable";

import { useUsers } from "../../hooks/useUsers";
import PaginationBar from "../../components/common/PaginationBar";

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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        action={
          <Button
            component={Link}
            to="/users/create"
            variant="contained"
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