import { CircularProgress, Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import PaginationBar from "../../components/common/PaginationBar";

import DemandeTable from "../../components/demandes/DemandeTable";

import { useDemandes } from "../../hooks/useDemandes";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

function DemandeListPage() {
  const {
    demandes,
    loading,
    searching,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    loadDemandes,
  } = useDemandes();
  const navigate = useNavigate();

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
        <PageHeader
          title="Demandes d’inscription"
          subtitle="Suivez le traitement des demandes et consultez leur état d’avancement."
          icon={<AssignmentRoundedIcon />}
          actions={
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() =>
                navigate("/demandes/create")
              }
            >
              Nouvelle demande
            </Button>
          }
        />

      <SearchBar
        value={search}
        onChange={setSearch}
        loading={searching}
        placeholder="Rechercher une demande..."
      />

      <DemandeTable
        demandes={demandes}
        onReload={loadDemandes}
      />

      <PaginationBar
        page={page}
        totalPages={totalPages}
        onChange={setPage}
      />
    </>
  );
}

export default DemandeListPage;