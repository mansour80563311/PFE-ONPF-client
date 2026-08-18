import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import PriceCheckRoundedIcon from "@mui/icons-material/PriceCheckRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";

import axios from "axios";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  toast,
} from "react-toastify";

import paiementComplementaireService from "../../services/paiement-complementaire.service";
import recuPaiementComplementaireService from "../../services/recu-paiement-complementaire.service";
import referentielService from "../../services/referentiel.service";
import responsableDemandeService from "../../services/responsable-demande.service";

import {
  NatureDemande,
} from "../../types/demande";

import type {
  Demande,
  Gouvernorat,
  TypeOperationFonciere,
} from "../../types/demande";

import type {
  EtatPaiementComplementaireData,
} from "../../types/paiement-complementaire";

import {
  StatutRevisionDemande,
} from "../../types/responsable-demande";

interface Props {
  demande: Demande;

  onCorrectionApplied?:
    () => Promise<void> | void;
}

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}

function getErrorMessage(
  error: unknown
): string {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const responseData =
      error.response
        ?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData
        ?.errors?.[0]
        ?.message ??
      responseData
        ?.message ??
      "Une erreur est survenue pendant le contrôle du dossier."
    );
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "Une erreur inattendue est survenue pendant le contrôle du dossier.";
}

function formatAmount(
  value?: string | null
): string {
  if (!value) {
    return "0,000 DT";
  }

  const amount =
    Number(value);

  if (
    Number.isNaN(
      amount
    )
  ) {
    return `${value} DT`;
  }

  return `${amount.toLocaleString(
    "fr-FR",
    {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }
  )} DT`;
}

function getRevisionStatusLabel(
  statut: string
): string {
  switch (statut) {
    case StatutRevisionDemande.SANS_COMPLEMENT:
      return "Sans complément";

    case StatutRevisionDemande.COMPLEMENT_A_PAYER:
      return "Complément à payer";

    case StatutRevisionDemande.COMPLEMENT_PAYE:
      return "Complément payé";

    default:
      return statut;
  }
}

function ResponsableControleSection({
  demande,
  onCorrectionApplied,
}: Props) {
  const currentTitre =
    demande.titreFoncier
      ?.numero ?? "";

  const currentGouvernoratId =
    demande.titreFoncier
      ?.gouvernoratId ?? "";

  const currentOperationIds =
    useMemo(
      () =>
        (
          demande.operationsFoncieres ??
          []
        ).map(
          (operation) =>
            operation
              .typeOperationFonciereId
        ),
      [
        demande.operationsFoncieres,
      ]
    );

  const [
    numeroTitreFoncier,
    setNumeroTitreFoncier,
  ] = useState(
    currentTitre
  );

  const [
    gouvernoratId,
    setGouvernoratId,
  ] = useState(
    currentGouvernoratId
  );

  const [
    operationFonciereIds,
    setOperationFonciereIds,
  ] = useState<string[]>(
    currentOperationIds
  );

  const [
    motif,
    setMotif,
  ] = useState("");

  const [
    gouvernorats,
    setGouvernorats,
  ] = useState<Gouvernorat[]>(
    []
  );

  const [
    operations,
    setOperations,
  ] = useState<
    TypeOperationFonciere[]
  >([]);

  const [
    etatRegularisation,
    setEtatRegularisation,
  ] =
    useState<EtatPaiementComplementaireData | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingError,
    setLoadingError,
  ] = useState<string | null>(
    null
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    openingRecu,
    setOpeningRecu,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchControleData =
      async () => {
        await Promise.resolve();

        if (cancelled) {
          return;
        }

        try {
          setLoading(true);
          setLoadingError(null);

          const [
            gouvernoratsData,
            operationsData,
            regularisationData,
          ] = await Promise.all([
            referentielService
              .getGouvernorats(),

            referentielService
              .getOperationsFoncieres(),

            paiementComplementaireService
              .getEtatByDemandeId(
                demande.id
              ),
          ]);

          if (cancelled) {
            return;
          }

          setGouvernorats(
            gouvernoratsData
          );

          setOperations(
            operationsData
          );

          setEtatRegularisation(
            regularisationData
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          setLoadingError(
            getErrorMessage(
              error
            )
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void fetchControleData();

    return () => {
      cancelled = true;
    };
  }, [demande.id]);

  if (
    demande.nature !==
    NatureDemande.INSCRIPTION
  ) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2.5,
            sm: 3,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            mb: 2,
          }}
        >
          <RuleRoundedIcon
            color="primary"
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Contrôle du Responsable Guichet
          </Typography>
        </Stack>

        <Alert severity="info">
          La correction métier intégrée dans
          cette étape concerne les demandes
          d’inscription foncière. Cette
          prestation reste consultable sans
          modification depuis ce module.
        </Alert>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
          }}
        >
          <CircularProgress
            size={22}
          />

          <Typography>
            Chargement du contrôle
            Responsable...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const regularisation =
    etatRegularisation
      ?.regularisation ??
    null;

  const revision =
    etatRegularisation
      ?.revision ??
    null;

  const paiementComplementaire =
    etatRegularisation
      ?.paiement ??
    null;

  const complementPending =
    regularisation?.statut ===
    StatutRevisionDemande
      .COMPLEMENT_A_PAYER;

  const normalizedCurrentOperations =
    [...currentOperationIds]
      .sort()
      .join("|");

  const normalizedSelectedOperations =
    [...operationFonciereIds]
      .sort()
      .join("|");

  const titleChanged =
    numeroTitreFoncier
      .trim() !==
    currentTitre.trim();

  const gouvernoratChanged =
    gouvernoratId !==
    currentGouvernoratId;

  const operationsChanged =
    normalizedSelectedOperations !==
    normalizedCurrentOperations;

  const hasChanges =
    titleChanged ||
    gouvernoratChanged ||
    operationsChanged;

  const formValid =
    numeroTitreFoncier
      .trim()
      .length > 0 &&
    gouvernoratId.length > 0 &&
    operationFonciereIds.length > 0;

  const canSubmit =
    formValid &&
    hasChanges &&
    !complementPending &&
    !saving;

  const toggleOperation = (
    operationId: string
  ) => {
    setOperationFonciereIds(
      (current) =>
        current.includes(
          operationId
        )
          ? current.filter(
              (id) =>
                id !==
                operationId
            )
          : [
              ...current,
              operationId,
            ]
    );
  };

  const reloadRegularisation =
    async () => {
      const data =
        await paiementComplementaireService
          .getEtatByDemandeId(
            demande.id
          );

      setEtatRegularisation(
        data
      );
    };

  const handleCorrection =
    async () => {
      if (!canSubmit) {
        return;
      }

      try {
        setSaving(true);

        const result =
          await responsableDemandeService
            .corrigerInscription(
              demande.id,
              {
                ...(titleChanged && {
                  numeroTitreFoncier:
                    numeroTitreFoncier
                      .trim(),
                }),

                ...(gouvernoratChanged && {
                  gouvernoratId,
                }),

                ...(operationsChanged && {
                  operationFonciereIds,
                }),

                ...(motif
                  .trim()
                  .length > 0 && {
                  motif:
                    motif.trim(),
                }),
              }
            );

        setNumeroTitreFoncier(
          result.demande
            .titreFoncier
            ?.numero ??
            numeroTitreFoncier
        );

        setGouvernoratId(
          result.demande
            .titreFoncier
            ?.gouvernoratId ??
            gouvernoratId
        );

        setOperationFonciereIds(
          (
            result.demande
              .operationsFoncieres ??
            []
          ).map(
            (operation) =>
              operation
                .typeOperationFonciereId
          )
        );

        setMotif("");

        await Promise.all([
          reloadRegularisation(),
          onCorrectionApplied?.(),
        ]);

        toast.success(
          result
            .resumeTarification
            .complementRequis
            ? `Correction enregistrée. Complément à payer : ${formatAmount(
                result
                  .resumeTarification
                  .complementDu
              )}.`
            : "Correction enregistrée sans complément de paiement."
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error
          )
        );
      } finally {
        setSaving(false);
      }
    };

  const handleOpenRecu =
    async () => {
      if (!paiementComplementaire) {
        return;
      }

      try {
        setOpeningRecu(true);

        await recuPaiementComplementaireService
          .openRecu(
            demande.id,
            paiementComplementaire
              .numeroRecu
          );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error
          )
        );
      } finally {
        setOpeningRecu(false);
      }
    };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2.5,
          sm: 3,
        },

        borderColor:
          complementPending
            ? "warning.light"
            : "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent:
            "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,

              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",

              borderRadius: 2.5,

              bgcolor:
                "rgba(10, 74, 70, 0.08)",

              color:
                "primary.main",
            }}
          >
            <RuleRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Contrôle du Responsable
              Guichet
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Vérifiez et, si nécessaire,
              corrigez le titre foncier, le
              gouvernorat et les opérations
              déclarées.
            </Typography>
          </Box>
        </Stack>

        {regularisation && (
          <Chip
            icon={
              regularisation.statut ===
              StatutRevisionDemande
                .COMPLEMENT_PAYE
                ? (
                    <PriceCheckRoundedIcon />
                  )
                : undefined
            }
            label={getRevisionStatusLabel(
              regularisation.statut
            )}
            color={
              regularisation.statut ===
              StatutRevisionDemande
                .COMPLEMENT_A_PAYER
                ? "warning"
                : "success"
            }
            variant="outlined"
          />
        )}
      </Box>

      {loadingError && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {loadingError}
        </Alert>
      )}

      {complementPending && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
          }}
        >
          Un complément de paiement est
          actuellement en attente. Une
          nouvelle correction tarifaire est
          bloquée jusqu’à sa régularisation
          par la caisse.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            md:
              "repeat(2, minmax(0, 1fr))",
          },

          gap: 2.5,
        }}
      >
        <TextField
          fullWidth
          required
          label="Numéro du titre foncier"
          value={
            numeroTitreFoncier
          }
          disabled={
            saving ||
            complementPending
          }
          onChange={(event) =>
            setNumeroTitreFoncier(
              event.target.value
            )
          }
        />

        <TextField
          select
          fullWidth
          required
          label="Gouvernorat"
          value={
            gouvernoratId
          }
          disabled={
            saving ||
            complementPending
          }
          onChange={(event) =>
            setGouvernoratId(
              event.target.value
            )
          }
        >
          {gouvernorats.map(
            (gouvernorat) => (
              <MenuItem
                key={
                  gouvernorat.id
                }
                value={
                  gouvernorat.id
                }
              >
                {gouvernorat.nom}
              </MenuItem>
            )
          )}
        </TextField>
      </Box>

      <Box
        sx={{
          mt: 3,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 1.25,
          }}
        >
          Opérations foncières
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,

            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              sm:
                "repeat(2, minmax(0, 1fr))",

              lg:
                "repeat(3, minmax(0, 1fr))",
            },

            gap: 0.5,
          }}
        >
          {operations.map(
            (operation) => (
              <FormControlLabel
                key={
                  operation.id
                }
                control={
                  <Checkbox
                    checked={
                      operationFonciereIds
                        .includes(
                          operation.id
                        )
                    }
                    disabled={
                      saving ||
                      complementPending
                    }
                    onChange={() =>
                      toggleOperation(
                        operation.id
                      )
                    }
                  />
                }
                label={
                  operation.libelle
                }
              />
            )
          )}
        </Paper>

        {operationFonciereIds.length ===
          0 && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              display: "block",
              mt: 0.75,
            }}
          >
            Sélectionnez au moins une
            opération foncière.
          </Typography>
        )}
      </Box>

      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Motif de la correction"
        placeholder="Ex. : opération manquante constatée pendant le contrôle du dossier..."
        value={motif}
        disabled={
          saving ||
          complementPending
        }
        onChange={(event) =>
          setMotif(
            event.target.value
          )
        }
        slotProps={{
          htmlInput: {
            maxLength: 500,
          },
        }}
        helperText={`${motif.length}/500 caractères`}
        sx={{
          mt: 3,
        }}
      />

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
        sx={{
          mt: 3,

          alignItems: {
            xs: "stretch",
            sm: "center",
          },
        }}
      >
        <Button
          variant="contained"
          startIcon={
            saving ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <EditNoteRoundedIcon />
            )
          }
          disabled={
            !canSubmit
          }
          onClick={() => {
            void handleCorrection();
          }}
        >
          {saving
            ? "Enregistrement..."
            : "Enregistrer la correction"}
        </Button>

        {!hasChanges &&
          !complementPending && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Modifiez au moins une
            information métier pour
            enregistrer une révision.
          </Typography>
        )}
      </Stack>

      <Box
        sx={{
          mt: 4,
          pt: 3,

          borderTop:
            "1px solid",

          borderColor:
            "divider",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            mb: 2,
          }}
        >
          Régularisation tarifaire
        </Typography>

        {!regularisation ? (
          <Alert severity="info">
            Aucune correction Responsable
            n’a encore modifié la situation
            tarifaire de cette demande.
          </Alert>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",

                  sm:
                    "repeat(2, minmax(0, 1fr))",

                  lg:
                    "repeat(4, minmax(0, 1fr))",
                },

                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Révision
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  N°{" "}
                  {
                    regularisation
                      .numeroRevision
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Montant avant
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {formatAmount(
                    regularisation
                      .montantAvant
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Montant après correction
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {formatAmount(
                    regularisation
                      .montantApres
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Complément
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 800,

                    color:
                      complementPending
                        ? "warning.main"
                        : "text.primary",
                  }}
                >
                  {formatAmount(
                    regularisation
                      .complementDu
                  )}
                </Typography>
              </Box>
            </Box>

            {revision?.motif && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 2,
                }}
              >
                <strong>
                  Motif de la dernière
                  correction :
                </strong>{" "}
                {revision.motif}
              </Typography>
            )}

            {paiementComplementaire && (
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
                sx={{
                  mt: 2.5,

                  alignItems: {
                    xs: "stretch",
                    sm: "center",
                  },
                }}
              >
                <Alert
                  severity="success"
                  sx={{
                    flex: 1,
                  }}
                >
                  Complément encaissé sous
                  le reçu{" "}
                  {
                    paiementComplementaire
                      .numeroRecu
                  }{" "}
                  pour{" "}
                  {formatAmount(
                    paiementComplementaire
                      .montantEncaisse
                  )}
                  .
                </Alert>

                <Button
                  variant="outlined"
                  startIcon={
                    openingRecu ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <ReceiptLongRoundedIcon />
                    )
                  }
                  disabled={
                    openingRecu
                  }
                  onClick={() => {
                    void handleOpenRecu();
                  }}
                >
                  {openingRecu
                    ? "Ouverture..."
                    : "Voir le reçu complémentaire"}
                </Button>
              </Stack>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
export default ResponsableControleSection;