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

import AssignmentIcon from "@mui/icons-material/Assignment";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LockClockIcon from "@mui/icons-material/LockClock";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import PageHeader from "../../components/common/PageHeader";

import {
  useDashboard,
} from "../../hooks/useDashboard";

import {
  formatDate,
  formatDateTime,
} from "../../utils/date";

import {
  getStatusColor,
  getStatusLabel,
} from "../../utils/demande";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

function DashboardPage() {
  const navigate = useNavigate();

  const {
    dashboard,
    loading,
    error,
  } = useDashboard();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dashboard) {
    return (
      <Alert severity="error">
        {error ??
          "Les données du tableau de bord sont indisponibles."}
      </Alert>
    );
  }

  const {
    statistiques,
    dernieresDemandes,
    derniersJournaux,
  } = dashboard;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue générale de l’activité et du traitement des inscriptions foncières."
        icon={<DashboardRoundedIcon />}
      />

      {/* Cartes statistiques */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        <DashboardStatCard
          title="Total des demandes"
          value={
            statistiques.totalDemandes
          }
          icon={<AssignmentIcon />}
        />

        <DashboardStatCard
          title="Demandes en attente"
          value={
            statistiques.demandesEnAttente
          }
          icon={<HourglassEmptyIcon />}
        />

        <DashboardStatCard
          title="Demandes en cours"
          value={
            statistiques.demandesEnCours
          }
          icon={<AutorenewIcon />}
        />

        <DashboardStatCard
          title="Demandes validées"
          value={
            statistiques.demandesValidees
          }
          icon={<CheckCircleIcon />}
        />

        <DashboardStatCard
          title="Demandes rejetées"
          value={
            statistiques.demandesRejetees
          }
          icon={<CancelIcon />}
        />

        <DashboardStatCard
          title="Demandes clôturées"
          value={
            statistiques.demandesCloturees
          }
          icon={<LockClockIcon />}
        />

        <DashboardStatCard
          title="Documents non conformes"
          value={
            statistiques.documentsNonConformes
          }
          icon={<DescriptionIcon />}
        />
      </Box>

      {/* Dernières demandes */}

      <Paper
        sx={{
          p: 3,
          mt: 4,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            Dernières demandes
          </Typography>

          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() =>
              navigate("/demandes")
            }
          >
            Voir toutes les demandes
          </Button>
        </Box>

        {dernieresDemandes.length === 0 ? (
          <Alert severity="info">
            Aucune demande enregistrée.
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
                    Date de création
                  </TableCell>

                  <TableCell align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {dernieresDemandes.map(
                  (demande) => (
                    <TableRow
                      key={demande.id}
                    >
                      <TableCell>
                        {demande.numero}
                      </TableCell>

                      <TableCell>
                        {
                          demande.prenomDemandeur
                        }{" "}
                        {
                          demande.nomDemandeur
                        }
                      </TableCell>

                      <TableCell>
                        {demande.cin}
                      </TableCell>

                      <TableCell>
                        {
                          demande.referenceFonciere
                        }
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
                        {formatDateTime(
                          demande.createdAt
                        )}
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
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Derniers journaux */}

      <Paper
        sx={{
          p: 3,
          mt: 4,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            Derniers journaux de clôture
          </Typography>

          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() =>
              navigate(
                "/journaux-cloture"
              )
            }
          >
            Voir tous les journaux
          </Button>
        </Box>

        {derniersJournaux.length === 0 ? (
          <Alert severity="info">
            Aucun journal de clôture
            enregistré.
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
                    Journée clôturée
                  </TableCell>

                  <TableCell>
                    Date de clôture
                  </TableCell>

                  <TableCell>
                    Responsable
                  </TableCell>

                  <TableCell>
                    Demandes
                  </TableCell>

                  <TableCell align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {derniersJournaux.map(
                  (journal) => (
                    <TableRow
                      key={journal.id}
                    >
                      <TableCell>
                        {journal.numero}
                      </TableCell>

                      <TableCell>
                        {formatDate(
                          journal.dateJour
                        )}
                      </TableCell>

                      <TableCell>
                        {formatDateTime(
                          journal.dateCloture
                        )}
                      </TableCell>

                      <TableCell>
                        {
                          journal.responsable
                            .prenom
                        }{" "}
                        {
                          journal.responsable
                            .nom
                        }
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`${journal._count.demandes} demande(s)`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          component={Link}
                          to={`/journaux-cloture/${journal.id}`}
                          color="info"
                          title="Consulter le journal"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
}

export default DashboardPage;