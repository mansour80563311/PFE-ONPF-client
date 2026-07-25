import {
  createTheme,
} from "@mui/material/styles";

const onpfTheme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#0A4A46",
      light: "#34726E",
      dark: "#063633",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#A5A75F",
      light: "#C3C58D",
      dark: "#77793D",
      contrastText: "#172A2A",
    },

    success: {
      main: "#2E7D57",
      light: "#E7F5ED",
      dark: "#1F5B3E",
    },

    warning: {
      main: "#C47B16",
      light: "#FFF4DF",
      dark: "#8C560E",
    },

    error: {
      main: "#C62828",
      light: "#FDECEC",
      dark: "#8E1B1B",
    },

    info: {
      main: "#287D9B",
      light: "#E8F4F8",
      dark: "#195B72",
    },

    background: {
      default: "#F4F7F6",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#172A2A",
      secondary: "#60706F",
    },

    divider: "#DCE5E3",
  },

  typography: {
    fontFamily: [
      "Segoe UI",
      "Noto Sans",
      "Tahoma",
      "Arial",
      "sans-serif",
    ].join(","),

    h1: {
      fontWeight: 700,
      color: "#172A2A",
    },

    h2: {
      fontWeight: 700,
      color: "#172A2A",
    },

    h3: {
      fontWeight: 700,
      color: "#172A2A",
    },

    h4: {
      fontWeight: 700,
      fontSize: "1.75rem",
      color: "#172A2A",
    },

    h5: {
      fontWeight: 700,
      color: "#172A2A",
    },

    h6: {
      fontWeight: 650,
      color: "#172A2A",
    },

    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          minWidth: 320,
          backgroundColor: "#F4F7F6",
          color: "#172A2A",
        },

        "*": {
          boxSizing: "border-box",
        },

        "*::before": {
          boxSizing: "border-box",
        },

        "*::after": {
          boxSizing: "border-box",
        },

        a: {
          color: "inherit",
        },
      },
    },

    MuiButton: {
    defaultProps: {
        disableElevation: true,
    },

    styleOverrides: {
        root: {
        minHeight: 42,
        borderRadius: 10,
        paddingLeft: 18,
        paddingRight: 18,
        fontWeight: 700,

        variants: [
            {
            props: {
                variant: "contained",
                color: "primary",
            },

            style: {
                boxShadow: "none",

                "&:hover": {
                boxShadow:
                    "0 6px 16px rgba(10, 74, 70, 0.18)",
                },
            },
            },
        ],
        },
    },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 14,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: "1px solid #E1E9E7",
          boxShadow:
            "0 4px 18px rgba(16, 56, 53, 0.06)",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#FFFFFF",

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#C9D6D3",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#34726E",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderWidth: 2,
              borderColor: "#0A4A46",
            },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#60706F",

          "&.Mui-focused": {
            color: "#0A4A46",
          },
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #E1E9E7",
          boxShadow: "none",
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#EAF1EF",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#294643",
          fontWeight: 700,
          whiteSpace: "nowrap",
        },

        body: {
          borderBottom:
            "1px solid #E7EEEC",
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td": {
            borderBottom: 0,
          },

          "&:hover": {
            backgroundColor: "#F7FAF9",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          alignItems: "center",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: "0.78rem",
        },
      },
    },
  },
});

export default onpfTheme;