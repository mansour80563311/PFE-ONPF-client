import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import PageHeader from "../common/PageHeader";
import PaiementSection from "./PaiementSection";

import {
  useDemande,
} from "../../hooks/useDemande";

import {
  NatureDemande,
} from "../../types/demande";


function getNatureLabel(
  nature:
    | typeof NatureDemande.INSCRIPTION
    | typeof NatureDemande.PRESTATION
    | null
    | undefined
): string {
  switch (nature) {
    case NatureDemande.INSCRIPTION:
      return "Inscription foncière";

    case NatureDemande.PRESTATION:
      return "Prestation";

    default:
      return "Ancien modèle";
  }
}


function CaissierDemandeView() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const {
    demande,
    loading,
    errorMessage,
    reload,
  } = useDemande(
    id ?? ""
  );


  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderColor: "divider",
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }


  if (
    errorMessage ||
    !demande
  ) {
    return (
      <Alert
        severity="error"
      >
        {errorMessage ??
          "Demande introuvable."}
      </Alert>
    );
  }


  const isLegacy =
    demande.nature == null;

  const isInscription =
    demande.nature ===
    NatureDemande.INSCRIPTION;

  const isPrestation =
    demande.nature ===
    NatureDemande.PRESTATION;


  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      <PageHeader
        title={`Encaissement ${demande.numero}`}
        subtitle="Enregistrez le paiement en espèces effectué par le citoyen."
        icon={
          <PaymentsRoundedIcon />
        }
        breadcrumbs={[
          {
            label:
              "Demandes à encaisser",

            onClick: () =>
              navigate(
                "/demandes"
              ),
          },

          {
            label:
              demande.numero,
          },
        ]}
      />


      <Paper
        variant="outlined"
        sx={{
          mb: 3,

          p: {
            xs: 2.5,
            sm: 3,
          },

          borderColor:
            "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems:
              "flex-start",
            gap: 1.5,
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              borderRadius: 2.5,
              color:
                "primary.main",
              bgcolor:
                "rgba(10, 74, 70, 0.10)",
            }}
          >
            <PersonRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Identification du dossier
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Vérifiez l’identité du citoyen
              et les informations essentielles
              du dossier avant de procéder à
              l’encaissement.
            </Typography>
          </Box>
        </Box>


        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              sm:
                "repeat(2, minmax(0, 1fr))",

              lg:
                "repeat(3, minmax(0, 1fr))",
            },

            gap: 2.5,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Numéro de la demande
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 800,
                color:
                  "primary.main",
              }}
            >
              {demande.numero}
            </Typography>
          </Box>


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Demandeur
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
              }}
            >
              {
                demande.prenomDemandeur
              }{" "}
              {
                demande.nomDemandeur
              }
            </Typography>
          </Box>


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Numéro CIN
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
              }}
            >
              {demande.cin}
            </Typography>
          </Box>


          {isLegacy && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Référence foncière
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                }}
              >
                {
                  demande.referenceFonciere ||
                  "Non renseignée"
                }
              </Typography>
            </Box>
          )}


          {!isLegacy && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Nature
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                }}
              >
                {getNatureLabel(
                  demande.nature
                )}
              </Typography>
            </Box>
          )}


          {isPrestation && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Prestation
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                }}
              >
                {
                  demande
                    .prestation
                    ?.libelle ??
                  demande
                    .tarification
                    ?.prestationLibelle ??
                  "Non renseignée"
                }
              </Typography>
            </Box>
          )}


          {!isLegacy &&
            demande.titreFoncier && (
            <>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Numéro du titre foncier
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {
                    demande
                      .titreFoncier
                      .numero
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Gouvernorat
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {
                    demande
                      .titreFoncier
                      .gouvernorat
                      .nom
                  }
                </Typography>
              </Box>
            </>
          )}


          {isPrestation &&
            !demande.titreFoncier && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Titre foncier
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                }}
              >
                Non requis
              </Typography>
            </Box>
          )}


          {isInscription && (
            <Box
              sx={{
                gridColumn: {
                  xs: "auto",
                  sm: "1 / -1",
                },
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Opération(s) foncière(s)
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                }}
              >
                {demande
                  .operationsFoncieres
                  ?.length
                  ? demande
                      .operationsFoncieres
                      .map(
                        (
                          operation
                        ) =>
                          operation
                            .typeOperationFonciere
                            .libelle
                      )
                      .join(", ")
                  : "Non renseignée"}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>


      <PaiementSection
        demande={
          demande
        }
        onPaiementCreated={
          reload
        }
      />
    </Box>
  );
}


export default CaissierDemandeView;