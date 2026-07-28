import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import type {
  ReactNode,
} from "react";

interface Props {
  title: string;
  value: number;
  icon: ReactNode;
  description?: string;
}

function DashboardStatCard({
  title,
  value,
  icon,
  description,
}: Props) {
  const formattedValue =
    new Intl.NumberFormat(
      "fr-FR"
    ).format(value);

  return (
    <Paper
      variant="outlined"
      sx={{
        height: "100%",
        p: 2.5,
        borderColor: "divider",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",

        "&:hover": {
          transform:
            "translateY(-2px)",
          borderColor:
            "rgba(10, 74, 70, 0.28)",
          boxShadow:
            "0 10px 26px rgba(16, 56, 53, 0.07)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              fontWeight: 700,
              lineHeight: 1.45,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {formattedValue}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2.5,
            color: "primary.main",
            bgcolor:
              "rgba(10, 74, 70, 0.10)",

            "& svg": {
              fontSize: 25,
            },
          }}
        >
          {icon}
        </Box>
      </Box>

      {description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 1.5,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      )}
    </Paper>
  );
}

export default DashboardStatCard;