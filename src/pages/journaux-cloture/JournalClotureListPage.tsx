import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Pagination,
  TextField,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import JournalClotureTable from "../../components/journaux-cloture/JournalClotureTable";

import {
  useJournauxCloture,
} from "../../hooks/useJournauxCloture";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";


function JournalClotureListPage() {
  const navigate = useNavigate();

  const {
    journaux,
    loading,
    searching,
    page,
    totalPages,
    search,
    setPage,
    setSearch,
  } = useJournauxCloture();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
        <PageHeader
        title="Journaux de clôture"
        subtitle="Consultez les clôtures journalières et les demandes qui leur sont rattachées."
        icon={<LockClockRoundedIcon />}
        actions={
            <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
                navigate(
                "/journaux-cloture/create"
                )
            }
            >
            Nouvelle clôture
            </Button>
        }
        />

      <TextField
        fullWidth
        label="Rechercher un journal"
        placeholder="Numéro, responsable ou observations..."
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        sx={{ mb: 3 }}
      />

      {searching && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {journaux.length === 0 ? (
        <Alert severity="info">
          Aucun journal de clôture trouvé.
        </Alert>
      ) : (
        <>
          <JournalClotureTable
            journaux={journaux}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
            }}
          >
            <Pagination
              page={page}
              count={totalPages}
              color="primary"
              onChange={(
                _event,
                value
              ) => setPage(value)}
            />
          </Box>
        </>
      )}
    </>
  );
}

export default JournalClotureListPage;