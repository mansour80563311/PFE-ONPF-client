import { CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import DemandeForm from "../../components/demandes/DemandeForm";

import { useDemande } from "../../hooks/useDemande";

function UpdateDemandePage() {

  const { id } = useParams();

  const {
    demande,
    loading,
  } = useDemande(id!);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <PageHeader
        title="Modifier une demande"
      />

      <DemandeForm
        demande={demande!}
      />
    </>
  );
}

export default UpdateDemandePage;