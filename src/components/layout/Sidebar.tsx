import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import RoleGuard from "../common/RoleGuard";
import { ROLES } from "../../utils/roles";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 220,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />

    <List>
        <ListItemButton
            onClick={() => navigate("/dashboard")}
  >
        <ListItemText primary="Dashboard" />
        </ListItemButton>
        <RoleGuard roles={[ROLES.ADMIN]}>
            <ListItemButton
                onClick={() => navigate("/users")}
            >
        <ListItemText primary="Utilisateurs" />
        </ListItemButton>
        </RoleGuard>

    </List>
    </Drawer>
  );
}

export default Sidebar;