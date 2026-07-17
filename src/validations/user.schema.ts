import { z } from "zod";

export const userSchema = z.object({
  nom: z.string().min(2, "Le nom est obligatoire."),
  prenom: z.string().min(2, "Le prénom est obligatoire."),
  email: z.email("Email invalide."),
  telephone: z.string().min(8, "Téléphone invalide."),
  login: z.string().min(3, "Le login est obligatoire."),
  password: z
    .string()
    .min(6, "Minimum 6 caractères."),
  roleId: z.uuid("Veuillez sélectionner un rôle."),
  statut: z.boolean(),
});

export const updateUserSchema = userSchema.extend({
  password: z
    .string()
    .min(6, "Minimum 6 caractères.")
    .optional()
    .or(z.literal("")),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;