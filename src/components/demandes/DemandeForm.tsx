import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";

import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  demandeSchema,
} from "../../validations/demande.schema";

import type {
  DemandeFormData,
} from "../../validations/demande.schema";

import {
  LangueCertificat,
} from "../../types/demande";

import type {
  Demande,
  LangueCertificat as LangueCertificatType,
} from "../../types/demande";

import type {
  IdentiteCni,
} from "../../types/cni";

import demandeService from "../../services/demande.service";
import cniService from "../../services/cni.service";

interface Props {
  demande?: Demande;
}

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}

/*
 * Tarification affichée dans le formulaire.
 *
 * Le backend recalcule toujours ces montants
 * avant d’enregistrer la demande.
 */
const PRIX_UNITAIRE_CERTIFICAT =
  30;

const SUPPLEMENT_TRADUCTION =
  40;

function getErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError(error)) {
    const responseData =
      error.response?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData?.errors?.[0]
        ?.message ??
      responseData?.message ??
      "Une erreur est survenue."
    );
  }

  return "Une erreur inattendue est survenue.";
}

function formatDateFr(
  value: string
): string {
  const [
    year,
    month,
    day,
  ] = value.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatMontant(
  value: number
): string {
  return `${value
    .toFixed(3)
    .replace(".", ",")} DT`;
}

function DemandeForm({
  demande,
}: Props) {
  const navigate =
    useNavigate();

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    verifyingCin,
    setVerifyingCin,
  ] = useState(false);

  const [
    identiteCni,
    setIdentiteCni,
  ] =
    useState<IdentiteCni | null>(
      null
    );

  const [
    cniError,
    setCniError,
  ] =
    useState<string | null>(
      null
    );

  const isEditMode =
    Boolean(demande);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,

    formState: {
      errors,
    },
  } =
    useForm<DemandeFormData>({
      resolver: zodResolver(
        demandeSchema
      ),

      mode: "onBlur",

      defaultValues: {
        nomDemandeur: "",
        prenomDemandeur: "",
        cin: "",
        telephone: "",
        email: "",

        nombreExemplaires: 1,

        langueCertificat:
          LangueCertificat.FRANCAIS,

        traductionDemandee:
          false,

        referenceFonciere: "",
        adresseBien: "",
        observations: "",
      },
    });

  const observations =
    watch("observations") ??
    "";

  const cin =
    watch("cin") ?? "";

  const nombreExemplaires =
    watch(
      "nombreExemplaires"
    ) ?? 1;

  const langueCertificat =
    watch(
      "langueCertificat"
    );

  const traductionDemandee =
    watch(
      "traductionDemandee"
    ) ?? false;

  /*
   * Protection de l’aperçu lorsque le champ
   * numérique est momentanément vide.
   */
  const nombreExemplairesValide =
    Number.isFinite(
      nombreExemplaires
    ) &&
    nombreExemplaires > 0
      ? nombreExemplaires
      : 0;

  const supplementTraduction =
    traductionDemandee
      ? SUPPLEMENT_TRADUCTION
      : 0;

  const montantTotalCalcule =
    nombreExemplairesValide *
      PRIX_UNITAIRE_CERTIFICAT +
    supplementTraduction;

  const dateNaissanceAffichee =
    identiteCni
      ?.dateNaissance ??
    demande
      ?.dateNaissanceDemandeur
      ?.slice(0, 10) ??
    "";

  const adresseOfficielleAffichee =
    identiteCni
      ?.adresse ??
    demande
      ?.adresseDemandeur ??
    "";

  useEffect(() => {
    if (!demande) {
      return;
    }

    reset({
      nomDemandeur:
        demande.nomDemandeur,

      prenomDemandeur:
        demande.prenomDemandeur,

      cin:
        demande.cin,

      telephone:
        demande.telephone,

      email:
        demande.email ?? "",

      nombreExemplaires:
        demande.nombreExemplaires,

      langueCertificat:
        demande.langueCertificat,

      traductionDemandee:
        demande.traductionDemandee,

      referenceFonciere:
        demande.referenceFonciere,

      adresseBien:
        demande.adresseBien,

      observations:
        demande.observations ??
        "",
    });
  }, [demande, reset]);

  const handleCinChange =
    () => {
      if (identiteCni) {
        setIdentiteCni(null);

        if (!demande) {
          setValue(
            "nomDemandeur",
            "",
            {
              shouldDirty:
                true,

              shouldValidate:
                false,
            }
          );

          setValue(
            "prenomDemandeur",
            "",
            {
              shouldDirty:
                true,

              shouldValidate:
                false,
            }
          );
        }
      }

      if (cniError) {
        setCniError(null);
      }
    };

  const handleVerifyCin =
    async () => {
      const isCinValid =
        await trigger("cin");

      if (!isCinValid) {
        return;
      }

      try {
        setVerifyingCin(
          true
        );

        setCniError(null);

        const identite =
          await cniService
            .verifierCni({
              cin: cin.trim(),
            });

        setIdentiteCni(
          identite
        );

        setValue(
          "nomDemandeur",
          identite.nom,
          {
            shouldDirty:
              true,

            shouldValidate:
              true,
          }
        );

        setValue(
          "prenomDemandeur",
          identite.prenom,
          {
            shouldDirty:
              true,

            shouldValidate:
              true,
          }
        );

        toast.success(
          "Identité vérifiée avec succès."
        );
      } catch (error) {
        const message =
          getErrorMessage(
            error
          );

        setIdentiteCni(
          null
        );

        setCniError(
          message
        );

        toast.error(
          message
        );
      } finally {
        setVerifyingCin(
          false
        );
      }
    };

  const onSubmit =
    async (
      data: DemandeFormData
    ) => {
      if (
        !demande &&
        !identiteCni
      ) {
        toast.error(
          "Veuillez vérifier le numéro CIN avant d’enregistrer la demande."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        if (demande) {
          await demandeService
            .updateDemande(
              demande.id,
              data
            );

          toast.success(
            "Demande modifiée avec succès."
          );
        } else {
          await demandeService
            .createDemande(
              data
            );

          toast.success(
            "Demande créée avec succès."
          );
        }

        navigate(
          "/demandes",
          {
            replace: true,
          }
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
      component="form"
      noValidate
      variant="outlined"
      onSubmit={handleSubmit(
        onSubmit
      )}
      sx={{
        width: "100%",

        p: {
          xs: 2.5,
          sm: 4,
        },

        borderColor:
          "divider",
      }}
    >
      <Alert
        severity="info"
        sx={{
          mb: 4,
        }}
      >
        Les champs marqués
        d’un astérisque sont
        obligatoires. Pour une
        nouvelle demande,
        vérifiez le numéro CIN
        avant d’enregistrer le
        dossier.
      </Alert>

      {/* Identité du demandeur */}

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
            Informations du
            demandeur
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Vérifiez l’identité
            du demandeur puis
            renseignez ses
            coordonnées.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns:
            {
              xs: "1fr",

              md: "repeat(2, minmax(0, 1fr))",
            },

          gap: 2.5,
        }}
      >
        {/* Vérification CIN */}

        <Box
          sx={{
            gridColumn: {
              xs: "auto",
              md: "1 / -1",
            },
          }}
        >
          <Box
            sx={{
              display: "grid",

              gridTemplateColumns:
                {
                  xs: "1fr",

                  sm: "minmax(0, 1fr) auto",
                },

              gap: 1.5,

              alignItems:
                "start",
            }}
          >
            <TextField
              required
              fullWidth
              autoFocus
              label="Numéro de la CIN"
              placeholder="Ex. 12345678"
              disabled={
                submitting ||
                verifyingCin
              }
              error={Boolean(
                errors.cin
              )}
              helperText={
                errors.cin
                  ?.message ??
                "Saisissez les 8 chiffres de la CIN."
              }
              slotProps={{
                htmlInput: {
                  inputMode:
                    "numeric",

                  maxLength: 8,
                },
              }}
              {...register(
                "cin",
                {
                  onChange:
                    handleCinChange,
                }
              )}
            />

            <Button
              type="button"
              variant="outlined"
              startIcon={
                verifyingCin ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <VerifiedUserRoundedIcon />
                )
              }
              disabled={
                submitting ||
                verifyingCin
              }
              onClick={() => {
                void handleVerifyCin();
              }}
              sx={{
                minHeight: 56,
                whiteSpace:
                  "nowrap",
              }}
            >
              {verifyingCin
                ? "Vérification..."
                : identiteCni
                  ? "Vérifier à nouveau"
                  : "Vérifier la CIN"}
            </Button>
          </Box>

          {cniError && (
            <Alert
              severity="error"
              sx={{
                mt: 1.5,
              }}
            >
              {cniError}
            </Alert>
          )}

          {identiteCni && (
            <Alert
              severity="success"
              icon={
                <VerifiedUserRoundedIcon />
              }
              sx={{
                mt: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight:
                    700,

                  mb: 0.5,
                }}
              >
                Identité
                confirmée par
                le service CNI
              </Typography>

              <Typography
                variant="body2"
              >
                Date de
                naissance :{" "}
                {formatDateFr(
                  identiteCni
                    .dateNaissance
                )}
              </Typography>

              <Typography
                variant="body2"
              >
                Adresse
                officielle :{" "}
                {
                  identiteCni
                    .adresse
                }
              </Typography>

              <Typography
                variant="body2"
              >
                Référence de
                vérification :{" "}
                {
                  identiteCni
                    .referenceVerification
                }
              </Typography>
            </Alert>
          )}
        </Box>

        <TextField
          required
          fullWidth
          label="Nom"
          placeholder="Ex. Mansour"
          autoComplete="family-name"
          disabled={
            submitting ||
            verifyingCin
          }
          error={Boolean(
            errors.nomDemandeur
          )}
          helperText={
            errors.nomDemandeur
              ?.message ??
            (identiteCni
              ? "Renseigné automatiquement par le service CNI."
              : undefined)
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            },

            htmlInput: {
              readOnly:
                Boolean(
                  identiteCni
                ),
            },
          }}
          {...register(
            "nomDemandeur"
          )}
        />

        <TextField
          required
          fullWidth
          label="Prénom"
          placeholder="Ex. Mohamed"
          autoComplete="given-name"
          disabled={
            submitting ||
            verifyingCin
          }
          error={Boolean(
            errors.prenomDemandeur
          )}
          helperText={
            errors.prenomDemandeur
              ?.message ??
            (identiteCni
              ? "Renseigné automatiquement par le service CNI."
              : undefined)
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            },

            htmlInput: {
              readOnly:
                Boolean(
                  identiteCni
                ),
            },
          }}
          {...register(
            "prenomDemandeur"
          )}
        />

        <TextField
          fullWidth
          type="date"
          label="Date de naissance"
          value={
            dateNaissanceAffichee
          }
          disabled={
            submitting ||
            verifyingCin
          }
          helperText={
            dateNaissanceAffichee
              ? "Renseignée automatiquement par le service CNI."
              : "Vérifiez le numéro CIN pour récupérer la date de naissance."
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            },

            htmlInput: {
              readOnly: true,
            },
          }}
        />

        <TextField
          fullWidth
          label="Adresse officielle"
          value={
            adresseOfficielleAffichee
          }
          placeholder="Adresse récupérée depuis le service CNI"
          disabled={
            submitting ||
            verifyingCin
          }
          helperText={
            adresseOfficielleAffichee
              ? "Renseignée automatiquement par le service CNI."
              : "Vérifiez le numéro CIN pour récupérer l’adresse officielle."
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            },

            htmlInput: {
              readOnly: true,
            },
          }}
        />

        <TextField
          required
          fullWidth
          label="Téléphone"
          placeholder="Ex. 20000000"
          autoComplete="tel"
          disabled={
            submitting ||
            verifyingCin
          }
          error={Boolean(
            errors.telephone
          )}
          helperText={
            errors.telephone
              ?.message
          }
          slotProps={{
            htmlInput: {
              inputMode:
                "numeric",

              maxLength: 8,
            },
          }}
          {...register(
            "telephone"
          )}
        />

        <TextField
          fullWidth
          type="email"
          label="Adresse e-mail"
          placeholder="Ex. nom@exemple.com"
          autoComplete="email"
          disabled={
            submitting ||
            verifyingCin
          }
          error={Boolean(
            errors.email
          )}
          helperText={
            errors.email
              ?.message ??
            "Champ facultatif."
          }
          sx={{
            gridColumn: {
              xs: "auto",
              md: "1 / -1",
            },
          }}
          {...register(
            "email"
          )}
        />
      </Box>

      <Divider
        sx={{
          my: 4,
        }}
      />

      {/* Informations foncières */}

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
          <HomeWorkRoundedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Informations
            foncières
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Identifiez le titre
            foncier et la
            localisation du bien
            concerné.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns:
            {
              xs: "1fr",

              md: "repeat(2, minmax(0, 1fr))",
            },

          gap: 2.5,
        }}
      >
        <TextField
          required
          fullWidth
          label="Référence foncière"
          placeholder="Ex. RF-2026-001"
          disabled={
            submitting ||
            verifyingCin
          }
          error={Boolean(
            errors.referenceFonciere
          )}
          helperText={
            errors.referenceFonciere
              ?.message
          }
          {...register(
            "referenceFonciere"
          )}
        />

        <TextField
          required
          fullWidth
          label="Adresse du bien"
          placeholder="Gouvernorat, ville, localité..."
          disabled={
            submitting ||
            verifyingCin
          }
          error={Boolean(
            errors.adresseBien
          )}
          helperText={
            errors.adresseBien
              ?.message
          }
          {...register(
            "adresseBien"
          )}
        />
      </Box>

      <Divider
        sx={{
          my: 4,
        }}
      />

      {/* Paramètres du certificat */}

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
          <RequestQuoteRoundedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Certificat et
            tarification
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Indiquez le nombre
            d’exemplaires et la
            langue souhaitée afin
            de calculer le montant
            à payer.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns:
            {
              xs: "1fr",

              md: "repeat(2, minmax(0, 1fr))",
            },

          gap: 2.5,
        }}
      >
        <TextField
          required
          fullWidth
          type="number"
          label="Nombre d’exemplaires"
          disabled={
            submitting ||
            verifyingCin
          }
          error={Boolean(
            errors.nombreExemplaires
          )}
          helperText={
            errors
              .nombreExemplaires
              ?.message ??
            "Entre 1 et 20 exemplaires."
          }
          slotProps={{
            htmlInput: {
              min: 1,
              max: 20,
              step: 1,
              inputMode:
                "numeric",
            },
          }}
          {...register(
            "nombreExemplaires",
            {
              valueAsNumber:
                true,
            }
          )}
        />

        <Controller
          name="langueCertificat"
          control={control}
          render={({
            field,
          }) => (
            <TextField
              {...field}
              required
              select
              fullWidth
              label="Langue du certificat"
              disabled={
                submitting ||
                verifyingCin
              }
              error={Boolean(
                errors
                  .langueCertificat
              )}
              helperText={
                errors
                  .langueCertificat
                  ?.message ??
                "Le français est la langue de base."
              }
              onChange={(
                event
              ) => {
                const value =
                  event.target
                    .value as
                    LangueCertificatType;

                field.onChange(
                  value
                );

                /*
                 * Le français ne nécessite
                 * jamais de traduction.
                 */
                if (
                  value ===
                  LangueCertificat.FRANCAIS
                ) {
                  setValue(
                    "traductionDemandee",
                    false,
                    {
                      shouldDirty:
                        true,

                      shouldValidate:
                        true,
                    }
                  );
                }
              }}
            >
              <MenuItem
                value={
                  LangueCertificat.FRANCAIS
                }
              >
                Français
              </MenuItem>

              <MenuItem
                value={
                  LangueCertificat.ARABE
                }
              >
                Arabe
              </MenuItem>

              <MenuItem
                value={
                  LangueCertificat.ANGLAIS
                }
              >
                Anglais
              </MenuItem>
            </TextField>
          )}
        />

        <Box
          sx={{
            gridColumn: {
              xs: "auto",
              md: "1 / -1",
            },
          }}
        >
          <Controller
            name="traductionDemandee"
            control={control}
            render={({
              field,
            }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      field.value
                    }
                    disabled={
                      submitting ||
                      verifyingCin ||
                      langueCertificat ===
                        LangueCertificat.FRANCAIS
                    }
                    onChange={(
                      _event,
                      checked
                    ) => {
                      field.onChange(
                        checked
                      );
                    }}
                  />
                }
                label="Traduction demandée (+40 DT)"
              />
            )}
          />

          {errors
            .traductionDemandee
            ?.message && (
            <Typography
              variant="caption"
              color="error"
              sx={{
                display: "block",
                mt: 0.5,
              }}
            >
              {
                errors
                  .traductionDemandee
                  .message
              }
            </Typography>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 0.5,
            }}
          >
            La traduction est
            obligatoire pour un
            certificat en arabe ou
            en anglais.
          </Typography>
        </Box>

        <Alert
          severity="info"
          sx={{
            gridColumn: {
              xs: "auto",
              md: "1 / -1",
            },

            alignItems:
              "flex-start",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            Aperçu du montant à
            payer
          </Typography>

          <Typography
            variant="body2"
          >
            Prix des certificats :{" "}
            {nombreExemplairesValide}{" "}
            ×{" "}
            {formatMontant(
              PRIX_UNITAIRE_CERTIFICAT
            )}{" "}
            ={" "}
            {formatMontant(
              nombreExemplairesValide *
                PRIX_UNITAIRE_CERTIFICAT
            )}
          </Typography>

          <Typography
            variant="body2"
          >
            Supplément de
            traduction :{" "}
            {formatMontant(
              supplementTraduction
            )}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 1,
              fontWeight: 800,
            }}
          >
            Montant total :{" "}
            {formatMontant(
              montantTotalCalcule
            )}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 1,
            }}
          >
            Ce calcul est présenté
            à titre indicatif. Le
            montant définitif est
            recalculé et sécurisé
            par le serveur.
          </Typography>
        </Alert>
      </Box>

      <Divider
        sx={{
          my: 4,
        }}
      />

      {/* Observations */}

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
          <NotesRoundedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Observations
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Ajoutez toute
            information utile au
            traitement du dossier.
          </Typography>
        </Box>
      </Box>

      <TextField
        fullWidth
        multiline
        minRows={4}
        label="Observations complémentaires"
        placeholder="Précisions particulières concernant la demande..."
        disabled={
          submitting ||
          verifyingCin
        }
        error={Boolean(
          errors.observations
        )}
        helperText={
          errors.observations
            ?.message ??
          `${observations.length}/500 caractères`
        }
        slotProps={{
          htmlInput: {
            maxLength: 500,
          },
        }}
        {...register(
          "observations"
        )}
      />

      <Divider
        sx={{
          my: 4,
        }}
      />

      {/* Actions */}

      <Stack
        direction={{
          xs: "column-reverse",
          sm: "row",
        }}
        spacing={1.5}
        sx={{
          justifyContent:
            "flex-end",

          "& > button": {
            width: {
              xs: "100%",
              sm: "auto",
            },
          },
        }}
      >
        <Button
          type="button"
          variant="outlined"
          startIcon={
            <CloseRoundedIcon />
          }
          disabled={
            submitting ||
            verifyingCin
          }
          onClick={() =>
            navigate(
              "/demandes"
            )
          }
        >
          Annuler
        </Button>

        <Button
          type="submit"
          variant="contained"
          startIcon={
            submitting ? (
              <CircularProgress
                size={19}
                color="inherit"
              />
            ) : (
              <SaveRoundedIcon />
            )
          }
          disabled={
            submitting ||
            verifyingCin
          }
        >
          {submitting
            ? isEditMode
              ? "Modification..."
              : "Enregistrement..."
            : isEditMode
              ? "Enregistrer les modifications"
              : "Enregistrer la demande"}
        </Button>
      </Stack>
    </Paper>
  );
}

export default DemandeForm;