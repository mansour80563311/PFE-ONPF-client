export const ROLES = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
  RESPONSABLE: "RESPONSABLE",
  CAISSIER: "CAISSIER",
} as const;

export type Role =
  (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<
  Role,
  string
> = {
  ADMIN: "Administrateur",
  AGENT: "Agent guichetier",
  RESPONSABLE: "Responsable",
  CAISSIER: "Caissier",
};