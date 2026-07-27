import {
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";

import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import DemandeForm from "../../components/demandes/DemandeForm";

import {
  useDemande,
} from "../../hooks/useDemande";

function UpdateDemandePage() {
  const navigate = useNavigate();

  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const {
    demande,
    loading,
  } = useDemande(id!);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!demande) {
    return (
      <Alert severity="error">
        La demande demandée est
        introuvable.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
      }}
    >
      <PageHeader
        title={`Modifier la demande ${demande.numero}`}
        subtitle="Corrigez les informations du demandeur ou du bien avant la transmission du dossier."
        icon={<EditNoteRoundedIcon />}
        breadcrumbs={[
          {
            label: "Demandes",
            onClick: () =>
              navigate("/demandes"),
          },
          {
            label: demande.numero,
            onClick: () =>
              navigate(
                `/demandes/${demande.id}`
              ),
          },
          {
            label: "Modification",
          },
        ]}
      />

      <DemandeForm
        demande={demande}
      />
    </Box>
  );
}

export default UpdateDemandePage;