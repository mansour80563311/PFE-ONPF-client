import axios from "axios";

import api from "../api/axios";


interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}


async function normalizeError(
  error: unknown
): Promise<Error> {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const responseData =
      error.response?.data;

    if (
      responseData instanceof Blob
    ) {
      try {
        const text =
          await responseData.text();

        const parsedData =
          JSON.parse(
            text
          ) as ApiErrorResponse;

        return new Error(
          parsedData
            .errors?.[0]
            ?.message ??
            parsedData.message ??
            "Le reçu complémentaire n’a pas pu être généré."
        );
      } catch {
        return new Error(
          "Le reçu complémentaire n’a pas pu être généré."
        );
      }
    }

    const parsedData =
      responseData as
        | ApiErrorResponse
        | undefined;

    return new Error(
      parsedData
        ?.errors?.[0]
        ?.message ??
        parsedData
          ?.message ??
        "Le reçu complémentaire n’a pas pu être généré."
    );
  }

  if (
    error instanceof Error
  ) {
    return error;
  }

  return new Error(
    "Une erreur inattendue est survenue lors de l’ouverture du reçu complémentaire."
  );
}


function sanitizeFilename(
  value: string
): string {
  return value.replace(
    /[^a-zA-Z0-9-_]/g,
    "_"
  );
}


const recuPaiementComplementaireService = {
  /**
   * Ouvre le reçu PDF du dernier complément encaissé pour la
   * demande. Le token JWT est ajouté automatiquement par Axios.
   */
  async openRecu(
    demandeId: string,
    numeroRecu?: string
  ): Promise<void> {
    const previewWindow =
      window.open(
        "",
        "_blank"
      );

    try {
      if (previewWindow) {
        previewWindow.document.title =
          "Chargement du reçu complémentaire...";

        previewWindow.document.body.innerHTML =
          `
            <div
              style="
                font-family: Arial, sans-serif;
                padding: 32px;
                text-align: center;
              "
            >
              Chargement du reçu complémentaire...
            </div>
          `;
      }

      const response =
        await api.get<Blob>(
          `/demandes/${demandeId}/paiement-complementaire/recu`,
          {
            responseType:
              "blob",
          }
        );

      const pdfBlob =
        response.data.type ===
        "application/pdf"
          ? response.data
          : new Blob(
              [
                response.data,
              ],
              {
                type:
                  "application/pdf",
              }
            );

      const objectUrl =
        URL.createObjectURL(
          pdfBlob
        );

      if (previewWindow) {
        previewWindow.location.href =
          objectUrl;
      } else {
        const link =
          document.createElement(
            "a"
          );

        link.href =
          objectUrl;

        link.download =
          `recu-complement-${sanitizeFilename(
            numeroRecu ??
              demandeId
          )}.pdf`;

        link.rel =
          "noopener noreferrer";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();
      }

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            objectUrl
          );
        },
        60_000
      );
    } catch (error) {
      previewWindow?.close();

      throw await normalizeError(
        error
      );
    }
  },
};


export default recuPaiementComplementaireService;
