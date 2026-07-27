import {
  Box,
} from "@mui/material";

import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";

import {
  useNavigate,
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import DemandeForm from "../../components/demandes/DemandeForm";

function CreateDemandePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
      }}
    >
      <PageHeader
        title="Nouvelle demande"
        subtitle="Enregistrez les informations du demandeur et du bien foncier avant d’ajouter les pièces justificatives."
        icon={<PostAddRoundedIcon />}
        breadcrumbs={[
          {
            label: "Demandes",
            onClick: () =>
              navigate("/demandes"),
          },
          {
            label: "Nouvelle demande",
          },
        ]}
      />

      <DemandeForm />
    </Box>
  );
}

export default CreateDemandePage;