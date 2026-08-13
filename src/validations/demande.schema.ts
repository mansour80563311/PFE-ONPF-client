import { z } from "zod";

import {
  LangueCertificat,
  NatureDemande,
} from "../types/demande";


/**
 * ============================================================
 * OUTILS
 * ============================================================
 */

const uuidOuVideSchema =
  z.union([
    z
      .string()
      .uuid(
        "L’identifiant sélectionné est invalide."
      ),

    z.literal(""),
  ]);


/**
 * ============================================================
 * SCHEMA PRINCIPAL DU FORMULAIRE
 * ============================================================
 *
 * Le formulaire prend en charge :
 *
 * - les nouvelles demandes INSCRIPTION ;
 * - les nouvelles demandes PRESTATION ;
 * - les anciennes demandes dont nature = null.
 *
 * Les règles métier propres à chaque nature sont
 * appliquées dans superRefine().
 */
export const demandeSchema =
  z
    .object({
      /**
       * --------------------------------------------------------
       * IDENTITE DU DEMANDEUR
       * --------------------------------------------------------
       */

      nomDemandeur: z
        .string()
        .trim()
        .min(
          2,
          "Le nom est obligatoire."
        ),

      prenomDemandeur: z
        .string()
        .trim()
        .min(
          2,
          "Le prénom est obligatoire."
        ),

      cin: z
        .string()
        .trim()
        .regex(
          /^\d{8}$/,
          "Le CIN doit contenir exactement 8 chiffres."
        ),

      telephone: z
        .string()
        .trim()
        .regex(
          /^\d{8}$/,
          "Le téléphone doit contenir exactement 8 chiffres."
        ),

      email: z
        .union([
          z.email(
            "L’adresse e-mail est invalide."
          ),

          z.literal(""),
        ])
        .optional(),


      /**
       * --------------------------------------------------------
       * NATURE DE LA DEMANDE
       * --------------------------------------------------------
       *
       * null est conservé uniquement pour les anciennes
       * demandes créées avant la migration.
       */

      nature: z
        .enum(
          [
            NatureDemande.INSCRIPTION,
            NatureDemande.PRESTATION,
          ],
          {
            error:
              "La nature de la demande est obligatoire.",
          }
        )
        .nullable(),


      /**
       * --------------------------------------------------------
       * TITRE FONCIER
       * --------------------------------------------------------
       *
       * Un titre foncier est identifié par :
       *
       * numéro du titre + gouvernorat.
       */

      gouvernoratId:
        uuidOuVideSchema.optional(),

      numeroTitreFoncier: z
        .string()
        .trim()
        .max(
          100,
          "Le numéro du titre foncier est trop long."
        )
        .optional(),


      /**
       * --------------------------------------------------------
       * INSCRIPTION
       * --------------------------------------------------------
       */

      operationFonciereIds: z
        .array(
          z
            .string()
            .uuid(
              "Une opération foncière sélectionnée est invalide."
            )
        )
        .optional(),


      /**
       * --------------------------------------------------------
       * PRESTATION
       * --------------------------------------------------------
       */

      prestationId:
        uuidOuVideSchema.optional(),

      nombrePages: z
        .number({
          error:
            "Le nombre de pages doit être un nombre.",
        })
        .int(
          "Le nombre de pages doit être un entier."
        )
        .min(
          1,
          "Le nombre de pages doit être supérieur ou égal à 1."
        )
        .optional(),

      langue: z
        .enum(
          [
            LangueCertificat.ARABE,
            LangueCertificat.FRANCAIS,
          ],
          {
            error:
              "La langue est invalide.",
          }
        )
        .optional(),


      /**
       * --------------------------------------------------------
       * INFORMATIONS TECHNIQUES DE LA PRESTATION
       * --------------------------------------------------------
       *
       * Ces champs sont utilisés uniquement par le frontend
       * afin d'appliquer dynamiquement les règles correspondant
       * à la prestation sélectionnée.
       *
       * Ils ne seront pas envoyés au backend.
       */

      prestationNecessiteTitreFoncier:
        z.boolean().optional(),

      prestationTarificationParPage:
        z.boolean().optional(),


      /**
       * --------------------------------------------------------
       * INFORMATIONS DU BIEN
       * --------------------------------------------------------
       */

      adresseBien: z
        .string()
        .trim()
        .min(
          5,
          "L’adresse du bien est obligatoire."
        ),


      /**
       * --------------------------------------------------------
       * ANCIEN MODELE
       * --------------------------------------------------------
       *
       * Ces champs sont conservés uniquement pour permettre
       * l'affichage et la modification des anciennes demandes
       * dont nature = null.
       *
       * Ils ne seront plus utilisés lors de la création
       * d'une nouvelle demande.
       */

      referenceFonciere: z
        .string()
        .trim()
        .optional(),

      nombreExemplaires: z
        .number({
          error:
            "Le nombre d’exemplaires doit être un nombre.",
        })
        .int(
          "Le nombre d’exemplaires doit être un entier."
        )
        .min(
          1,
          "Le nombre d’exemplaires doit être supérieur ou égal à 1."
        )
        .max(
          20,
          "Le nombre d’exemplaires ne peut pas dépasser 20."
        )
        .optional(),

      langueCertificat: z
        .enum(
          [
            LangueCertificat.FRANCAIS,
            LangueCertificat.ARABE,
            LangueCertificat.ANGLAIS,
          ],
          {
            error:
              "La langue du certificat est invalide.",
          }
        )
        .optional(),

      traductionDemandee:
        z.boolean().optional(),


      /**
       * --------------------------------------------------------
       * OBSERVATIONS
       * --------------------------------------------------------
       */

      observations: z
        .string()
        .trim()
        .max(
          500,
          "Les observations ne peuvent pas dépasser 500 caractères."
        )
        .optional(),
    })


    /**
     * ==========================================================
     * VALIDATIONS METIER CONDITIONNELLES
     * ==========================================================
     */

    .superRefine(
      (
        data,
        ctx
      ) => {
        /**
         * ======================================================
         * INSCRIPTION
         * ======================================================
         */

        if (
          data.nature ===
          NatureDemande.INSCRIPTION
        ) {
          /**
           * Gouvernorat obligatoire.
           */

          if (
            !data.gouvernoratId
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "gouvernoratId",
              ],

              message:
                "Le gouvernorat est obligatoire.",
            });
          }


          /**
           * Numéro du titre obligatoire.
           */

          if (
            !data
              .numeroTitreFoncier
              ?.trim()
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "numeroTitreFoncier",
              ],

              message:
                "Le numéro du titre foncier est obligatoire.",
            });
          }


          /**
           * Au moins une opération foncière
           * doit être sélectionnée.
           */

          const operationFonciereIds =
            data.operationFonciereIds ??
            [];

          if (
            operationFonciereIds.length ===
            0
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "operationFonciereIds",
              ],

              message:
                "Sélectionnez au moins une opération foncière.",
            });
          }


          /**
           * Une opération ne peut pas être
           * sélectionnée plusieurs fois.
           */

          const operationsUniques =
            new Set(
              operationFonciereIds
            );

          if (
            operationsUniques.size !==
            operationFonciereIds.length
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "operationFonciereIds",
              ],

              message:
                "Une opération foncière ne peut pas être sélectionnée plusieurs fois.",
            });
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
          /**
           * Prestation obligatoire.
           */

          if (
            !data.prestationId
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "prestationId",
              ],

              message:
                "La prestation est obligatoire.",
            });
          }


          /**
           * Langue obligatoire.
           */

          if (
            !data.langue
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "langue",
              ],

              message:
                "La langue est obligatoire.",
            });
          }


          /**
           * Nombre de pages obligatoire lorsque
           * la prestation sélectionnée est tarifée
           * par page.
           */

          if (
            data
              .prestationTarificationParPage &&
            !data.nombrePages
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "nombrePages",
              ],

              message:
                "Le nombre de pages est obligatoire pour cette prestation.",
            });
          }


          /**
           * Certaines prestations exigent
           * obligatoirement un titre foncier.
           */

          if (
            data
              .prestationNecessiteTitreFoncier
          ) {
            if (
              !data.gouvernoratId
            ) {
              ctx.addIssue({
                code: "custom",

                path: [
                  "gouvernoratId",
                ],

                message:
                  "Le gouvernorat est obligatoire pour cette prestation.",
              });
            }

            if (
              !data
                .numeroTitreFoncier
                ?.trim()
            ) {
              ctx.addIssue({
                code: "custom",

                path: [
                  "numeroTitreFoncier",
                ],

                message:
                  "Le numéro du titre foncier est obligatoire pour cette prestation.",
              });
            }
          }


          /**
           * Même lorsqu'une prestation ne rend pas
           * le titre obligatoire, le couple :
           *
           * numéro titre + gouvernorat
           *
           * doit toujours être complet si l'agent
           * commence à renseigner un titre.
           */

          const aNumeroTitre =
            Boolean(
              data
                .numeroTitreFoncier
                ?.trim()
            );

          const aGouvernorat =
            Boolean(
              data.gouvernoratId
            );


          if (
            aNumeroTitre &&
            !aGouvernorat
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "gouvernoratId",
              ],

              message:
                "Sélectionnez le gouvernorat correspondant au titre foncier.",
            });
          }


          if (
            aGouvernorat &&
            !aNumeroTitre
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "numeroTitreFoncier",
              ],

              message:
                "Saisissez le numéro du titre foncier.",
            });
          }
        }


        /**
         * ======================================================
         * ANCIENNES DEMANDES
         * ======================================================
         *
         * nature = null signifie qu'il s'agit d'une
         * demande créée avant la nouvelle tarification.
         */

        if (
          data.nature === null
        ) {
          /**
           * Référence foncière historique obligatoire.
           */

          if (
            !data
              .referenceFonciere
              ?.trim()
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "referenceFonciere",
              ],

              message:
                "La référence foncière est obligatoire.",
            });
          }


          /**
           * Nombre d'exemplaires obligatoire.
           */

          if (
            !data.nombreExemplaires
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "nombreExemplaires",
              ],

              message:
                "Le nombre d’exemplaires est obligatoire.",
            });
          }


          /**
           * Langue historique obligatoire.
           */

          if (
            !data.langueCertificat
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "langueCertificat",
              ],

              message:
                "La langue du certificat est obligatoire.",
            });
          }


          /**
           * ----------------------------------------------------
           * ANCIENNE REGLE DE TRADUCTION
           * ----------------------------------------------------
           *
           * Elle ne concerne que les anciennes demandes.
           *
           * Elle ne doit surtout pas être utilisée pour
           * les nouvelles prestations.
           */

          if (
            data.langueCertificat ===
              LangueCertificat.FRANCAIS &&
            data.traductionDemandee
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "traductionDemandee",
              ],

              message:
                "La traduction ne doit pas être sélectionnée pour un certificat en français.",
            });
          }


          if (
            data.langueCertificat &&
            data.langueCertificat !==
              LangueCertificat.FRANCAIS &&
            !data.traductionDemandee
          ) {
            ctx.addIssue({
              code: "custom",

              path: [
                "traductionDemandee",
              ],

              message:
                "La traduction doit être sélectionnée pour cet ancien certificat.",
            });
          }
        }
      }
    );


/**
 * ============================================================
 * TYPE DU FORMULAIRE
 * ============================================================
 */

export type DemandeFormData =
  z.infer<
    typeof demandeSchema
  >;