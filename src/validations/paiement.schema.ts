import { z } from "zod";

/*
 * Le montant est conservé sous forme de chaîne
 * pour respecter les trois décimales du dinar
 * tunisien.
 *
 * Exemples acceptés :
 * - 100
 * - 100.000
 * - 120,500
 */
export const paiementSchema =
  z.object({
    montantRemis: z
      .string()
      .trim()
      .min(
        1,
        "Le montant remis est obligatoire."
      )
      .transform((value) =>
        value.replace(",", ".")
      )
      .refine(
        (value) =>
          /^\d+(\.\d{1,3})?$/.test(
            value
          ),
        {
          message:
            "Le montant remis doit être un nombre avec au maximum trois décimales.",
        }
      )
      .refine(
        (value) =>
          Number(value) > 0,
        {
          message:
            "Le montant remis doit être supérieur à zéro.",
        }
      )
      .refine(
        (value) =>
          Number(value) <=
          1_000_000,
        {
          message:
            "Le montant remis est trop élevé.",
        }
      ),

    observations: z
      .string()
      .trim()
      .max(
        500,
        "Les observations ne peuvent pas dépasser 500 caractères."
      )
      .optional(),
  });

export type PaiementFormData =
  z.infer<
    typeof paiementSchema
  >;