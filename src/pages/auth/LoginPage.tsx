import { Box } from "@mui/material";

import LoginForm from "../../components/auth/LoginForm";

function LoginPage() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <LoginForm />
    </Box>
  );
}

export default LoginPage;