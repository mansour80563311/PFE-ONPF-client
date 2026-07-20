import { Container } from "@mui/material";
import DemandeForm from "../../components/demandes/DemandeForm";

function CreateDemandePage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <DemandeForm />
    </Container>
  );
}

export default CreateDemandePage;