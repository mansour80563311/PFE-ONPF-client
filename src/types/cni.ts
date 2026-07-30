export interface VerifierCniRequest {
  cin: string;
}

export interface IdentiteCni {
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  adresse: string;
  referenceVerification: string;
  identiteValide: boolean;
  source: string;
}

export interface VerifierCniResponse {
  success: boolean;
  message: string;
  data: IdentiteCni;
}