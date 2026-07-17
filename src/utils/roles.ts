export const ROLES = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
  RESPONSABLE: "RESPONSABLE",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];