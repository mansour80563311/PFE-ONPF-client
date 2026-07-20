import { z } from "zod";

export const demandeSchema = z.object({
  nomDemandeur: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères."),

  prenomDemandeur: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères."),

  cin: z
    .string()
    .regex(/^\d{8}$/, "Le CIN doit contenir exactement 8 chiffres."),

  telephone: z
    .string()
    .regex(
      /^\d{8}$/,
      "Le numéro de téléphone doit contenir exactement 8 chiffres."
    ),

  email: z
    .string()
    .email("Adresse email invalide.")
    .optional()
    .or(z.literal("")),

  referenceFonciere: z
    .string()
    .min(3, "La référence foncière est obligatoire."),

  adresseBien: z
    .string()
    .min(5, "L'adresse du bien est obligatoire."),

  observations: z
    .string()
    .optional(),
});

export type DemandeFormData = z.infer<typeof demandeSchema>;