import {
  AppBar,
  Avatar,
  Box,
  Chip,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import {
  ROLE_LABELS,
} from "../../utils/roles";

interface NavbarProps {
  drawerWidth: number;
  onMenuClick: () => void;
}

function Navbar({
  drawerWidth,
  onMenuClick,
}: NavbarProps) {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  const initials = user
    ? `${user.prenom.charAt(
        0
      )}${user.nom.charAt(0)}`.toUpperCase()
    : "U";

  return (
    <AppBar
      position="fixed"
      sx={{
        width: {
          md: `calc(100% - ${drawerWidth}px)`,
        },
        ml: {
          md: `${drawerWidth}px`,
        },
        bgcolor:
          "rgba(255, 255, 255, 0.96)",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(12px)",
        zIndex: (theme) =>
          theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight:
            "72px !important",
          px: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        {/* Partie gauche */}

        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          sx={{
            display: {
              md: "none",
            },
            mr: 1,
            color: "primary.main",
          }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            minWidth: 0,
          }}
        >
          <AccountBalanceRoundedIcon
            sx={{
              display: {
                xs: "none",
                sm: "block",
                md: "none",
              },
              color: "primary.main",
            }}
          />

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
                color: "primary.main",
                display: {
                  xs: "block",
                  md: "none",
                },
              }}
            >
              ONPF
            </Typography>

            <Typography
              variant="body1"
              noWrap
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
                fontWeight: 700,
              }}
            >
              Système de gestion des inscriptions foncières
            </Typography>

            <Typography
              variant="caption"
              noWrap
              color="text.secondary"
              sx={{
                display: {
                  xs: "none",
                  lg: "block",
                },
              }}
            >
              Office National de la Propriété Foncière
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Utilisateur */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "primary.main",
              fontSize: "0.82rem",
              fontWeight: 800,
            }}
          >
            {initials}
          </Avatar>

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
              textAlign: "left",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {user?.prenom} {user?.nom}
            </Typography>

            {user && (
              <Chip
                label={
                  ROLE_LABELS[user.role]
                }
                size="small"
                sx={{
                  mt: 0.4,
                  height: 21,
                  fontSize: "0.66rem",
                  color: "primary.main",
                  bgcolor:
                    "rgba(10, 74, 70, 0.08)",
                }}
              />
            )}
          </Box>

          <Tooltip title="Déconnexion">
            <IconButton
              onClick={handleLogout}
              aria-label="Se déconnecter"
              sx={{
                color: "error.main",

                "&:hover": {
                  bgcolor:
                    "rgba(198, 40, 40, 0.08)",
                },
              }}
            >
              <LogoutRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;