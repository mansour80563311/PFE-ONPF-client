import React from "react";
import ReactDOM from "react-dom/client";

import {
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import {
  ToastContainer,
} from "react-toastify";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import onpfTheme from "./theme/onpfTheme";

import "./index.css";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <ThemeProvider theme={onpfTheme}>
      <CssBaseline />

      <AuthProvider>
        <App />

        <ToastContainer
          position="top-right"
          autoClose={3500}
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);