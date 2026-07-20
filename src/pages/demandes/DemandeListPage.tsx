import { CircularProgress, Button } from "@mui/material";

import { Link } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import PaginationBar from "../../components/common/PaginationBar";

import DemandeTable from "../../components/demandes/DemandeTable";

import { useDemandes } from "../../hooks/useDemandes";

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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <PageHeader
        title="Demandes d'inscription"
        action={
          <Button
            component={Link}
            to="/demandes/create"
            variant="contained"
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