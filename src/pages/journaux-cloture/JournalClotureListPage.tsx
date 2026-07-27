import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  Pagination,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import {
  useNavigate,
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import JournalClotureTable from "../../components/journaux-cloture/JournalClotureTable";

import {
  useJournauxCloture,
} from "../../hooks/useJournauxCloture";

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

    const hasSearch =
        search.trim().length > 0;

    const handleSearchChange = (
    value: string
    ) => {
    setSearch(value);
    };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
  };

  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          minHeight: 320,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderColor: "divider",
        }}
      >
        <Stack
          spacing={1.5}
          sx={{
            alignItems: "center",
          }}
        >
          <CircularProgress size={34} />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Chargement des journaux de
            clôture...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <PageHeader
        title="Journaux de clôture"
        subtitle="Consultez les clôtures journalières et les demandes qui leur sont rattachées."
        icon={<LockClockRoundedIcon />}
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
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

      {/* Zone de recherche */}

      <Paper
        variant="outlined"
        sx={{
          position: "relative",
          mb: 3,
          p: {
            xs: 2,
            sm: 2.5,
          },
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {searching && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          />
        )}

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          sx={{
            alignItems: {
              xs: "stretch",
              md: "center",
            },
          }}
        >
          <Box
            sx={{
              flex: 1,
            }}
          >
            <Typography
              sx={{
                mb: 0.5,
                fontWeight: 700,
              }}
            >
              Rechercher un journal
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Recherche par numéro, responsable
              ou information associée au journal.
            </Typography>
          </Box>

            <TextField
            fullWidth
            size="small"
            placeholder="Numéro, responsable..."
            value={search}
            onChange={(event) =>
                handleSearchChange(
                event.target.value
                )
            } 
            sx={{
              maxWidth: {
                xs: "100%",
                md: 430,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{
                        color:
                          "text.secondary",
                      }}
                    />
                  </InputAdornment>
                ),

                endAdornment: hasSearch ? (
                  <InputAdornment position="end">
                    <Tooltip title="Effacer la recherche">
                        <IconButton
                        size="small"
                        edge="end"
                        onClick={handleClearSearch}
                        aria-label="Effacer la recherche"
                        >
                        <CloseRoundedIcon
                          fontSize="small"
                        />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Stack>
      </Paper>

      {/* Contenu */}

      {journaux.length === 0 ? (
        <Alert
          severity="info"
          variant="outlined"
        >
          <Typography
            sx={{
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {hasSearch
              ? "Aucun journal ne correspond à votre recherche."
              : "Aucun journal de clôture n’a encore été créé."}
          </Typography>

          <Typography variant="body2">
            {hasSearch
              ? "Modifiez les termes saisis ou effacez la recherche."
              : "Utilisez le bouton « Nouvelle clôture » pour clôturer une journée."}
          </Typography>
        </Alert>
      ) : (
        <>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {journaux.length} journal
              {journaux.length > 1
                ? "x"
                : ""}{" "}
              affiché
              {journaux.length > 1
                ? "s"
                : ""}
              {hasSearch
                ? " pour cette recherche"
                : ""}
              .
            </Typography>
          </Box>

          <JournalClotureTable
            journaux={journaux}
          />

          {totalPages > 1 && (
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
                shape="rounded"
                showFirstButton
                showLastButton
                disabled={searching}
                onChange={(
                  _event,
                  value
                ) => {
                  setPage(value);

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default JournalClotureListPage;