import axios from "axios";

import api from "../api/axios";

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}

/*
 * Transforme une éventuelle erreur Blob
 * du backend en message lisible.
 *
 * Comme la requête attend un PDF, Axios
 * reçoit aussi les erreurs JSON sous forme
 * de Blob.
 */
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
            "Le reçu n’a pas pu être généré."
        );
      } catch {
        return new Error(
          "Le reçu n’a pas pu être généré."
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
        "Le reçu n’a pas pu être généré."
    );
  }

  if (
    error instanceof Error
  ) {
    return error;
  }

  return new Error(
    "Une erreur inattendue est survenue lors de l’ouverture du reçu."
  );
}

function sanitizeFilename(
  numeroRecu: string
): string {
  return numeroRecu.replace(
    /[^a-zA-Z0-9-_]/g,
    "_"
  );
}

const recuPaiementService = {
  /**
   * Récupère le PDF avec le token JWT
   * configuré dans l’instance Axios.
   *
   * Le PDF est ensuite ouvert dans un
   * nouvel onglet afin de permettre son
   * impression.
   */
  async openRecu(
    paiementId: string,
    numeroRecu: string
  ): Promise<void> {
    /*
     * L’onglet est ouvert immédiatement
     * pendant le clic de l’utilisateur.
     *
     * Cela limite les blocages causés
     * par les protections antipopup.
     */
    const previewWindow =
      window.open(
        "",
        "_blank"
      );

    try {
      if (previewWindow) {
        previewWindow.document.title =
          "Chargement du reçu...";

        previewWindow.document.body.innerHTML =
          `
            <div
              style="
                font-family: Arial, sans-serif;
                padding: 32px;
                text-align: center;
              "
            >
              Chargement du reçu...
            </div>
          `;
      }

      const response =
        await api.get<Blob>(
          `/paiements/${paiementId}/recu`,
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
        /*
         * Solution de secours lorsque
         * le navigateur bloque l’onglet.
         *
         * Le reçu est alors téléchargé.
         */
        const link =
          document.createElement(
            "a"
          );

        link.href =
          objectUrl;

        link.download =
          `recu-${sanitizeFilename(
            numeroRecu
          )}.pdf`;

        link.rel =
          "noopener noreferrer";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();
      }

      /*
       * Le délai laisse au navigateur
       * le temps de charger le PDF.
       */
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

export default recuPaiementService;