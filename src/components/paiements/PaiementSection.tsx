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
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

import axios from "axios";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useForm,
  useWatch,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  toast,
} from "react-toastify";

import {
  NatureDemande,
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
import recuPaiementService from "../../services/recu-paiement.service";

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

  /*
   * Le service du reçu transforme les
   * erreurs Blob en instances Error.
   */
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
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

  /*
   * Indique que le PDF est en cours
   * de récupération depuis le backend.
   */
  const [
    openingReceipt,
    setOpeningReceipt,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] =
    useState<string | null>(
      null
    );

  const {
    control,
    register,
    handleSubmit,
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
    useWatch({
      control,
      name: "montantRemis",
    }) ?? "";

  const montantTarifaire =
    demande.nature != null &&
    demande.tarification
      ? demande.tarification
          .montantTotal
      : demande.montantTotal;

  const montantExigible =
    useMemo(
      () =>
        Number(
          montantTarifaire
        ),
      [
        montantTarifaire,
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
   * Seul le Caissier ou l’Administrateur
   * peut accéder à la route sécurisée
   * du reçu PDF.
   */
  const canPrintReceipt =
    Boolean(
      paiement
    ) &&
    (
      isAdmin ||
      isCaissier
    );

  /*
   * Recherche le paiement associé
   * à la demande.
   *
   * Les mises à jour d’état sont effectuées
   * uniquement après la résolution de la requête
   * asynchrone. Cela évite les setState synchrones
   * directement déclenchés par l’effet.
   */
  useEffect(() => {
    let active = true;

    const chargerPaiement =
      async () => {
        try {
          const result =
            await paiementService
              .getByDemandeId(
                demande.id
              );

          if (!active) {
            return;
          }

          setPaiement(
            result
          );

          setLoadError(
            null
          );

          setLoading(
            false
          );

          onPaiementChange?.(
            result
          );
        } catch (error) {
          if (!active) {
            return;
          }

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

            setLoadError(
              null
            );

            setLoading(
              false
            );

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

          setLoading(
            false
          );
        }
      };

    void chargerPaiement();

    return () => {
      active = false;
    };
  }, [
    demande.id,
    onPaiementChange,
  ]);

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

  /*
   * Ouvre le reçu PDF dans un nouvel onglet.
   *
   * L’utilisateur pourra ensuite utiliser
   * le bouton d’impression du lecteur PDF
   * du navigateur.
   */
  const handleOpenReceipt =
    async () => {
      if (!paiement) {
        return;
      }

      try {
        setOpeningReceipt(
          true
        );

        await recuPaiementService
          .openRecu(
            paiement.id,
            paiement.numeroRecu
          );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error
          )
        );
      } finally {
        setOpeningReceipt(
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
              Paiement à la caisse
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Encaissement total de la
              demande en espèces.
            </Typography>
          </Box>
        </Box>

        {paiement && (
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            sx={{
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
            }}
          >
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

            {canPrintReceipt && (
              <Button
                type="button"
                variant="outlined"
                startIcon={
                  openingReceipt ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <PrintRoundedIcon />
                  )
                }
                disabled={
                  openingReceipt
                }
                onClick={() => {
                  void handleOpenReceipt();
                }}
              >
                {openingReceipt
                  ? "Ouverture..."
                  : "Imprimer le reçu"}
              </Button>
            )}
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
              Le paiement a été enregistré
              avec succès. Le reçu est
              conservé dans le système.
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
              Cette demande n’a pas encore
              été payée. Elle ne peut pas
              être transmise au responsable.
            </Alert>

            {demande.nature == null ? (
              <>
                <Alert
                  severity="info"
                  variant="outlined"
                  sx={{
                    mb: 3,
                  }}
                >
                  Cette demande utilise
                  l’ancien modèle tarifaire.
                  Les informations historiques
                  sont conservées pour assurer
                  la compatibilité.
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
                      Nombre d’exemplaires
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
                      Supplément de traduction
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
              </>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    flexWrap:
                      "wrap",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight:
                          800,
                      }}
                    >
                      Tarification réglementaire
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Montant calculé et enregistré
                      par le serveur.
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight:
                        700,
                      color:
                        "primary.main",
                    }}
                  >
                    {demande.nature ===
                    NatureDemande.INSCRIPTION
                      ? "Inscription foncière"
                      : "Prestation"}
                  </Typography>
                </Box>

                {demande.tarification ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      overflow:
                        "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        px: 2.5,
                      }}
                    >
                      {demande
                        .tarification
                        .lignes
                        .slice()
                        .sort(
                          (
                            a,
                            b
                          ) =>
                            a.ordre -
                            b.ordre
                        )
                        .map(
                          (
                            ligne
                          ) => (
                            <Box
                              key={
                                ligne.id
                              }
                              sx={{
                                display:
                                  "grid",

                                gridTemplateColumns:
                                  {
                                    xs:
                                      "1fr",

                                    sm:
                                      "minmax(0, 1fr) auto",
                                  },

                                gap:
                                  1,

                                py:
                                  1.5,

                                borderBottom:
                                  "1px solid",

                                borderColor:
                                  "divider",
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  {
                                    ligne
                                      .libelle
                                  }
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Quantité :{" "}
                                  {
                                    ligne
                                      .quantite
                                  }
                                  {" × "}
                                  {formatMontant(
                                    ligne
                                      .montantUnitaire
                                  )}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    800,

                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {formatMontant(
                                  ligne
                                    .montant
                                )}
                              </Typography>
                            </Box>
                          )
                        )}
                    </Box>

                    {demande
                      .tarification
                      .referenceReglementaire && (
                      <Box
                        sx={{
                          px:
                            2.5,

                          pt:
                            1.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Référence réglementaire :{" "}
                          {
                            demande
                              .tarification
                              .referenceReglementaire
                          }
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        px: 2.5,
                        py: 2,
                        mt: 1.5,
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: 2,
                        bgcolor:
                          "action.hover",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight:
                            800,
                        }}
                      >
                        Montant total à encaisser
                      </Typography>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight:
                            900,
                          color:
                            "primary.main",
                        }}
                      >
                        {formatMontant(
                          demande
                            .tarification
                            .montantTotal
                        )}
                      </Typography>
                    </Box>
                  </Paper>
                ) : (
                  <Alert
                    severity="error"
                  >
                    La tarification réglementaire
                    de cette demande est
                    indisponible. Le paiement ne
                    doit pas être enregistré avant
                    vérification.
                  </Alert>
                )}
              </>
            )}

            {demande.nature == null && (
              <Alert
                severity="info"
                sx={{
                  mt: 3,
                }}
              >
                <Typography
                  variant="body2"
                >
                  Montant total à encaisser
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
                    montantExigible
                  )}
                </Typography>
              </Alert>
            )}

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
                    Le montant remis est
                    insuffisant. Il manque{" "}
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
                    Monnaie à rendre :{" "}
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
                      montantExigible <= 0 ||
                      (
                        demande.nature != null &&
                        !demande.tarification
                      ) ||
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
                Seul un caissier ou un
                administrateur peut
                enregistrer le paiement.
              </Alert>
            )}
          </>
        )}
    </Paper>
  );
}

export default PaiementSection;