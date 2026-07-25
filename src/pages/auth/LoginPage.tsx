import type {
  ReactNode,
} from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import {
  Navigate,
} from "react-router-dom";

import LoginForm from "../../components/auth/LoginForm";

import {
  useAuth,
} from "../../hooks/useAuth";

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureItem({
  icon,
  title,
  description,
}: FeatureItemProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.75,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRadius: 2.5,
          color: "#FFFFFF",
          bgcolor:
            "rgba(255, 255, 255, 0.12)",
          border:
            "1px solid rgba(255, 255, 255, 0.16)",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            color: "#FFFFFF",
            fontWeight: 700,
            mb: 0.4,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color:
              "rgba(255, 255, 255, 0.74)",
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

function LoginPage() {
  const {
    isAuthenticated,
  } = useAuth();

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "minmax(420px, 0.95fr) minmax(480px, 1.05fr)",
        },
        bgcolor: "background.default",
      }}
    >
      {/* Panneau institutionnel */}

      <Box
        sx={{
          display: {
            xs: "none",
            md: "flex",
          },
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          p: {
            md: 5,
            lg: 7,
          },
          color: "#FFFFFF",
          bgcolor: "primary.main",

          "&::before": {
            content: '""',
            position: "absolute",
            width: 420,
            height: 420,
            top: -180,
            right: -180,
            borderRadius: "50%",
            bgcolor:
              "rgba(165, 167, 95, 0.18)",
          },

          "&::after": {
            content: '""',
            position: "absolute",
            width: 360,
            height: 360,
            bottom: -190,
            left: -150,
            borderRadius: "50%",
            border:
              "70px solid rgba(255, 255, 255, 0.04)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 3,
                bgcolor: "secondary.main",
                color: "secondary.contrastText",
              }}
            >
              <AccountBalanceRoundedIcon
                fontSize="large"
              />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: "#FFFFFF",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                }}
              >
                ONPF
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    "rgba(255, 255, 255, 0.76)",
                }}
              >
                Office National de la
                Propriété Foncière
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 560,
            my: 6,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "#FFFFFF",
              fontSize: {
                md: "2.25rem",
                lg: "2.8rem",
              },
              lineHeight: 1.15,
              mb: 2.5,
            }}
          >
            Gestion des inscriptions
            foncières
          </Typography>

          <Typography
            sx={{
              color:
                "rgba(255, 255, 255, 0.78)",
              lineHeight: 1.8,
              fontSize: "1.05rem",
              mb: 5,
            }}
          >
            Une plateforme interne conçue
            pour centraliser, sécuriser et
            suivre le traitement des demandes
            d’inscription foncière.
          </Typography>

          <Stack spacing={3}>
            <FeatureItem
              icon={
                <AssignmentTurnedInRoundedIcon />
              }
              title="Traitement centralisé"
              description="Création, vérification, validation et clôture des demandes depuis une seule interface."
            />

            <FeatureItem
              icon={<HistoryRoundedIcon />}
              title="Traçabilité complète"
              description="Historique des statuts, des documents et des opérations réalisées par les agents."
            />

            <FeatureItem
              icon={<GppGoodRoundedIcon />}
              title="Accès sécurisé"
              description="Les fonctionnalités et les données sont accessibles selon le rôle de chaque utilisateur."
            />
          </Stack>
        </Box>

        <Typography
          variant="caption"
          sx={{
            position: "relative",
            zIndex: 1,
            color:
              "rgba(255, 255, 255, 0.62)",
          }}
        >
          Système d’automatisation des
          inscriptions foncières
        </Typography>
      </Box>

      {/* Partie formulaire */}

      <Box
        sx={{
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          py: {
            xs: 4,
            sm: 6,
          },
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            width: "100%",
          }}
        >
          {/* Identité visible sur mobile */}

          <Box
            sx={{
              display: {
                xs: "flex",
                md: "none",
              },
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <AccountBalanceRoundedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  color: "primary.main",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "0.05em",
                }}
              >
                ONPF
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Gestion foncière
              </Typography>
            </Box>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              width: "100%",
              maxWidth: 500,
              mx: "auto",
              p: {
                xs: 3,
                sm: 5,
              },
              borderColor: "divider",
              boxShadow:
                "0 18px 50px rgba(16, 56, 53, 0.09)",
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                }}
              >
                Bienvenue
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  lineHeight: 1.6,
                }}
              >
                Connectez-vous avec vos
                identifiants professionnels
                pour accéder à l’application.
              </Typography>
            </Box>

            <LoginForm />
          </Paper>

          <Typography
            variant="caption"
            align="center"
            color="text.secondary"
            sx={{
              mt: 3,
              display: "block",
            }}
          >
            © {new Date().getFullYear()} ONPF
            · Application interne sécurisée
          </Typography>

        </Container>
      </Box>
    </Box>
  );
}

export default LoginPage;