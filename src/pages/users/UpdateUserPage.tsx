import { CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import UserForm from "../../components/users/UserForm";

import { useUser } from "../../hooks/useUser";

function UpdateUserPage() {

  const { id } = useParams();

  const {
    user,
    loading,
  } = useUser(id!);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <PageHeader
        title="Modifier un utilisateur"
      />

      <UserForm
        user={user!}
      />
    </>
  );
}

export default UpdateUserPage;