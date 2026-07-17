import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  title: string;
  action?: ReactNode;
}

function PageHeader({ title, action }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography variant="h4">
        {title}
      </Typography>

      {action}
    </Box>
  );
}

export default PageHeader;