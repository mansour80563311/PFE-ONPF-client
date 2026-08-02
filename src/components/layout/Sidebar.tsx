import {
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import type {
  ReactNode,
} from "react";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  ROLE_LABELS,
  ROLES,
} from "../../utils/roles";

import type {
  Role,
} from "../../utils/roles";

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: ReactNode;
  roles: Role[];
}

const navigationItems: NavigationItem[] = [
  {
    label: "Tableau de bord",
    path: "/dashboard",
    icon: <DashboardRoundedIcon />,
    roles: [
      ROLES.ADMIN,
      ROLES.AGENT,
      ROLES.RESPONSABLE,
      ROLES.CAISSIER,
    ],
  },
  {
    label: "Utilisateurs",
    path: "/users",
    icon: <GroupsRoundedIcon />,
    roles: [
      ROLES.ADMIN,
    ],
  },
  {
    label: "Demandes",
    path: "/demandes",
    icon: <AssignmentRoundedIcon />,
    roles: [
      ROLES.ADMIN,
      ROLES.AGENT,
      ROLES.RESPONSABLE,
    ],
  },
  {
    label: "Demandes à encaisser",
    path: "/demandes",
    icon: <PaymentsRoundedIcon />,
    roles: [
      ROLES.CAISSIER,
    ],
  },
  {
    label: "Journaux de clôture",
    path: "/journaux-cloture",
    icon: <LockClockRoundedIcon />,
    roles: [
      ROLES.ADMIN,
      ROLES.RESPONSABLE,
    ],
  },
];

function Sidebar({
  drawerWidth,
  mobileOpen,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const handleNavigation = (
    path: string
  ) => {
    navigate(path);
    onClose();
  };

  const isActive = (
    path: string
  ): boolean => {
    if (path === "/dashboard") {
      return (
        location.pathname === "/dashboard"
      );
    }

    return location.pathname.startsWith(
      path
    );
  };

  const visibleItems =
    navigationItems.filter((item) =>
      user
        ? item.roles.includes(user.role)
        : false
    );

  const initials = user
    ? `${user.prenom.charAt(
        0
      )}${user.nom.charAt(0)}`.toUpperCase()
    : "U";

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Identité de l’application */}

      <Box
        sx={{
          minHeight: 72,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AccountBalanceRoundedIcon />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 800,
              color: "primary.main",
              lineHeight: 1.15,
              letterSpacing: "0.04em",
            }}
          >
            ONPF
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              lineHeight: 1.25,
            }}
          >
            Gestion des inscriptions foncières
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}

      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 800,
            letterSpacing: "0.1em",
          }}
        >
          NAVIGATION
        </Typography>
      </Box>

      <List
        sx={{
          px: 1.5,
          py: 0,
        }}
      >
        {visibleItems.map((item) => {
          const selected = isActive(
            item.path
          );

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() =>
                handleNavigation(item.path)
              }
              sx={{
                minHeight: 48,
                mb: 0.75,
                px: 1.5,
                borderRadius: 2.5,
                color: selected
                  ? "primary.main"
                  : "text.secondary",

                "& .MuiListItemIcon-root": {
                  color: "inherit",
                },

                "&.Mui-selected": {
                  bgcolor:
                    "rgba(10, 74, 70, 0.10)",
                  color: "primary.main",

                  "&:hover": {
                    bgcolor:
                      "rgba(10, 74, 70, 0.14)",
                  },

                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 10,
                    bottom: 10,
                    width: 4,
                    borderRadius: 4,
                    bgcolor: "primary.main",
                  },
                },

                "&:hover": {
                  bgcolor:
                    "rgba(10, 74, 70, 0.06)",
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.92rem",
                      fontWeight: selected
                        ? 700
                        : 600,
                    },
                  },
                }}
              />

            </ListItemButton>
          );
        })}
      </List>

      {/* Utilisateur connecté */}

      <Box
        sx={{
          mt: "auto",
          p: 2,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            bgcolor: "#F7FAF9",
            borderColor: "divider",
            borderRadius: 2.5,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "primary.main",
              fontSize: "0.85rem",
              fontWeight: 800,
            }}
          >
            {initials}
          </Avatar>

          <Box
            sx={{
              minWidth: 0,
              flexGrow: 1,
            }}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight: 700,
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
                variant="outlined"
                sx={{
                  mt: 0.5,
                  height: 22,
                  fontSize: "0.68rem",
                  color: "primary.main",
                  borderColor:
                    "rgba(10, 74, 70, 0.35)",
                  bgcolor:
                    "rgba(10, 74, 70, 0.04)",
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: {
          md: drawerWidth,
        },
        flexShrink: {
          md: 0,
        },
      }}
    >
      {/* Menu mobile */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRadius: 0,
            top: 72,
            height: "calc(100% - 72px)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Menu ordinateur */}

      <Drawer
        variant="permanent"
        open
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRadius: 0,
            borderRight:
              "1px solid #DCE5E3",
            boxShadow:
              "4px 0 18px rgba(16, 56, 53, 0.035)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;