import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import type {
  ReactNode,
} from "react";

interface Props {
  title: string;
  value: number;
  icon: ReactNode;
}

function DashboardStatCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "action.hover",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default DashboardStatCard;