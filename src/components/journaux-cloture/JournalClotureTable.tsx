import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import {
  Link,
} from "react-router-dom";

import type {
  JournalCloture,
} from "../../types/journal-cloture";

import {
  formatDate,
  formatDateTime,
} from "../../utils/date";

interface Props {
  journaux: JournalCloture[];
}

function getDemandesCount(
  journal: JournalCloture
): number {
  return (
    journal._count?.demandes ??
    journal.demandes?.length ??
    0
  );
}

function getDemandesLabel(
  count: number
): string {
  return `${count} demande${
    count > 1 ? "s" : ""
  }`;
}

function JournalClotureTable({
  journaux,
}: Props) {
  return (
    <>
      {/* Tableau pour ordinateur */}

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          width: "100%",
          borderColor: "divider",
          overflowX: "auto",
        }}
      >
        <Table
          sx={{
            minWidth: 950,
          }}
        >
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
            {journaux.map((journal) => {
              const demandesCount =
                getDemandesCount(journal);

              return (
                <TableRow
                  key={journal.id}
                  hover
                  sx={{
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell>
                    <Typography
                      sx={{
                        color:
                          "primary.main",
                        fontWeight: 800,
                      }}
                    >
                      {journal.numero}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                      }}
                    >
                      <CalendarMonthRoundedIcon
                        sx={{
                          fontSize: 19,
                          color:
                            "text.secondary",
                        }}
                      />

                      <Typography variant="body2">
                        {formatDate(
                          journal.dateJour
                        )}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                      }}
                    >
                      <EventAvailableRoundedIcon
                        sx={{
                          fontSize: 19,
                          color:
                            "text.secondary",
                        }}
                      />

                      <Typography variant="body2">
                        {formatDateTime(
                          journal.dateCloture
                        )}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                      }}
                    >
                      <PersonRoundedIcon
                        sx={{
                          fontSize: 19,
                          color:
                            "primary.main",
                        }}
                      />

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {
                          journal
                            .responsable
                            .prenom
                        }{" "}
                        {
                          journal
                            .responsable
                            .nom
                        }
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={
                        <FolderCopyRoundedIcon />
                      }
                      label={getDemandesLabel(
                        demandesCount
                      )}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Consulter le journal">
                      <IconButton
                        component={Link}
                        to={`/journaux-cloture/${journal.id}`}
                        color="primary"
                        aria-label={`Consulter le journal ${journal.numero}`}
                      >
                        <VisibilityRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cartes pour téléphone */}

      <Stack
        spacing={2}
        sx={{
          display: {
            xs: "flex",
            md: "none",
          },
        }}
      >
        {journaux.map((journal) => {
          const demandesCount =
            getDemandesCount(journal);

          return (
            <Paper
              key={journal.id}
              variant="outlined"
              sx={{
                p: 2.5,
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems:
                    "flex-start",
                  justifyContent:
                    "space-between",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 0.4,
                      fontWeight: 700,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.05em",
                    }}
                  >
                    Journal de clôture
                  </Typography>

                  <Typography
                    sx={{
                      color:
                        "primary.main",
                      fontWeight: 800,
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {journal.numero}
                  </Typography>
                </Box>

                <Chip
                  label={getDemandesLabel(
                    demandesCount
                  )}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.75}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems:
                      "flex-start",
                    gap: 1.25,
                  }}
                >
                  <CalendarMonthRoundedIcon
                    sx={{
                      mt: 0.15,
                      fontSize: 20,
                      color:
                        "text.secondary",
                    }}
                  />

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontWeight: 700,
                      }}
                    >
                      Journée clôturée
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {formatDate(
                        journal.dateJour
                      )}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems:
                      "flex-start",
                    gap: 1.25,
                  }}
                >
                  <EventAvailableRoundedIcon
                    sx={{
                      mt: 0.15,
                      fontSize: 20,
                      color:
                        "text.secondary",
                    }}
                  />

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontWeight: 700,
                      }}
                    >
                      Clôture effectuée le
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {formatDateTime(
                        journal.dateCloture
                      )}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems:
                      "flex-start",
                    gap: 1.25,
                  }}
                >
                  <PersonRoundedIcon
                    sx={{
                      mt: 0.15,
                      fontSize: 20,
                      color:
                        "primary.main",
                    }}
                  />

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontWeight: 700,
                      }}
                    >
                      Responsable
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {
                        journal
                          .responsable
                          .prenom
                      }{" "}
                      {
                        journal
                          .responsable
                          .nom
                      }
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Button
                component={Link}
                to={`/journaux-cloture/${journal.id}`}
                fullWidth
                variant="outlined"
                startIcon={
                  <VisibilityRoundedIcon />
                }
                sx={{
                  mt: 2.5,
                }}
              >
                Consulter le journal
              </Button>
            </Paper>
          );
        })}
      </Stack>
    </>
  );
}

export default JournalClotureTable;