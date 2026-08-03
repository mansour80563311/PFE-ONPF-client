import CaissierDemandeView from "../../components/paiements/CaissierDemandeView";
import StandardDemandeView from "../../components/demandes/StandardDemandeView";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  ROLES,
} from "../../utils/roles";

/*
 * Sélectionne la vue adaptée au rôle.
 *
 * CAISSIER :
 * uniquement l’identification minimale
 * et l’encaissement.
 *
 * ADMIN, AGENT, RESPONSABLE :
 * vue complète de la demande.
 */
function ViewDemandePage() {
  const {
    user,
  } = useAuth();

  if (
    user?.role ===
    ROLES.CAISSIER
  ) {
    return (
      <CaissierDemandeView />
    );
  }

  return (
    <StandardDemandeView />
  );
}

export default ViewDemandePage;