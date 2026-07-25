import {
  Box,
  Toolbar,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const DRAWER_WIDTH = 270;

function MainLayout() {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const handleMenuClick = () => {
    setMobileOpen(
      (currentValue) => !currentValue
    );
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Navbar
        drawerWidth={DRAWER_WIDTH}
        onMenuClick={handleMenuClick}
      />

      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={handleDrawerClose}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: {
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
        }}
      >
        {/* Espace réservé à la Navbar fixe */}

        <Toolbar
          sx={{
            minHeight:
              "72px !important",
          }}
        />

        <Box
          sx={{
            width: "100%",
            maxWidth: 1600,
            mx: "auto",
            p: {
              xs: 2,
              sm: 3,
              lg: 4,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;