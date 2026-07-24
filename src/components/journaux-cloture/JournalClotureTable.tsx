import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";

import { Link } from "react-router-dom";

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

function JournalClotureTable({
  journaux,
}: Props) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Numéro</TableCell>

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
          {journaux.map((journal) => (
            <TableRow key={journal.id}>
              <TableCell>
                {journal.numero}
              </TableCell>

              <TableCell>
                {formatDate(journal.dateJour)}
              </TableCell>

              <TableCell>
                {formatDateTime(
                  journal.dateCloture
                )}
              </TableCell>

              <TableCell>
                {journal.responsable.prenom}{" "}
                {journal.responsable.nom}
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    journal._count?.demandes ??
                    journal.demandes?.length ??
                    0
                  }
                  size="small"
                  color="primary"
                  variant="outlined"
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
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default JournalClotureTable;