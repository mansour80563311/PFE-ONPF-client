import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import {
  Link,
} from "react-router-dom";

import type {
  ReactNode,
} from "react";

import {
  NatureDemande,
  StatutTarification,
} from "../../types/demande";

import type {
  Demande,
} from "../../types/demande";

import {
  getStatusColor,
  getStatusLabel,
} from "../../utils/demande";

import {
  formatDate,
  formatDateTime,
} from "../../utils/date";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  ROLES,
} from "../../utils/roles";

interface Props {
  demande: Demande;
}

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

interface DetailItemProps {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        mb: 3,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRadius: 2.5,
          color: "primary.main",
          bgcolor:
            "rgba(10, 74, 70, 0.10)",

          "& svg": {
            fontSize: 24,
          },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function DetailItem({
  label,
  value,
  fullWidth = false,
}: DetailItemProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        gridColumn: fullWidth
          ? "1 / -1"
          : "auto",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 0.6,
          color: "text.secondary",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.055em",
        }}
      >
        {label}
      </Typography>

      <Typography
        component="div"
        sx={{
          color: "text.primary",
          fontWeight: 600,
          lineHeight: 1.6,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function formatMontant(
  value:
    | string
    | number
): string {
  const montant =
    Number(value);

  if (
    !Number.isFinite(
      montant
    )
  ) {
    return "0,000 DT";
  }

  return `${montant
    .toFixed(3)
    .replace(".", ",")} DT`;
}

function getLangueLabel(
  langue?: string | null
): string {
  switch (langue) {
    case "FRANCAIS":
      return "Français";

    case "ARABE":
      return "Arabe";

    case "ANGLAIS":
      return "Anglais";

    default:
      return "Non renseignée";
  }
}

function DemandeDetails({
  demande,
}: Props) {
  const {
    user,
  } = useAuth();

  const canOpenJournal =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.RESPONSABLE;

  const isLegacy =
    demande.nature == null;

  const isInscription =
    demande.nature ===
    NatureDemande.INSCRIPTION;

  const isPrestation =
    demande.nature ===
    NatureDemande.PRESTATION;

  const titreFoncier =
    demande.titreFoncier;

  const tarification =
    demande.tarification;

  const languePrestation =
    tarification?.langue ??
    (
      isPrestation
        ? demande.langueCertificat
        : null
    );

  const nombrePages =
    tarification?.nombrePages ??
    demande.nombrePages ??
    null;

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        p: {
          xs: 2.5,
          sm: 4,
        },
        borderColor: "divider",
      }}
    >
      {/* Résumé du dossier */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            p: 2.25,
            borderRadius: 2.5,
            bgcolor:
              "rgba(10, 74, 70, 0.06)",
            border:
              "1px solid rgba(10, 74, 70, 0.12)",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.75,
              fontWeight: 700,
            }}
          >
            Numéro de la demande
          </Typography>

          <Typography
            sx={{
              color: "primary.main",
              fontWeight: 800,
              fontSize: "1.05rem",
            }}
          >
            {demande.numero}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2.25,
            borderRadius: 2.5,
            bgcolor: "#F7FAF9",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.75,
              fontWeight: 700,
            }}
          >
            Statut actuel
          </Typography>

          <Chip
            label={getStatusLabel(
              demande.statut
            )}
            color={getStatusColor(
              demande.statut
            )}
            size="small"
          />
        </Box>

        <Box
          sx={{
            p: 2.25,
            borderRadius: 2.5,
            bgcolor: "#F7FAF9",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.75,
              fontWeight: 700,
            }}
          >
            Date de création
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {formatDateTime(
              demande.createdAt
            )}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2.25,
            borderRadius: 2.5,
            bgcolor: "#F7FAF9",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.75,
              fontWeight: 700,
            }}
          >
            Dernière modification
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {formatDateTime(
              demande.updatedAt
            )}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Informations du demandeur */}

      <SectionHeader
        icon={<PersonRoundedIcon />}
        title="Informations du demandeur"
        subtitle="Identité et coordonnées de la personne ayant déposé la demande."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
          columnGap: 4,
          rowGap: 3,
        }}
      >
        <DetailItem
          label="Nom"
          value={demande.nomDemandeur}
        />

        <DetailItem
          label="Prénom"
          value={
            demande.prenomDemandeur
          }
        />

        <DetailItem
          label="Numéro de la CIN"
          value={demande.cin}
        />

        <DetailItem
          label="Téléphone"
          value={demande.telephone}
        />

        <DetailItem
          label="Adresse e-mail"
          value={
            demande.email ||
            "Non renseignée"
          }
          fullWidth
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Informations métier */}

      {isLegacy && (
        <>
          <SectionHeader
            icon={<HomeWorkRoundedIcon />}
            title="Informations foncières"
            subtitle="Informations historiques de la demande créée avec l’ancien modèle."
          />

          <Alert
            severity="info"
            variant="outlined"
            sx={{
              mb: 3,
            }}
          >
            Cette demande utilise l’ancien modèle de données. La référence foncière historique est conservée pour assurer la compatibilité.
          </Alert>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              columnGap: 4,
              rowGap: 3,
            }}
          >
            <DetailItem
              label="Référence foncière"
              value={
                demande.referenceFonciere ||
                "Non renseignée"
              }
            />

            <DetailItem
              label="Adresse du bien"
              value={demande.adresseBien}
            />
          </Box>
        </>
      )}

      {isInscription && (
        <>
          <SectionHeader
            icon={<HomeWorkRoundedIcon />}
            title="Informations foncières"
            subtitle="Titre foncier et opérations faisant l’objet de la demande d’inscription."
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              columnGap: 4,
              rowGap: 3,
            }}
          >
            <DetailItem
              label="Nature"
              value="Inscription foncière"
            />

            <DetailItem
              label="Numéro du titre foncier"
              value={
                titreFoncier?.numero ??
                "Non renseigné"
              }
            />

            <DetailItem
              label="Gouvernorat"
              value={
                titreFoncier
                  ?.gouvernorat
                  ?.nom ??
                "Non renseigné"
              }
            />

            <DetailItem
              label="Adresse du bien"
              value={demande.adresseBien}
            />

            <DetailItem
              label="Opération(s) foncière(s)"
              fullWidth
              value={
                demande.operationsFoncieres &&
                demande.operationsFoncieres.length > 0
                  ? (
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{
                    flexWrap: "wrap",
                  }}
                >
                  {demande.operationsFoncieres?.map(
                    (operation) => (
                      <Chip
                        key={operation.id}
                        label={
                          operation
                            .typeOperationFonciere
                            .libelle
                        }
                        size="small"
                        variant="outlined"
                      />
                    )
                  )}
                </Stack>
                    )
                  : "Aucune opération renseignée"
              }
            />
          </Box>
        </>
      )}

      {isPrestation && (
        <>
          <SectionHeader
            icon={<RequestQuoteRoundedIcon />}
            title="Informations de la prestation"
            subtitle="Nature de la prestation et paramètres utilisés pour son traitement."
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              columnGap: 4,
              rowGap: 3,
            }}
          >
            <DetailItem
              label="Nature"
              value="Prestation"
            />

            <DetailItem
              label="Prestation"
              value={
                demande.prestation?.libelle ??
                tarification?.prestationLibelle ??
                "Non renseignée"
              }
            />

            <DetailItem
              label="Langue"
              value={
                getLangueLabel(
                  languePrestation
                )
              }
            />

            {nombrePages !== null && (
              <DetailItem
                label="Nombre de pages"
                value={nombrePages}
              />
            )}

            {titreFoncier && (
              <>
                <DetailItem
                  label="Numéro du titre foncier"
                  value={titreFoncier.numero}
                />

                <DetailItem
                  label="Gouvernorat"
                  value={
                    titreFoncier
                      .gouvernorat
                      .nom
                  }
                />
              </>
            )}

            <DetailItem
              label="Adresse du bien"
              value={demande.adresseBien}
              fullWidth={
                !titreFoncier
              }
            />
          </Box>
        </>
      )}

      {!isLegacy && (
        <>
          <Divider sx={{ my: 4 }} />

          <SectionHeader
            icon={<ReceiptLongRoundedIcon />}
            title="Tarification réglementaire"
            subtitle="Détail du calcul enregistré avec la demande."
          />

          {tarification ? (
            <Paper
              variant="outlined"
              sx={{
                overflow: "hidden",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  bgcolor: "action.hover",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Détail du calcul
                </Typography>

                <Chip
                  size="small"
                  color={
                    tarification.statut ===
                    StatutTarification.FIGEE
                      ? "success"
                      : "default"
                  }
                  label={
                    tarification.statut ===
                    StatutTarification.FIGEE
                      ? "Tarification figée"
                      : "Tarification calculée"
                  }
                />
              </Box>

              <Box
                sx={{
                  px: 2.5,
                }}
              >
                {tarification.lignes
                  .slice()
                  .sort(
                    (a, b) =>
                      a.ordre - b.ordre
                  )
                  .map((ligne) => (
                    <Box
                      key={ligne.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "minmax(0, 1fr) auto",
                        },
                        gap: 1,
                        py: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {ligne.libelle}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Quantité : {ligne.quantite} × {formatMontant(
                            ligne.montantUnitaire
                          )}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatMontant(
                          ligne.montant
                        )}
                      </Typography>
                    </Box>
                  ))}
              </Box>

              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Montant total
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: "primary.main",
                    fontWeight: 900,
                  }}
                >
                  {formatMontant(
                    tarification.montantTotal
                  )}
                </Typography>
              </Box>

              {tarification.referenceReglementaire && (
                <Box
                  sx={{
                    px: 2.5,
                    pb: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Référence réglementaire : {tarification.referenceReglementaire}
                  </Typography>
                </Box>
              )}
            </Paper>
          ) : (
            <Alert
              severity="warning"
              variant="outlined"
            >
              La tarification réglementaire de cette demande n’est pas disponible.
            </Alert>
          )}
        </>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Suivi administratif */}

      <SectionHeader
        icon={<AssignmentRoundedIcon />}
        title="Suivi administratif"
        subtitle="Informations relatives à la création et au suivi du dossier."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
          columnGap: 4,
          rowGap: 3,
        }}
      >
        <DetailItem
          label="Créée par"
          value={`${demande.utilisateur.prenom} ${demande.utilisateur.nom}`}
        />

        <DetailItem
          label="Identifiant de l’agent"
          value={
            demande.utilisateur.login ??
            "Non disponible"
          }
        />

        <DetailItem
          label="Date de création"
          value={formatDateTime(
            demande.createdAt
          )}
        />

        <DetailItem
          label="Dernière modification"
          value={formatDateTime(
            demande.updatedAt
          )}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Clôture journalière */}

      <SectionHeader
        icon={<LockClockRoundedIcon />}
        title="Clôture journalière"
        subtitle="Rattachement éventuel de la demande à un journal de clôture."
      />

      {demande.journalCloture ? (
        <Alert
          severity="success"
          variant="outlined"
          sx={{
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              sx={{
                mb: 1.5,
                fontWeight: 700,
              }}
            >
              Cette demande est rattachée à
              un journal de clôture.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                columnGap: 4,
                rowGap: 1,
              }}
            >
              <Typography variant="body2">
                Journal :{" "}
                <strong>
                  {
                    demande
                      .journalCloture
                      .numero
                  }
                </strong>
              </Typography>

              <Typography variant="body2">
                Journée clôturée :{" "}
                <strong>
                  {formatDate(
                    demande
                      .journalCloture
                      .dateJour
                  )}
                </strong>
              </Typography>

              <Typography variant="body2">
                Clôture effectuée le :{" "}
                <strong>
                  {formatDateTime(
                    demande
                      .journalCloture
                      .dateCloture
                  )}
                </strong>
              </Typography>

              <Typography variant="body2">
                Responsable :{" "}
                <strong>
                  {
                    demande
                      .journalCloture
                      .responsable.prenom
                  }{" "}
                  {
                    demande
                      .journalCloture
                      .responsable.nom
                  }
                </strong>
              </Typography>
            </Box>

            {canOpenJournal && (
              <Button
                component={Link}
                to={`/journaux-cloture/${demande.journalCloture.id}`}
                variant="outlined"
                size="small"
                endIcon={
                  <OpenInNewRoundedIcon />
                }
                sx={{
                  mt: 2.5,
                }}
              >
                Consulter le journal
              </Button>
            )}
          </Box>
        </Alert>
      ) : (
        <Alert
          severity="info"
          variant="outlined"
        >
          Cette demande n’est pas encore
          rattachée à un journal de clôture.
        </Alert>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Observations */}

      <SectionHeader
        icon={<NotesRoundedIcon />}
        title="Observations"
        subtitle="Informations complémentaires enregistrées lors de la création ou de la modification."
      />

      <Box
        sx={{
          p: 2.5,
          minHeight: 88,
          borderRadius: 2.5,
          bgcolor: "#F7FAF9",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.75,
            color: demande.observations
              ? "text.primary"
              : "text.secondary",
          }}
        >
          {demande.observations ||
            "Aucune observation n’a été enregistrée."}
        </Typography>
      </Box>

      {/* Motif du rejet */}

      {demande.motifRejet && (
        <>
          <Divider sx={{ my: 4 }} />

          <SectionHeader
            icon={
              <ErrorOutlineRoundedIcon />
            }
            title="Motif du rejet"
            subtitle="Justification enregistrée lors de la décision du responsable."
          />

          <Alert
            severity="error"
            variant="outlined"
          >
            <Typography
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                fontWeight: 600,
              }}
            >
              {demande.motifRejet}
            </Typography>
          </Alert>
        </>
      )}
    </Paper>
  );
}

export default DemandeDetails;