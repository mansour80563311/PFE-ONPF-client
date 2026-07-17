import PageHeader from "../../components/common/PageHeader";
import UserForm from "../../components/users/UserForm";

function CreateUserPage() {
  return (
    <>
      <PageHeader
        title="Nouvel utilisateur"
      />

      <UserForm />
    </>
  );
}

export default CreateUserPage;