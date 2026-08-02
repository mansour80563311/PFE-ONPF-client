import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import axios from "axios";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  toast,
} from "react-toastify";

import {
  StatutDemande,
} from "../../types/demande";

import type {
  Demande,
} from "../../types/demande";

import type {
  Paiement,
} from "../../types/paiement";

import {
  ROLES,
} from "../../utils/roles";

import {
  useAuth,
} from "../../hooks/useAuth";

import paiementService from "../../services/paiement.service";

import {
  paiementSchema,
} from "../../validations/paiement.schema";

import type {
  PaiementFormData,
} from "../../validations/paiement.schema";

interface Props {
  demande: Demande;

  /*
   * Fonction appelée après la création
   * réussie d’un paiement.
   */
  onPaiementCreated?:
    () =>
      | void
      | Promise<void>;

  /*
   * Informe la page parente de la présence
   * ou de l’absence d’un paiement.
   *
   * Cette information permettra notamment
   * d’activer ou de désactiver le bouton
   * de transmission au responsable.
   */
  onPaiementChange?: (
    paiement: Paiement | null
  ) => void;
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
      "Une erreur est survenue."
    );
  }

  return "Une erreur inattendue est survenue.";
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

function formatDateTime(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getLangueLabel(
  langue: string
): string {
  switch (langue) {
    case "FRANCAIS":
      return "Français";

    case "ARABE":
      return "Arabe";

    case "ANGLAIS":
      return "Anglais";

    default:
      return langue;
  }
}

function PaiementSection({
  demande,
  onPaiementCreated,
  onPaiementChange,
}: Props) {
  const {
    user,
  } = useAuth();

  const [
    paiement,
    setPaiement,
  ] =
    useState<Paiement | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] =
    useState<string | null>(
      null
    );

  const {
    register,
    handleSubmit,
    watch,
    reset,

    formState: {
      errors,
    },
  } =
    useForm<PaiementFormData>({
      resolver: zodResolver(
        paiementSchema
      ),

      mode: "onBlur",

      defaultValues: {
        montantRemis: "",
        observations: "",
      },
    });

  const montantRemis =
    watch("montantRemis") ??
    "";

  const montantExigible =
    useMemo(
      () =>
        Number(
          demande.montantTotal
        ),
      [
        demande
          .montantTotal,
      ]
    );

  const montantRemisNombre =
    useMemo(() => {
      const normalizedValue =
        montantRemis
          .trim()
          .replace(",", ".");

      const value =
        Number(
          normalizedValue
        );

      return Number.isFinite(
        value
      )
        ? value
        : 0;
    }, [montantRemis]);

  const monnaieRendue =
    Math.max(
      0,
      montantRemisNombre -
        montantExigible
    );

  const montantInsuffisant =
    montantRemisNombre > 0 &&
    montantRemisNombre <
      montantExigible;

  const isAdmin =
    user?.role ===
    ROLES.ADMIN;

  const isCaissier =
    user?.role ===
    ROLES.CAISSIER;

  const canCreatePaiement =
    (
      isAdmin ||
      isCaissier
    ) &&
    demande.statut ===
      StatutDemande.EN_ATTENTE &&
    !paiement;

  /*
   * Recherche le paiement associé
   * à la demande.
   */
  const loadPaiement =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          setLoadError(
            null
          );

          const result =
            await paiementService
              .getByDemandeId(
                demande.id
              );

          setPaiement(
            result
          );

          /*
           * Informe immédiatement la page
           * parente qu’un paiement existe.
           */
          onPaiementChange?.(
            result
          );
        } catch (error) {
          /*
           * L’absence de paiement est normale
           * pour une demande nouvellement créée.
           */
          if (
            axios.isAxiosError(
              error
            ) &&
            error.response
              ?.status === 404
          ) {
            setPaiement(
              null
            );

            /*
             * Informe la page parente que la
             * demande n’est pas encore payée.
             */
            onPaiementChange?.(
              null
            );

            return;
          }

          setLoadError(
            getErrorMessage(
              error
            )
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        demande.id,
        onPaiementChange,
      ]
    );

  useEffect(() => {
    void loadPaiement();
  }, [loadPaiement]);

  /*
   * Enregistre le paiement.
   */
  const onSubmit =
    async (
      data: PaiementFormData
    ) => {
      if (
        montantRemisNombre <
        montantExigible
      ) {
        toast.error(
          `Le montant remis doit être au moins égal à ${formatMontant(
            montantExigible
          )}.`
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        const result =
          await paiementService
            .createPaiement(
              demande.id,
              {
                montantRemis:
                  data
                    .montantRemis,

                observations:
                  data
                    .observations ||
                  undefined,
              }
            );

        setPaiement(
          result
        );

        /*
         * Informe immédiatement la page
         * parente que le paiement vient
         * d’être enregistré.
         */
        onPaiementChange?.(
          result
        );

        reset({
          montantRemis: "",
          observations: "",
        });

        await onPaiementCreated?.();

        toast.success(
          `Paiement enregistré. Reçu ${result.numeroRecu}.`
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error
          )
        );
      } finally {
        setSubmitting(
          false
        );
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
          paiement
            ? "success.light"
            : "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems:
            "flex-start",
          justifyContent:
            "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems:
              "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              flexShrink: 0,
              borderRadius: 2.5,

              color:
                paiement
                  ? "success.main"
                  : "primary.main",

              bgcolor:
                paiement
                  ? "rgba(46, 125, 50, 0.10)"
                  : "rgba(10, 74, 70, 0.10)",
            }}
          >
            {paiement ? (
              <ReceiptLongRoundedIcon />
            ) : (
              <PaymentsRoundedIcon />
            )}
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  700,
              }}
            >
              Paiement à la
              caisse
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Encaissement total
              de la demande en
              espèces.
            </Typography>
          </Box>
        </Box>

        {paiement && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems:
                "center",
            }}
          >
            <CheckCircleRoundedIcon
              color="success"
            />

            <Typography
              variant="body2"
              color="success.main"
              sx={{
                fontWeight:
                  700,
              }}
            >
              Paiement effectué
            </Typography>
          </Stack>
        )}
      </Box>

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "center",
            py: 4,
          }}
        >
          <CircularProgress
            size={28}
          />
        </Box>
      )}

      {!loading &&
        loadError && (
          <Alert
            severity="error"
          >
            {loadError}
          </Alert>
        )}

      {!loading &&
        !loadError &&
        paiement && (
          <>
            <Alert
              severity="success"
              icon={
                <ReceiptLongRoundedIcon />
              }
              sx={{
                mb: 3,
              }}
            >
              Le paiement a été
              enregistré avec
              succès. Le reçu est
              conservé dans le
              système.
            </Alert>

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns:
                  {
                    xs: "1fr",

                    sm: "repeat(2, minmax(0, 1fr))",

                    lg: "repeat(3, minmax(0, 1fr))",
                  },

                gap: 2.5,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Numéro du reçu
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {
                    paiement
                      .numeroRecu
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Montant exigible
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {formatMontant(
                    paiement
                      .montantExigible
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Montant remis
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {formatMontant(
                    paiement
                      .montantRemis
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Montant encaissé
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {formatMontant(
                    paiement
                      .montantEncaisse
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Monnaie rendue
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {formatMontant(
                    paiement
                      .monnaieRendue
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Mode de paiement
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  Espèces
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Date du paiement
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {formatDateTime(
                    paiement
                      .datePaiement
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Caissier
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {
                    paiement
                      .caissier
                      .prenom
                  }{" "}
                  {
                    paiement
                      .caissier
                      .nom
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Statut
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  Payé
                </Typography>
              </Box>
            </Box>

            {paiement
              .observations && (
              <>
                <Divider
                  sx={{
                    my: 3,
                  }}
                />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Observations
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    {
                      paiement
                        .observations
                    }
                  </Typography>
                </Box>
              </>
            )}
          </>
        )}

      {!loading &&
        !loadError &&
        !paiement && (
          <>
            <Alert
              severity="warning"
              sx={{
                mb: 3,
              }}
            >
              Cette demande n’a
              pas encore été
              payée. Elle ne peut
              pas être transmise
              au responsable.
            </Alert>

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns:
                  {
                    xs: "1fr",

                    sm: "repeat(2, minmax(0, 1fr))",
                  },

                gap: 2.5,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Nombre
                  d’exemplaires
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {
                    demande
                      .nombreExemplaires
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Langue
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {getLangueLabel(
                    demande
                      .langueCertificat
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Prix unitaire
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {formatMontant(
                    demande
                      .prixUnitaire
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Supplément de
                  traduction
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight:
                      700,
                  }}
                >
                  {formatMontant(
                    demande
                      .supplementTraduction
                  )}
                </Typography>
              </Box>
            </Box>

            <Alert
              severity="info"
              sx={{
                mt: 3,
              }}
            >
              <Typography
                variant="body2"
              >
                Montant total à
                encaisser
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 0.5,
                  fontWeight:
                    800,
                }}
              >
                {formatMontant(
                  demande
                    .montantTotal
                )}
              </Typography>
            </Alert>

            {canCreatePaiement ? (
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit(
                  onSubmit
                )}
                sx={{
                  mt: 3,
                }}
              >
                <TextField
                  required
                  fullWidth
                  label="Montant remis par le citoyen"
                  placeholder="Ex. 120,000"
                  disabled={
                    submitting
                  }
                  error={Boolean(
                    errors
                      .montantRemis
                  )}
                  helperText={
                    errors
                      .montantRemis
                      ?.message ??
                    "Saisissez le montant reçu en espèces."
                  }
                  slotProps={{
                    htmlInput: {
                      inputMode:
                        "decimal",
                    },
                  }}
                  {...register(
                    "montantRemis"
                  )}
                />

                {montantInsuffisant && (
                  <Alert
                    severity="error"
                    sx={{
                      mt: 2,
                    }}
                  >
                    Le montant
                    remis est
                    insuffisant. Il
                    manque{" "}
                    {formatMontant(
                      montantExigible -
                        montantRemisNombre
                    )}
                    .
                  </Alert>
                )}

                {montantRemisNombre >=
                  montantExigible &&
                  montantRemisNombre >
                    0 && (
                  <Alert
                    severity="success"
                    sx={{
                      mt: 2,
                    }}
                  >
                    Monnaie à
                    rendre :{" "}
                    <strong>
                      {formatMontant(
                        monnaieRendue
                      )}
                    </strong>
                  </Alert>
                )}

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Observations"
                  placeholder="Observation facultative concernant l’encaissement..."
                  disabled={
                    submitting
                  }
                  error={Boolean(
                    errors
                      .observations
                  )}
                  helperText={
                    errors
                      .observations
                      ?.message ??
                    "Champ facultatif."
                  }
                  sx={{
                    mt: 2.5,
                  }}
                  slotProps={{
                    htmlInput: {
                      maxLength:
                        500,
                    },
                  }}
                  {...register(
                    "observations"
                  )}
                />

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  sx={{
                    mt: 3,
                    justifyContent:
                      "flex-end",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      submitting ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      ) : (
                        <PaymentsRoundedIcon />
                      )
                    }
                    disabled={
                      submitting ||
                      montantRemisNombre <
                        montantExigible
                    }
                  >
                    {submitting
                      ? "Encaissement..."
                      : "Valider le paiement"}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Alert
                severity="info"
                sx={{
                  mt: 3,
                }}
              >
                Seul un caissier
                ou un
                administrateur
                peut enregistrer
                le paiement.
              </Alert>
            )}
          </>
        )}
    </Paper>
  );
}

export default PaiementSection;