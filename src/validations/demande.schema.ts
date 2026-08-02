import { z } from "zod";

import {
  LangueCertificat,
} from "../types/demande";

export const demandeSchema =
  z
    .object({
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

      /*
       * Informations tarifaires.
       */
      nombreExemplaires: z
        .number({
          error:
            "Le nombre d’exemplaires est obligatoire.",
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
        ),

      langueCertificat: z.enum(
        [
          LangueCertificat.FRANCAIS,
          LangueCertificat.ARABE,
          LangueCertificat.ANGLAIS,
        ],
        {
          error:
            "La langue du certificat est obligatoire.",
        }
      ),

      traductionDemandee:
        z.boolean(),

      referenceFonciere: z
        .string()
        .trim()
        .min(
          2,
          "La référence foncière est obligatoire."
        ),

      adresseBien: z
        .string()
        .trim()
        .min(
          5,
          "L’adresse du bien est obligatoire."
        ),

      observations: z
        .string()
        .trim()
        .max(
          500,
          "Les observations ne peuvent pas dépasser 500 caractères."
        )
        .optional(),
    })
    .superRefine(
      (
        data,
        ctx
      ) => {
        /*
         * Le français est la langue de base.
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

        /*
         * L’arabe et l’anglais nécessitent
         * le supplément de traduction.
         */
        if (
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
              "La traduction doit être sélectionnée pour un certificat en arabe ou en anglais.",
          });
        }
      }
    );

export type DemandeFormData =
  z.infer<
    typeof demandeSchema
  >;