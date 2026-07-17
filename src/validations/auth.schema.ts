import { z } from "zod";

export const loginSchema = z.object({
  login: z
    .string()
    .min(1, "Le login est obligatoire."),

  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire."),
});

export type LoginFormData = z.infer<typeof loginSchema>;