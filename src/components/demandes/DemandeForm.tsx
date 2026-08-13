import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  MenuItem,
  Paper,
  Stack,
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
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

import axios from "axios";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Controller,
  useForm,
  useWatch,
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
  NatureDemande,
} from "../../types/demande";

import type {
  CreateDemandeRequest,
  Demande,
  Gouvernorat,
  Prestation,
  TarificationDemande,
  TypeOperationFonciere,
  UpdateDemandeRequest,
} from "../../types/demande";

import type {
  IdentiteCni,
} from "../../types/cni";

import type {
  CalculTarification,
  CalculTarificationRequest,
} from "../../services/tarification.service";

import demandeService from "../../services/demande.service";
import cniService from "../../services/cni.service";
import referentielService from "../../services/referentiel.service";
import tarificationService from "../../services/tarification.service";


interface Props {
  demande?: Demande;
}


interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}


/**
 * ============================================================
 * ANCIENNE TARIFICATION
 * ============================================================
 *
 * Ces constantes sont uniquement conservées pour l'affichage
 * des anciennes demandes dont nature = null.
 *
 * Elles ne sont JAMAIS utilisées pour les nouvelles demandes.
 */
const LEGACY_PRIX_UNITAIRE_CERTIFICAT =
  30;

const LEGACY_SUPPLEMENT_TRADUCTION =
  40;

const EMPTY_OPERATION_IDS:
  string[] = [];


/**
 * ============================================================
 * OUTILS
 * ============================================================
 */

function getErrorMessage(
  error: unknown
): string {
  if (
    axios.isAxiosError(error)
  ) {
    const responseData =
      error.response?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData
        ?.errors?.[0]
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
  value:
    | string
    | number
): string {
  const montant =
    Number(value);

  if (
    !Number.isFinite(montant)
  ) {
    return "0,000 DT";
  }

  return `${montant
    .toFixed(3)
    .replace(".", ",")} DT`;
}


function DemandeForm({
  demande,
}: Props) {
  const navigate =
    useNavigate();


  /**
   * ==========================================================
   * ETATS GENERAUX
   * ==========================================================
   */

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    verifyingCin,
    setVerifyingCin,
  ] =
    useState(false);

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


  /**
   * ==========================================================
   * REFERENTIELS
   * ==========================================================
   */


  const [
    gouvernorats,
    setGouvernorats,
  ] =
    useState<Gouvernorat[]>(
      []
    );

  const [
    operationsFoncieres,
    setOperationsFoncieres,
  ] =
    useState<
      TypeOperationFonciere[]
    >(
      []
    );

  const [
    prestations,
    setPrestations,
  ] =
    useState<Prestation[]>(
      []
    );

  const [
    loadingReferentiels,
    setLoadingReferentiels,
  ] =
    useState(true);

  const [
    referentielError,
    setReferentielError,
  ] =
    useState<string | null>(
      null
    );


  /**
   * ==========================================================
   * TARIFICATION
   * ==========================================================
   */

  const [
    tarification,
    setTarification,
  ] =
    useState<
      CalculTarification | null
    >(
      null
    );

  const [
    tarificationError,
    setTarificationError,
  ] =
    useState<string | null>(
      null
    );

  const [
    tarificationResultKey,
    setTarificationResultKey,
  ] =
    useState<string | null>(
      null
    );


  /**
   * ==========================================================
   * MODE
   * ==========================================================
   */

  const isEditMode =
    Boolean(demande);

  const isLegacy =
    Boolean(
      demande &&
      demande.nature === null
    );

  const demandeVerrouillee =
    Boolean(
      demande?.paiement
    );


  /**
   * ==========================================================
   * REACT HOOK FORM
   * ==========================================================
   */

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,

    formState: {
      errors,
    },
  } =
    useForm<DemandeFormData>({
      resolver:
        zodResolver(
          demandeSchema
        ),

      mode: "onBlur",

      defaultValues: {
        nomDemandeur: "",
        prenomDemandeur: "",
        cin: "",
        telephone: "",
        email: "",

        nature:
          NatureDemande.INSCRIPTION,

        gouvernoratId: "",

        numeroTitreFoncier:
          "",

        operationFonciereIds:
          [],

        prestationId: "",

        nombrePages:
          undefined,

        langue:
          LangueCertificat.ARABE,

        prestationNecessiteTitreFoncier:
          false,

        prestationTarificationParPage:
          false,

        adresseBien: "",

        /**
         * Ancien modèle.
         */
        referenceFonciere: "",

        nombreExemplaires:
          1,

        langueCertificat:
          LangueCertificat.FRANCAIS,

        traductionDemandee:
          false,

        observations: "",
      },
    });


    /**
     * ==========================================================
     * VALEURS SURVEILLEES
     * ==========================================================
     *
     * useWatch est utilisé à la place de watch() afin
     * d'éviter les avertissements du React Compiler et
     * de limiter les re-rendus inutiles.
     */

  const observations =
    useWatch({
      control,
      name: "observations",
    }) ?? "";

  const cin =
    useWatch({
      control,
      name: "cin",
    }) ?? "";

  const nature =
    useWatch({
      control,
      name: "nature",
      defaultValue:
        NatureDemande.INSCRIPTION,
    });

  const operationFonciereIds =
    useWatch({
      control,
      name: "operationFonciereIds",
    }) ??
    EMPTY_OPERATION_IDS;

  const prestationId =
    useWatch({
      control,
      name: "prestationId",
    }) ?? "";

  const nombrePages =
    useWatch({
      control,
      name: "nombrePages",
    });

  const langue =
    useWatch({
      control,
      name: "langue",
    }) ??
    LangueCertificat.ARABE;

  const nombreExemplaires =
    useWatch({
      control,
      name: "nombreExemplaires",
    }) ?? 1;

  const traductionDemandee =
    useWatch({
      control,
      name: "traductionDemandee",
    }) ?? false;

  /**
   * ==========================================================
   * PRESTATION SELECTIONNEE
   * ==========================================================
   */

  const prestationSelectionnee =
    useMemo(
      () => {
        if (
          !prestationId
        ) {
          return null;
        }

        return (
          prestations.find(
            (item) =>
              item.id ===
              prestationId
          ) ??
          (
            demande
              ?.prestation
              ?.id ===
            prestationId
              ? demande.prestation
              : null
          )
        );
      },
      [
        prestationId,
        prestations,
        demande,
      ]
    );


  const afficherTitrePrestation =
    Boolean(
      prestationSelectionnee
        ?.necessiteTitreFoncier
    ) ||
    Boolean(
      isEditMode &&
      demande?.titreFoncier
    );


  /**
   * ==========================================================
   * INFORMATIONS CNI A AFFICHER
   * ==========================================================
   */

  const dateNaissanceAffichee =
    identiteCni
      ?.dateNaissance ??
    demande
      ?.dateNaissanceDemandeur
      ?.slice(
        0,
        10
      ) ??
    "";

  const adresseOfficielleAffichee =
    identiteCni
      ?.adresse ??
    demande
      ?.adresseDemandeur ??
    "";


  /**
   * ==========================================================
   * CHARGEMENT DES REFERENTIELS
   * ==========================================================
   */

  useEffect(
    () => {
      /**
       * Une ancienne demande n'a pas besoin
       * des nouveaux référentiels.
       */
      if (
        demande &&
        demande.nature === null
      ) {
        return;
      }

      let active =
        true;

      const chargerReferentiels =
        async () => {
          try {
            const [
              gouvernoratsData,
              operationsData,
              prestationsData,
            ] =
              await Promise.all([
                referentielService
                  .getGouvernorats(),

                referentielService
                  .getOperationsFoncieres(),

                referentielService
                  .getPrestations(),
              ]);

            if (
              !active
            ) {
              return;
            }

            setReferentielError(
              null
            );

            setGouvernorats(
              gouvernoratsData
            );

            setOperationsFoncieres(
              operationsData
            );

            setPrestations(
              prestationsData
            );
          } catch (
            error
          ) {
            if (
              !active
            ) {
              return;
            }

            const message =
              getErrorMessage(
                error
              );

            setReferentielError(
              message
            );

            toast.error(
              "Impossible de charger les référentiels."
            );
          } finally {
            if (
              active
            ) {
              setLoadingReferentiels(
                false
              );
            }
          }
        };

      void chargerReferentiels();

      return () => {
        active =
          false;
      };
    },
    [
      demande,
    ]
  );


  /**
   * ==========================================================
   * INITIALISATION EN MODE MODIFICATION
   * ==========================================================
   */

  useEffect(
    () => {
      if (
        !demande
      ) {
        return;
      }

      /**
       * Ancienne demande.
       */
      if (
        demande.nature ===
        null
      ) {
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
            demande.email ??
            "",

          nature:
            null,

          gouvernoratId:
            "",

          numeroTitreFoncier:
            "",

          operationFonciereIds:
            [],

          prestationId:
            "",

          nombrePages:
            undefined,

          langue:
            LangueCertificat.ARABE,

          prestationNecessiteTitreFoncier:
            false,

          prestationTarificationParPage:
            false,

          adresseBien:
            demande.adresseBien,

          referenceFonciere:
            demande.referenceFonciere,

          nombreExemplaires:
            demande.nombreExemplaires,

          langueCertificat:
            demande.langueCertificat,

          traductionDemandee:
            demande.traductionDemandee,

          observations:
            demande.observations ??
            "",
        });

        return;
      }


      /**
       * Nouvelle structure.
       */
      const languePrestation =
        demande
          .tarification
          ?.langue ??
        (
          demande
            .langueCertificat ===
            LangueCertificat
              .FRANCAIS ||
          demande
            .langueCertificat ===
            LangueCertificat
              .ARABE
            ? demande
                .langueCertificat
            : LangueCertificat
                .ARABE
        );


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
          demande.email ??
          "",

        nature:
          demande.nature,

        gouvernoratId:
          demande
            .titreFoncier
            ?.gouvernoratId ??
          "",

        numeroTitreFoncier:
          demande
            .titreFoncier
            ?.numero ??
          "",

        operationFonciereIds:
          demande
            .operationsFoncieres
            ?.map(
              (item) =>
                item
                  .typeOperationFonciereId
            ) ??
          [],

        prestationId:
          demande
            .prestationId ??
          "",

        nombrePages:
          demande
            .nombrePages ??
          undefined,

        langue:
          languePrestation,

        prestationNecessiteTitreFoncier:
          demande
            .prestation
            ?.necessiteTitreFoncier ??
          false,

        prestationTarificationParPage:
          demande
            .prestation
            ?.tarificationParPage ??
          false,

        adresseBien:
          demande.adresseBien,

        /**
         * Legacy conservé uniquement
         * dans les valeurs du formulaire.
         */
        referenceFonciere:
          demande.referenceFonciere,

        nombreExemplaires:
          demande.nombreExemplaires,

        langueCertificat:
          demande.langueCertificat,

        traductionDemandee:
          demande.traductionDemandee,

        observations:
          demande.observations ??
          "",
      });
    },
    [
      demande,
      reset,
    ]
  );


  /**
   * ==========================================================
   * SYNCHRONISATION DES REGLES DE PRESTATION
   * ==========================================================
   */

  useEffect(
    () => {
      if (
        nature !==
          NatureDemande.PRESTATION ||
        !prestationSelectionnee
      ) {
        return;
      }

      setValue(
        "prestationNecessiteTitreFoncier",
        prestationSelectionnee
          .necessiteTitreFoncier,
        {
          shouldValidate:
            false,
        }
      );

      setValue(
        "prestationTarificationParPage",
        prestationSelectionnee
          .tarificationParPage,
        {
          shouldValidate:
            false,
        }
      );
    },
    [
      nature,
      prestationSelectionnee,
      setValue,
    ]
  );


  /**
   * ==========================================================
   * REQUETE TARIFAIRE COURANTE
   * ==========================================================
   *
   * La requête est dérivée des valeurs du formulaire.
   * Aucun setState n'est nécessaire ici.
   */

  const tarificationRequest =
    useMemo<
      CalculTarificationRequest | null
    >(
      () => {
        /**
         * Ancienne demande ou demande payée :
         * aucun nouveau calcul.
         */
        if (
          nature === null ||
          isLegacy ||
          demandeVerrouillee
        ) {
          return null;
        }


        /**
         * INSCRIPTION
         */
        if (
          nature ===
          NatureDemande.INSCRIPTION
        ) {
          if (
            operationFonciereIds
              .length === 0
          ) {
            return null;
          }

          return {
            nature:
              NatureDemande
                .INSCRIPTION,

            operationFonciereIds,
          };
        }


        /**
         * PRESTATION
         */
        if (
          nature ===
          NatureDemande.PRESTATION
        ) {
          if (
            !prestationId ||
            !langue
          ) {
            return null;
          }


          if (
            prestationSelectionnee
              ?.tarificationParPage &&
            (
              !nombrePages ||
              nombrePages < 1
            )
          ) {
            return null;
          }


          return {
            nature:
              NatureDemande
                .PRESTATION,

            prestationId,

            langue,

            ...(prestationSelectionnee
              ?.tarificationParPage &&
            nombrePages
              ? {
                  nombrePages,
                }
              : {}),
          };
        }


        return null;
      },
      [
        nature,
        isLegacy,
        demandeVerrouillee,
        operationFonciereIds,
        prestationId,
        langue,
        nombrePages,
        prestationSelectionnee,
      ]
    );


  /**
   * Clé représentant exactement les paramètres
   * utilisés pour le calcul.
   *
   * Elle empêche l'affichage d'un ancien tarif
   * lorsque l'utilisateur modifie le formulaire.
   */
  const tarificationRequestKey =
    useMemo(
      () =>
        tarificationRequest
          ? JSON.stringify(
              tarificationRequest
            )
          : null,
      [
        tarificationRequest,
      ]
    );


  /**
   * ==========================================================
   * CALCUL TARIFAIRE AUTOMATIQUE
   * ==========================================================
   */

  useEffect(
    () => {
      if (
        !tarificationRequest ||
        !tarificationRequestKey
      ) {
        return;
      }


      let active =
        true;


      /**
       * Délai de 350 ms afin d'éviter
       * les appels excessifs à l'API.
       */
      const timeoutId =
        window.setTimeout(
          () => {
            const calculer =
              async () => {
                try {
                  const result =
                    await tarificationService
                      .calculer(
                        tarificationRequest
                      );

                  if (
                    !active
                  ) {
                    return;
                  }


                  setTarification(
                    result
                  );

                  setTarificationError(
                    null
                  );

                  setTarificationResultKey(
                    tarificationRequestKey
                  );
                } catch (
                  error
                ) {
                  if (
                    !active
                  ) {
                    return;
                  }


                  setTarification(
                    null
                  );

                  setTarificationError(
                    getErrorMessage(
                      error
                    )
                  );

                  setTarificationResultKey(
                    tarificationRequestKey
                  );
                }
              };


            void calculer();
          },
          350
        );


      return () => {
        active =
          false;

        window.clearTimeout(
          timeoutId
        );
      };
    },
    [
      tarificationRequest,
      tarificationRequestKey,
    ]
  );


  /**
   * ==========================================================
   * ETAT DU CALCUL TARIFAIRE
   * ==========================================================
   */

  const tarificationEnCours =
    Boolean(
      tarificationRequestKey &&
      tarificationResultKey !==
        tarificationRequestKey
    );


  const tarificationErrorAffichee =
    tarificationRequestKey &&
    tarificationResultKey ===
      tarificationRequestKey
      ? tarificationError
      : null;


  const tarificationCalculeeCourante =
    tarificationRequestKey &&
    tarificationResultKey ===
      tarificationRequestKey
      ? tarification
      : null;


  /**
   * ==========================================================
   * TARIFICATION A AFFICHER
   * ==========================================================
   */

  const tarificationAffichee:
    | CalculTarification
    | TarificationDemande
    | null =
      demandeVerrouillee
        ? demande
            ?.tarification ??
          null
        : tarificationCalculeeCourante;


  /**
   * ==========================================================
   * ANCIEN CALCUL
   * ==========================================================
   */

  const nombreExemplairesValide:
    number =
      typeof nombreExemplaires ===
        "number" &&
      Number.isFinite(
        nombreExemplaires
      ) &&
      nombreExemplaires > 0
        ? nombreExemplaires
        : 0;

  const legacySupplement =
    traductionDemandee
      ? LEGACY_SUPPLEMENT_TRADUCTION
      : 0;

  const legacyMontantTotal =
    nombreExemplairesValide *
      LEGACY_PRIX_UNITAIRE_CERTIFICAT +
    legacySupplement;


  /**
   * ==========================================================
   * HANDLER CIN
   * ==========================================================
   */

  const handleCinChange =
    () => {
      if (
        identiteCni
      ) {
        setIdentiteCni(
          null
        );

        if (
          !demande
        ) {
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

      if (
        cniError
      ) {
        setCniError(
          null
        );
      }
    };


  const handleVerifyCin =
    async () => {
      const isCinValid =
        await trigger(
          "cin"
        );

      if (
        !isCinValid
      ) {
        return;
      }

      try {
        setVerifyingCin(
          true
        );

        setCniError(
          null
        );

        const identite =
          await cniService
            .verifierCni({
              cin:
                cin.trim(),
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
      } catch (
        error
      ) {
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


  /**
   * ==========================================================
   * CHANGEMENT DE NATURE
   * ==========================================================
   */

  const handleNatureChange =
    (
      value:
        | typeof NatureDemande.INSCRIPTION
        | typeof NatureDemande.PRESTATION
    ) => {
      setValue(
        "nature",
        value,
        {
          shouldDirty:
            true,

          shouldValidate:
            true,
        }
      );

      setTarification(
        null
      );

      setTarificationError(
        null
      );


      if (
        value ===
        NatureDemande.INSCRIPTION
      ) {
        setValue(
          "prestationId",
          "",
          {
            shouldDirty:
              true,
          }
        );

        setValue(
          "nombrePages",
          undefined,
          {
            shouldDirty:
              true,
          }
        );

        setValue(
          "prestationNecessiteTitreFoncier",
          false
        );

        setValue(
          "prestationTarificationParPage",
          false
        );
      } else {
        setValue(
          "operationFonciereIds",
          [],
          {
            shouldDirty:
              true,
          }
        );
      }
    };


  /**
   * ==========================================================
   * CHANGEMENT DE PRESTATION
   * ==========================================================
   */

  const handlePrestationChange =
    (
      value: string
    ) => {
      setValue(
        "prestationId",
        value,
        {
          shouldDirty:
            true,

          shouldValidate:
            true,
        }
      );

      const selected =
        prestations.find(
          (item) =>
            item.id ===
            value
        );

      setValue(
        "prestationNecessiteTitreFoncier",
        selected
          ?.necessiteTitreFoncier ??
          false,
        {
          shouldValidate:
            true,
        }
      );

      setValue(
        "prestationTarificationParPage",
        selected
          ?.tarificationParPage ??
          false,
        {
          shouldValidate:
            true,
        }
      );


      if (
        !selected
          ?.tarificationParPage
      ) {
        setValue(
          "nombrePages",
          undefined,
          {
            shouldDirty:
              true,

            shouldValidate:
              true,
          }
        );
      }


      /**
       * Lors d'une nouvelle demande, un service
       * qui ne nécessite aucun titre ne conserve
       * pas les valeurs éventuellement saisies
       * auparavant.
       *
       * En modification, on ne les efface pas
       * automatiquement car le backend ne
       * déconnecte pas encore un ancien titre.
       */
      if (
        !selected
          ?.necessiteTitreFoncier &&
        !isEditMode
      ) {
        setValue(
          "gouvernoratId",
          "",
          {
            shouldDirty:
              true,

            shouldValidate:
              true,
          }
        );

        setValue(
          "numeroTitreFoncier",
          "",
          {
            shouldDirty:
              true,

            shouldValidate:
              true,
          }
        );
      }

      setTarification(
        null
      );

      setTarificationError(
        null
      );
    };


  /**
   * ==========================================================
   * SOUMISSION
   * ==========================================================
   */

  const onSubmit =
    async (
      data:
        DemandeFormData
    ) => {
      /**
       * Une nouvelle demande doit obligatoirement
       * avoir été vérifiée par le service CNI.
       */
      if (
        !demande &&
        !identiteCni
      ) {
        toast.error(
          "Veuillez vérifier le numéro CIN avant d’enregistrer la demande."
        );

        return;
      }


      if (
        demandeVerrouillee
      ) {
        toast.error(
          "Une demande déjà payée ne peut plus être modifiée."
        );

        return;
      }


      try {
        setSubmitting(
          true
        );


        /**
         * Données communes.
         */
        const donneesCommunes =
          {
            nomDemandeur:
              data
                .nomDemandeur
                .trim(),

            prenomDemandeur:
              data
                .prenomDemandeur
                .trim(),

            cin:
              data
                .cin
                .trim(),

            telephone:
              data
                .telephone
                .trim(),

            ...(data.email
              ?.trim()
              ? {
                  email:
                    data.email
                      .trim(),
                }
              : {}),

            adresseBien:
              data
                .adresseBien
                .trim(),

            ...(data
              .observations
              ?.trim()
              ? {
                  observations:
                    data
                      .observations
                      .trim(),
                }
              : {}),
          };


        /**
         * ======================================================
         * MODIFICATION D'UNE ANCIENNE DEMANDE
         * ======================================================
         */
        if (
          demande &&
          demande.nature ===
            null
        ) {
          if (
            !data
              .referenceFonciere ||
            !data
              .nombreExemplaires ||
            !data
              .langueCertificat
          ) {
            toast.error(
              "Les informations de l’ancienne demande sont incomplètes."
            );

            return;
          }

          const payload:
            UpdateDemandeRequest =
            {
              ...donneesCommunes,

              referenceFonciere:
                data
                  .referenceFonciere
                  .trim(),

              nombreExemplaires:
                data
                  .nombreExemplaires,

              langueCertificat:
                data
                  .langueCertificat,

              traductionDemandee:
                data
                  .traductionDemandee ??
                false,
            };

          await demandeService
            .updateDemande(
              demande.id,
              payload
            );

          toast.success(
            "Demande modifiée avec succès."
          );

          navigate(
            "/demandes",
            {
              replace:
                true,
            }
          );

          return;
        }


        /**
         * ======================================================
         * INSCRIPTION
         * ======================================================
         */
        if (
          data.nature ===
          NatureDemande.INSCRIPTION
        ) {
          const operations =
            data
              .operationFonciereIds ??
            [];

          if (
            !data.gouvernoratId ||
            !data
              .numeroTitreFoncier
              ?.trim() ||
            operations.length ===
              0
          ) {
            toast.error(
              "Les informations foncières de l’inscription sont incomplètes."
            );

            return;
          }


          if (
            demande
          ) {
            const payload:
              UpdateDemandeRequest =
              {
                ...donneesCommunes,

                gouvernoratId:
                  data
                    .gouvernoratId,

                numeroTitreFoncier:
                  data
                    .numeroTitreFoncier
                    .trim(),

                operationFonciereIds:
                  operations,
              };

            await demandeService
              .updateDemande(
                demande.id,
                payload
              );

            toast.success(
              "Demande modifiée avec succès."
            );
          } else {
            const payload:
              CreateDemandeRequest =
              {
                ...donneesCommunes,

                nature:
                  NatureDemande
                    .INSCRIPTION,

                gouvernoratId:
                  data
                    .gouvernoratId,

                numeroTitreFoncier:
                  data
                    .numeroTitreFoncier
                    .trim(),

                operationFonciereIds:
                  operations,
              };

            await demandeService
              .createDemande(
                payload
              );

            toast.success(
              "Demande créée avec succès."
            );
          }
        }


        /**
         * ======================================================
         * PRESTATION
         * ======================================================
         */
        if (
          data.nature ===
          NatureDemande.PRESTATION
        ) {
          if (
            !data.prestationId ||
            !data.langue
          ) {
            toast.error(
              "Les informations de la prestation sont incomplètes."
            );

            return;
          }


          const titre =
            data
              .numeroTitreFoncier
              ?.trim();

          const titrePayload =
            titre &&
            data.gouvernoratId
              ? {
                  gouvernoratId:
                    data
                      .gouvernoratId,

                  numeroTitreFoncier:
                    titre,
                }
              : {};


          if (
            demande
          ) {
            const payload:
              UpdateDemandeRequest =
              {
                ...donneesCommunes,

                prestationId:
                  data
                    .prestationId,

                langue:
                  data.langue,

                ...(data
                  .nombrePages
                  ? {
                      nombrePages:
                        data
                          .nombrePages,
                    }
                  : {}),

                ...titrePayload,
              };

            await demandeService
              .updateDemande(
                demande.id,
                payload
              );

            toast.success(
              "Demande modifiée avec succès."
            );
          } else {
            const payload:
              CreateDemandeRequest =
              {
                ...donneesCommunes,

                nature:
                  NatureDemande
                    .PRESTATION,

                prestationId:
                  data
                    .prestationId,

                langue:
                  data.langue,

                ...(data
                  .nombrePages
                  ? {
                      nombrePages:
                        data
                          .nombrePages,
                    }
                  : {}),

                ...titrePayload,
              };

            await demandeService
              .createDemande(
                payload
              );

            toast.success(
              "Demande créée avec succès."
            );
          }
        }


        navigate(
          "/demandes",
          {
            replace:
              true,
          }
        );
      } catch (
        error
      ) {
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


  /**
   * ==========================================================
   * ETAT GENERAL DES CHAMPS
   * ==========================================================
   */

  const fieldsDisabled =
    submitting ||
    verifyingCin ||
    demandeVerrouillee;


  /**
   * ==========================================================
   * AFFICHAGE
   * ==========================================================
   */

  return (
    <Paper
      component="form"
      noValidate
      variant="outlined"
      onSubmit={
        handleSubmit(
          onSubmit
        )
      }
      sx={{
        width:
          "100%",

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
          mb: 3,
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


      {demandeVerrouillee && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
          }}
        >
          Cette demande a déjà
          été payée. Ses
          informations et sa
          tarification sont
          désormais verrouillées.
        </Alert>
      )}


      {referentielError && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {referentielError}
        </Alert>
      )}


      {/* ===================================================== */}
      {/* IDENTITE DU DEMANDEUR */}
      {/* ===================================================== */}

      <Box
        sx={{
          display:
            "flex",

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

            flexShrink:
              0,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            borderRadius:
              2.5,

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
              fontWeight:
                700,
            }}
          >
            Informations du demandeur
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
          display:
            "grid",

          gridTemplateColumns:
            {
              xs: "1fr",

              md:
                "repeat(2, minmax(0, 1fr))",
            },

          gap: 2.5,
        }}
      >
        {/* CIN */}

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
              display:
                "grid",

              gridTemplateColumns:
                {
                  xs: "1fr",

                  sm:
                    "minmax(0, 1fr) auto",
                },

              gap: 1.5,

              alignItems:
                "start",
            }}
          >
            <TextField
              required
              fullWidth
              autoFocus={
                !isEditMode
              }
              label="Numéro de la CIN"
              placeholder="Ex. 12345678"
              disabled={
                fieldsDisabled
              }
              error={
                Boolean(
                  errors.cin
                )
              }
              helperText={
                errors.cin
                  ?.message ??
                "Saisissez les 8 chiffres de la CIN."
              }
              slotProps={{
                htmlInput: {
                  inputMode:
                    "numeric",

                  maxLength:
                    8,
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
                verifyingCin
                  ? (
                      <CircularProgress
                        size={
                          18
                        }
                        color="inherit"
                      />
                    )
                  : (
                      <VerifiedUserRoundedIcon />
                    )
              }
              disabled={
                fieldsDisabled
              }
              onClick={() => {
                void handleVerifyCin();
              }}
              sx={{
                minHeight:
                  56,

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
                Identité confirmée
                par le service CNI
              </Typography>

              <Typography
                variant="body2"
              >
                Date de naissance :{" "}
                {formatDateFr(
                  identiteCni
                    .dateNaissance
                )}
              </Typography>

              <Typography
                variant="body2"
              >
                Adresse officielle :{" "}
                {
                  identiteCni
                    .adresse
                }
              </Typography>

              <Typography
                variant="body2"
              >
                Référence de vérification :{" "}
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
            fieldsDisabled
          }
          error={
            Boolean(
              errors
                .nomDemandeur
            )
          }
          helperText={
            errors
              .nomDemandeur
              ?.message ??
            (
              identiteCni
                ? "Renseigné automatiquement par le service CNI."
                : undefined
            )
          }
          slotProps={{
            inputLabel: {
              shrink:
                true,
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
            fieldsDisabled
          }
          error={
            Boolean(
              errors
                .prenomDemandeur
            )
          }
          helperText={
            errors
              .prenomDemandeur
              ?.message ??
            (
              identiteCni
                ? "Renseigné automatiquement par le service CNI."
                : undefined
            )
          }
          slotProps={{
            inputLabel: {
              shrink:
                true,
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
            fieldsDisabled
          }
          helperText={
            dateNaissanceAffichee
              ? "Renseignée automatiquement par le service CNI."
              : "Vérifiez le numéro CIN pour récupérer la date de naissance."
          }
          slotProps={{
            inputLabel: {
              shrink:
                true,
            },

            htmlInput: {
              readOnly:
                true,
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
            fieldsDisabled
          }
          helperText={
            adresseOfficielleAffichee
              ? "Renseignée automatiquement par le service CNI."
              : "Vérifiez le numéro CIN pour récupérer l’adresse officielle."
          }
          slotProps={{
            inputLabel: {
              shrink:
                true,
            },

            htmlInput: {
              readOnly:
                true,
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
            fieldsDisabled
          }
          error={
            Boolean(
              errors.telephone
            )
          }
          helperText={
            errors.telephone
              ?.message
          }
          slotProps={{
            htmlInput: {
              inputMode:
                "numeric",

              maxLength:
                8,
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
            fieldsDisabled
          }
          error={
            Boolean(
              errors.email
            )
          }
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


      {/* ===================================================== */}
      {/* NATURE */}
      {/* ===================================================== */}

      {!isLegacy && (
        <>
          <Box
            sx={{
              display:
                "flex",

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

                flexShrink:
                  0,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                borderRadius:
                  2.5,

                color:
                  "primary.main",

                bgcolor:
                  "rgba(10, 74, 70, 0.10)",
              }}
            >
              <CategoryRoundedIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight:
                    700,
                }}
              >
                Nature de la demande
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Sélectionnez une
                inscription foncière
                ou une prestation
                délivrée par l’ONPF.
              </Typography>
            </Box>
          </Box>


          <Controller
            name="nature"
            control={control}
            render={({
              field,
            }) => (
              <TextField
                select
                required
                fullWidth
                label="Nature de la demande"
                value={
                  field.value ??
                  ""
                }
                disabled={
                  fieldsDisabled ||
                  isEditMode
                }
                error={
                  Boolean(
                    errors.nature
                  )
                }
                helperText={
                  errors.nature
                    ?.message ??
                  (
                    isEditMode
                      ? "La nature d’une demande existante ne peut pas être modifiée."
                      : "Choisissez le type de dossier à enregistrer."
                  )
                }
                onChange={(
                  event
                ) => {
                  handleNatureChange(
                    event
                      .target
                      .value as
                      | typeof NatureDemande.INSCRIPTION
                      | typeof NatureDemande.PRESTATION
                  );
                }}
              >
                <MenuItem
                  value={
                    NatureDemande
                      .INSCRIPTION
                  }
                >
                  Inscription foncière
                </MenuItem>

                <MenuItem
                  value={
                    NatureDemande
                      .PRESTATION
                  }
                >
                  Prestation
                </MenuItem>
              </TextField>
            )}
          />


          <Divider
            sx={{
              my: 4,
            }}
          />
        </>
      )}


      {/* ===================================================== */}
      {/* ANCIENNE DEMANDE */}
      {/* ===================================================== */}

      {isLegacy && (
        <>
          <Alert
            severity="warning"
            sx={{
              mb: 3,
            }}
          >
            Cette demande a été
            créée avec l’ancien
            modèle. Les anciens
            paramètres sont
            conservés uniquement
            pour assurer la
            compatibilité.
          </Alert>


          <Box
            sx={{
              display:
                "grid",

              gridTemplateColumns:
                {
                  xs: "1fr",

                  md:
                    "repeat(2, minmax(0, 1fr))",
                },

              gap: 2.5,
            }}
          >
            <TextField
              required
              fullWidth
              label="Référence foncière"
              disabled={
                fieldsDisabled
              }
              error={
                Boolean(
                  errors
                    .referenceFonciere
                )
              }
              helperText={
                errors
                  .referenceFonciere
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
              disabled={
                fieldsDisabled
              }
              error={
                Boolean(
                  errors
                    .adresseBien
                )
              }
              helperText={
                errors
                  .adresseBien
                  ?.message
              }
              {...register(
                "adresseBien"
              )}
            />


            <TextField
              required
              fullWidth
              type="number"
              label="Nombre d’exemplaires"
              disabled={
                fieldsDisabled
              }
              error={
                Boolean(
                  errors
                    .nombreExemplaires
                )
              }
              helperText={
                errors
                  .nombreExemplaires
                  ?.message
              }
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
                  select
                  required
                  fullWidth
                  label="Langue du certificat"
                  value={
                    field.value ??
                    ""
                  }
                  disabled={
                    fieldsDisabled
                  }
                  error={
                    Boolean(
                      errors
                        .langueCertificat
                    )
                  }
                  helperText={
                    errors
                      .langueCertificat
                      ?.message
                  }
                >
                  <MenuItem
                    value={
                      LangueCertificat
                        .FRANCAIS
                    }
                  >
                    Français
                  </MenuItem>

                  <MenuItem
                    value={
                      LangueCertificat
                        .ARABE
                    }
                  >
                    Arabe
                  </MenuItem>

                  <MenuItem
                    value={
                      LangueCertificat
                        .ANGLAIS
                    }
                  >
                    Anglais
                  </MenuItem>
                </TextField>
              )}
            />


            <Controller
              name="traductionDemandee"
              control={control}
              render={({
                field,
              }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        field.value ??
                        false
                      }
                      disabled={
                        fieldsDisabled
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
                  label="Traduction demandée"
                />
              )}
            />


            <Alert
              severity="info"
              sx={{
                gridColumn: {
                  xs: "auto",
                  md: "1 / -1",
                },
              }}
            >
              <Typography
                variant="body2"
              >
                Certificats :{" "}
                {
                  nombreExemplairesValide
                }{" "}
                ×{" "}
                {formatMontant(
                  LEGACY_PRIX_UNITAIRE_CERTIFICAT
                )}
              </Typography>

              <Typography
                variant="body2"
              >
                Ancien supplément
                de traduction :{" "}
                {formatMontant(
                  legacySupplement
                )}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  fontWeight:
                    800,
                }}
              >
                Montant indicatif :{" "}
                {formatMontant(
                  legacyMontantTotal
                )}
              </Typography>
            </Alert>
          </Box>
        </>
      )}


      {/* ===================================================== */}
      {/* NOUVELLE STRUCTURE */}
      {/* ===================================================== */}

      {!isLegacy && (
        <>
          {/* ================================================= */}
          {/* INSCRIPTION */}
          {/* ================================================= */}

          {nature ===
            NatureDemande.INSCRIPTION && (
            <>
              <Box
                sx={{
                  display:
                    "flex",

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

                    flexShrink:
                      0,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    borderRadius:
                      2.5,

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
                      fontWeight:
                        700,
                    }}
                  >
                    Informations foncières
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Un titre foncier
                    est identifié par
                    son numéro et son
                    gouvernorat.
                  </Typography>
                </Box>
              </Box>


              <Box
                sx={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    {
                      xs: "1fr",

                      md:
                        "repeat(2, minmax(0, 1fr))",
                    },

                  gap: 2.5,
                }}
              >
                <Controller
                  name="gouvernoratId"
                  control={control}
                  render={({
                    field,
                  }) => (
                    <TextField
                      {...field}
                      select
                      required
                      fullWidth
                      label="Gouvernorat"
                      value={
                        field.value ??
                        ""
                      }
                      disabled={
                        fieldsDisabled ||
                        loadingReferentiels
                      }
                      error={
                        Boolean(
                          errors
                            .gouvernoratId
                        )
                      }
                      helperText={
                        errors
                          .gouvernoratId
                          ?.message ??
                        (
                          loadingReferentiels
                            ? "Chargement des gouvernorats..."
                            : "Sélectionnez le gouvernorat du titre foncier."
                        )
                      }
                    >
                      {gouvernorats.map(
                        (
                          gouvernorat
                        ) => (
                          <MenuItem
                            key={
                              gouvernorat.id
                            }
                            value={
                              gouvernorat.id
                            }
                          >
                            {
                              gouvernorat.nom
                            }
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  )}
                />


                <TextField
                  required
                  fullWidth
                  label="Numéro du titre foncier"
                  placeholder="Ex. 45876"
                  disabled={
                    fieldsDisabled
                  }
                  error={
                    Boolean(
                      errors
                        .numeroTitreFoncier
                    )
                  }
                  helperText={
                    errors
                      .numeroTitreFoncier
                      ?.message ??
                    "Saisissez uniquement le numéro du titre."
                  }
                  {...register(
                    "numeroTitreFoncier"
                  )}
                />


                <TextField
                  required
                  fullWidth
                  label="Adresse du bien"
                  placeholder="Ville, quartier, localité..."
                  disabled={
                    fieldsDisabled
                  }
                  error={
                    Boolean(
                      errors
                        .adresseBien
                    )
                  }
                  helperText={
                    errors
                      .adresseBien
                      ?.message
                  }
                  sx={{
                    gridColumn: {
                      xs: "auto",
                      md: "1 / -1",
                    },
                  }}
                  {...register(
                    "adresseBien"
                  )}
                />


                <FormControl
                  component="fieldset"
                  error={
                    Boolean(
                      errors
                        .operationFonciereIds
                    )
                  }
                  sx={{
                    gridColumn: {
                      xs: "auto",
                      md: "1 / -1",
                    },

                    width:
                      "100%",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight:
                        700,

                      mb: 1,
                    }}
                  >
                    Opération(s) foncière(s) *
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                    }}
                  >
                    Plusieurs opérations
                    peuvent être
                    sélectionnées pour
                    une même demande.
                  </Typography>


                  {loadingReferentiels ? (
                    <Box
                      sx={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap: 1,
                      }}
                    >
                      <CircularProgress
                        size={
                          20
                        }
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Chargement des opérations...
                      </Typography>
                    </Box>
                  ) : (
                    <Controller
                      name="operationFonciereIds"
                      control={control}
                      render={({
                        field,
                      }) => {
                        const selectedValues =
                          field.value ??
                          [];

                        return (
                          <FormGroup
                            sx={{
                              display:
                                "grid",

                              gridTemplateColumns:
                                {
                                  xs:
                                    "1fr",

                                  sm:
                                    "repeat(2, minmax(0, 1fr))",

                                  md:
                                    "repeat(3, minmax(0, 1fr))",
                                },

                              gap:
                                0.5,
                            }}
                          >
                            {operationsFoncieres.map(
                              (
                                operation
                              ) => {
                                const checked =
                                  selectedValues
                                    .includes(
                                      operation.id
                                    );

                                return (
                                  <FormControlLabel
                                    key={
                                      operation.id
                                    }
                                    disabled={
                                      fieldsDisabled
                                    }
                                    control={
                                      <Checkbox
                                        checked={
                                          checked
                                        }
                                        onChange={(
                                          event
                                        ) => {
                                          const nextValues =
                                            event
                                              .target
                                              .checked
                                              ? [
                                                  ...selectedValues,
                                                  operation.id,
                                                ]
                                              : selectedValues.filter(
                                                  (
                                                    id
                                                  ) =>
                                                    id !==
                                                    operation.id
                                                );

                                          field.onChange(
                                            nextValues
                                          );
                                        }}
                                      />
                                    }
                                    label={
                                      operation
                                        .libelle
                                    }
                                  />
                                );
                              }
                            )}
                          </FormGroup>
                        );
                      }}
                    />
                  )}


                  {errors
                    .operationFonciereIds
                    ?.message && (
                    <FormHelperText>
                      {
                        errors
                          .operationFonciereIds
                          .message
                      }
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
            </>
          )}


          {/* ================================================= */}
          {/* PRESTATION */}
          {/* ================================================= */}

          {nature ===
            NatureDemande.PRESTATION && (
            <>
              <Box
                sx={{
                  display:
                    "flex",

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

                    flexShrink:
                      0,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    borderRadius:
                      2.5,

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
                      fontWeight:
                        700,
                    }}
                  >
                    Prestation demandée
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Sélectionnez la
                    prestation. Les
                    champs nécessaires
                    sont adaptés
                    automatiquement.
                  </Typography>
                </Box>
              </Box>


              <Box
                sx={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    {
                      xs: "1fr",

                      md:
                        "repeat(2, minmax(0, 1fr))",
                    },

                  gap: 2.5,
                }}
              >
                <Controller
                  name="prestationId"
                  control={control}
                  render={({
                    field,
                  }) => (
                    <TextField
                      select
                      required
                      fullWidth
                      label="Prestation"
                      value={
                        field.value ??
                        ""
                      }
                      disabled={
                        fieldsDisabled ||
                        loadingReferentiels
                      }
                      error={
                        Boolean(
                          errors
                            .prestationId
                        )
                      }
                      helperText={
                        errors
                          .prestationId
                          ?.message ??
                        (
                          loadingReferentiels
                            ? "Chargement des prestations..."
                            : "Sélectionnez la prestation souhaitée."
                        )
                      }
                      onChange={(
                        event
                      ) => {
                        field.onChange(
                          event
                            .target
                            .value
                        );

                        handlePrestationChange(
                          event
                            .target
                            .value
                        );
                      }}
                    >
                      {prestations.map(
                        (
                          prestation
                        ) => (
                          <MenuItem
                            key={
                              prestation.id
                            }
                            value={
                              prestation.id
                            }
                          >
                            {
                              prestation.libelle
                            }
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  )}
                />


                <Controller
                  name="langue"
                  control={control}
                  render={({
                    field,
                  }) => (
                    <TextField
                      {...field}
                      select
                      required
                      fullWidth
                      label="Langue"
                      value={
                        field.value ??
                        ""
                      }
                      disabled={
                        fieldsDisabled
                      }
                      error={
                        Boolean(
                          errors.langue
                        )
                      }
                      helperText={
                        errors.langue
                          ?.message ??
                        (
                          prestationSelectionnee
                            ?.supplementFrancaisApplicable
                            ? "Un supplément réglementaire peut s’appliquer au français."
                            : "Sélectionnez la langue de la prestation."
                        )
                      }
                    >
                      <MenuItem
                        value={
                          LangueCertificat
                            .ARABE
                        }
                      >
                        Arabe
                      </MenuItem>

                      <MenuItem
                        value={
                          LangueCertificat
                            .FRANCAIS
                        }
                      >
                        Français
                      </MenuItem>
                    </TextField>
                  )}
                />


                {prestationSelectionnee
                  ?.tarificationParPage && (
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Nombre de pages"
                    disabled={
                      fieldsDisabled
                    }
                    error={
                      Boolean(
                        errors
                          .nombrePages
                      )
                    }
                    helperText={
                      errors
                        .nombrePages
                        ?.message ??
                      "Le tarif de cette prestation dépend du nombre de pages."
                    }
                    slotProps={{
                      htmlInput: {
                        min: 1,
                        step: 1,

                        inputMode:
                          "numeric",
                      },
                    }}
                    {...register(
                      "nombrePages",
                      {
                        valueAsNumber:
                          true,
                      }
                    )}
                  />
                )}


                {afficherTitrePrestation && (
                  <>
                    <Controller
                      name="gouvernoratId"
                      control={control}
                      render={({
                        field,
                      }) => (
                        <TextField
                          {...field}
                          select
                          required={
                            Boolean(
                              prestationSelectionnee
                                ?.necessiteTitreFoncier
                            )
                          }
                          fullWidth
                          label="Gouvernorat"
                          value={
                            field.value ??
                            ""
                          }
                          disabled={
                            fieldsDisabled ||
                            loadingReferentiels
                          }
                          error={
                            Boolean(
                              errors
                                .gouvernoratId
                            )
                          }
                          helperText={
                            errors
                              .gouvernoratId
                              ?.message ??
                            (
                              prestationSelectionnee
                                ?.necessiteTitreFoncier
                                ? "Obligatoire pour cette prestation."
                                : "Titre associé à la demande."
                            )
                          }
                        >
                          {gouvernorats.map(
                            (
                              gouvernorat
                            ) => (
                              <MenuItem
                                key={
                                  gouvernorat.id
                                }
                                value={
                                  gouvernorat.id
                                }
                              >
                                {
                                  gouvernorat.nom
                                }
                              </MenuItem>
                            )
                          )}
                        </TextField>
                      )}
                    />


                    <TextField
                      required={
                        Boolean(
                          prestationSelectionnee
                            ?.necessiteTitreFoncier
                        )
                      }
                      fullWidth
                      label="Numéro du titre foncier"
                      placeholder="Ex. 45876"
                      disabled={
                        fieldsDisabled
                      }
                      error={
                        Boolean(
                          errors
                            .numeroTitreFoncier
                        )
                      }
                      helperText={
                        errors
                          .numeroTitreFoncier
                          ?.message ??
                        (
                          prestationSelectionnee
                            ?.necessiteTitreFoncier
                            ? "Obligatoire pour cette prestation."
                            : "Titre associé à la demande."
                        )
                      }
                      {...register(
                        "numeroTitreFoncier"
                      )}
                    />
                  </>
                )}


                <TextField
                  required
                  fullWidth
                  label="Adresse du bien"
                  placeholder="Ville, quartier, localité..."
                  disabled={
                    fieldsDisabled
                  }
                  error={
                    Boolean(
                      errors
                        .adresseBien
                    )
                  }
                  helperText={
                    errors
                      .adresseBien
                      ?.message
                  }
                  sx={{
                    gridColumn: {
                      xs: "auto",
                      md: "1 / -1",
                    },
                  }}
                  {...register(
                    "adresseBien"
                  )}
                />


                {prestationSelectionnee && (
                  <Alert
                    severity="info"
                    sx={{
                      gridColumn: {
                        xs: "auto",
                        md: "1 / -1",
                      },
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
                      {
                        prestationSelectionnee
                          .libelle
                      }
                    </Typography>

                    {prestationSelectionnee
                      .description && (
                      <Typography
                        variant="body2"
                      >
                        {
                          prestationSelectionnee
                            .description
                        }
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display:
                          "block",

                        mt: 0.5,
                      }}
                    >
                      Titre foncier :{" "}
                      {prestationSelectionnee
                        .necessiteTitreFoncier
                        ? "obligatoire"
                        : "non requis"}
                      {" • "}
                      Tarification par page :{" "}
                      {prestationSelectionnee
                        .tarificationParPage
                        ? "oui"
                        : "non"}
                    </Typography>
                  </Alert>
                )}
              </Box>
            </>
          )}


          <Divider
            sx={{
              my: 4,
            }}
          />


          {/* ================================================= */}
          {/* TARIFICATION */}
          {/* ================================================= */}

          <Box
            sx={{
              display:
                "flex",

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

                flexShrink:
                  0,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                borderRadius:
                  2.5,

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
                  fontWeight:
                    700,
                }}
              >
                Tarification
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Le montant est calculé
                automatiquement par le
                serveur à partir du
                tarif réglementaire.
              </Typography>
            </Box>
          </Box>


          {tarificationEnCours && (
            <Alert
              severity="info"
              icon={
                <CircularProgress
                  size={
                    20
                  }
                />
              }
            >
              Calcul du montant
              réglementaire en cours...
            </Alert>
          )}


          {!tarificationEnCours &&
            tarificationErrorAffichee && (
            <Alert
              severity="error"
            >
              {tarificationErrorAffichee}
            </Alert>
          )}


          {!tarificationEnCours &&
            !tarificationErrorAffichee &&
            !tarificationAffichee && (
            <Alert
              severity="info"
            >
              {nature ===
              NatureDemande.INSCRIPTION
                ? "Sélectionnez au moins une opération foncière pour calculer le montant."
                : "Sélectionnez une prestation et renseignez ses paramètres pour calculer le montant."}
            </Alert>
          )}


          {!tarificationEnCours &&
            tarificationAffichee && (
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
                  py: 2,

                  bgcolor:
                    "action.hover",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight:
                      800,
                  }}
                >
                  Détail du calcul
                </Typography>
              </Box>


              <Box
                sx={{
                  px: 2.5,
                }}
              >
                {tarificationAffichee
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
                          `${ligne.code}-${ligne.ordre}`
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
                                600,
                            }}
                          >
                            {
                              ligne.libelle
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Quantité :{" "}
                            {
                              ligne.quantite
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
                              700,

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatMontant(
                            ligne.montant
                          )}
                        </Typography>
                      </Box>
                    )
                  )}
              </Box>


              <Box
                sx={{
                  px: 2.5,
                  py: 2,

                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  gap: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight:
                      800,
                  }}
                >
                  Montant total
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight:
                      900,

                    color:
                      "primary.main",
                  }}
                >
                  {formatMontant(
                    tarificationAffichee
                      .montantTotal
                  )}
                </Typography>
              </Box>


              {tarificationAffichee
                .referenceReglementaire && (
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
                    Référence réglementaire :{" "}
                    {
                      tarificationAffichee
                        .referenceReglementaire
                    }
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </>
      )}


      <Divider
        sx={{
          my: 4,
        }}
      />


      {/* ===================================================== */}
      {/* OBSERVATIONS */}
      {/* ===================================================== */}

      <Box
        sx={{
          display:
            "flex",

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

            flexShrink:
              0,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            borderRadius:
              2.5,

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
              fontWeight:
                700,
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
        minRows={
          4
        }
        label="Observations complémentaires"
        placeholder="Précisions particulières concernant la demande..."
        disabled={
          fieldsDisabled
        }
        error={
          Boolean(
            errors
              .observations
          )
        }
        helperText={
          errors
            .observations
            ?.message ??
          `${observations.length}/500 caractères`
        }
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


      <Divider
        sx={{
          my: 4,
        }}
      />


      {/* ===================================================== */}
      {/* ACTIONS */}
      {/* ===================================================== */}

      <Stack
        direction={{
          xs:
            "column-reverse",

          sm:
            "row",
        }}
        spacing={
          1.5
        }
        sx={{
          justifyContent:
            "flex-end",

          "& > button":
            {
              width: {
                xs:
                  "100%",

                sm:
                  "auto",
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
            submitting
              ? (
                  <CircularProgress
                    size={
                      19
                    }
                    color="inherit"
                  />
                )
              : (
                  <SaveRoundedIcon />
                )
          }
          disabled={
            submitting ||
            verifyingCin ||
            demandeVerrouillee ||
            (
              !isLegacy &&
              loadingReferentiels
            ) ||
            (
              !isLegacy &&
              !tarificationAffichee
            )
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