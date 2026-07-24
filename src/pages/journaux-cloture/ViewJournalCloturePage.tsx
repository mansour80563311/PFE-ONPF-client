import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";

import {
  useJournalCloture,
} from "../../hooks/useJournalCloture";

import {
  formatDate,
  formatDateTime,
} from "../../utils/date";

import {
  getStatusColor,
  getStatusLabel,
} from "../../utils/demande";

function ViewJournalCloturePage() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const {
    journal,
    loading,
  } = useJournalCloture(id!);

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

  if (!journal) {
    return (
      <Alert severity="error">
        Journal de clôture introuvable.
      </Alert>
    );
  }

  const demandes =
    journal.demandes ?? [];

  return (
    <>
      <PageHeader
        title={`Journal ${journal.numero}`}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate("/journaux-cloture")
          }
        >
          Retour à la liste
        </Button>
      </Box>

      {/* Informations générales */}

      <Paper
        sx={{
          p: 4,
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
          }}
        >
          📘 Informations de la clôture
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
            },
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Numéro du journal
            </Typography>

            <Typography>
              {journal.numero}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Journée clôturée
            </Typography>

            <Typography>
              {formatDate(journal.dateJour)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Date et heure de clôture
            </Typography>

            <Typography>
              {formatDateTime(
                journal.dateCloture
              )}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Responsable
            </Typography>

            <Typography>
              {journal.responsable.prenom}{" "}
              {journal.responsable.nom}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Identifiant du responsable
            </Typography>

            <Typography>
              {journal.responsable.login}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              Nombre de demandes
            </Typography>

            <Chip
              label={`${demandes.length} demande(s)`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            Observations
          </Typography>

          <Typography>
            {journal.observations ||
              "Aucune observation."}
          </Typography>
        </Box>
      </Paper>

      {/* Demandes rattachées */}

      <Paper
        sx={{
          p: 4,
          mt: 4,
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
          }}
        >
          📋 Demandes clôturées
        </Typography>

        {demandes.length === 0 ? (
          <Alert severity="info">
            Aucune demande n’est rattachée à ce
            journal.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Numéro
                  </TableCell>

                  <TableCell>
                    Demandeur
                  </TableCell>

                  <TableCell>
                    CIN
                  </TableCell>

                  <TableCell>
                    Référence foncière
                  </TableCell>

                  <TableCell>
                    Statut
                  </TableCell>

                  <TableCell>
                    Dernière modification
                  </TableCell>

                  <TableCell align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {demandes.map((demande) => (
                  <TableRow key={demande.id}>
                    <TableCell>
                      {demande.numero}
                    </TableCell>

                    <TableCell>
                      {demande.prenomDemandeur}{" "}
                      {demande.nomDemandeur}
                    </TableCell>

                    <TableCell>
                      {demande.cin || "-"}
                    </TableCell>

                    <TableCell>
                      {demande.referenceFonciere ||
                        "-"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatusLabel(
                          demande.statut
                        )}
                        color={getStatusColor(
                          demande.statut
                        )}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {demande.updatedAt
                        ? formatDateTime(
                            demande.updatedAt
                          )
                        : "-"}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        component={Link}
                        to={`/demandes/${demande.id}`}
                        color="info"
                        title="Consulter la demande"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
}

export default ViewJournalCloturePage;