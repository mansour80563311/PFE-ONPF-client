import { StatutDemande } from "../types/demande";

export function getStatusLabel(
  statut: StatutDemande
): string {
  switch (statut) {
    case StatutDemande.EN_ATTENTE:
      return "En attente";

    case StatutDemande.EN_COURS:
      return "En cours";

    case StatutDemande.VALIDEE:
      return "Validée";

    case StatutDemande.REJETEE:
      return "Rejetée";
  }
}

export function getStatusColor(
  statut: StatutDemande
): "warning" | "info" | "success" | "error" {
  switch (statut) {
    case StatutDemande.EN_ATTENTE:
      return "warning";

    case StatutDemande.EN_COURS:
      return "info";

    case StatutDemande.VALIDEE:
      return "success";

    case StatutDemande.REJETEE:
      return "error";
  }
}


export function isDemandeTerminee(
  statut: StatutDemande
): boolean {
  return (
    statut === StatutDemande.VALIDEE ||
    statut === StatutDemande.REJETEE
  );
}