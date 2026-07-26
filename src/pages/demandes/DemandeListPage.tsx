import { CircularProgress, Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import PaginationBar from "../../components/common/PaginationBar";

import DemandeTable from "../../components/demandes/DemandeTable";

import { useDemandes } from "../../hooks/useDemandes";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useAuth } from "../../hooks/useAuth";

import {
  ROLES,
} from "../../utils/roles";

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

  const { user } = useAuth();

  const canCreateDemande =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.AGENT;

  const isResponsable =
    user?.role === ROLES.RESPONSABLE;

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <PageHeader
        title={
          isResponsable
            ? "Demandes à traiter"
            : "Demandes d’inscription"
        }
        subtitle={
          isResponsable
            ? "Consultez les demandes transmises afin de vérifier leurs informations et leurs pièces justificatives."
            : "Suivez le traitement des demandes et consultez leur état d’avancement."
        }
        icon={<AssignmentRoundedIcon />}
        actions={
          canCreateDemande ? (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() =>
                navigate("/demandes/create")
              }
            >
              Nouvelle demande
            </Button>
          ) : undefined
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