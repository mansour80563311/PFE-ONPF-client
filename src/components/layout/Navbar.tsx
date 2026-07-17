import {
  AppBar,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";

import { useNavigate } from "react-router-dom";


import { useAuth } from "../../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();

const {
    user,
    logout
} = useAuth();


const handleLogout = () => {

  logout();

  navigate("/");

};

  return (
    <AppBar position="static">
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">
          ONPF
        </Typography>

        <div>
          <Typography
            component="span"
            sx={{
              mr: 2,
            }}
          >
            {user?.prenom} {user?.nom}
          </Typography>

          <Button
            color="inherit"
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;