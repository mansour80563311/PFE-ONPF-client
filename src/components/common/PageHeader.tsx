import {
  Box,
  Breadcrumbs,
  Typography,
} from "@mui/material";

import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

import type {
  ReactNode,
} from "react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 4,
      }}
    >
      {breadcrumbs &&
        breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={
              <NavigateNextRoundedIcon
                fontSize="small"
              />
            }
            aria-label="Fil d’Ariane"
            sx={{
              mb: 1.5,

              "& .MuiBreadcrumbs-separator":
                {
                  color: "text.secondary",
                },
            }}
          >
            {breadcrumbs.map(
              (breadcrumb, index) => (
                <Typography
                  key={`${breadcrumb.label}-${index}`}
                  component={
                    breadcrumb.onClick
                      ? "button"
                      : "span"
                  }
                  type={
                    breadcrumb.onClick
                      ? "button"
                      : undefined
                  }
                  onClick={
                    breadcrumb.onClick
                  }
                  variant="body2"
                  sx={{
                    p: 0,
                    border: 0,
                    background: "none",
                    fontFamily: "inherit",
                    color:
                      breadcrumb.onClick
                        ? "primary.main"
                        : "text.secondary",
                    cursor:
                      breadcrumb.onClick
                        ? "pointer"
                        : "default",

                    "&:hover": {
                      textDecoration:
                        breadcrumb.onClick
                          ? "underline"
                          : "none",
                    },
                  }}
                >
                  {breadcrumb.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}

      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent:
            "space-between",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.75,
            minWidth: 0,
          }}
        >
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                borderRadius: 2.5,
                color: "primary.main",
                bgcolor:
                  "rgba(10, 74, 70, 0.10)",

                "& svg": {
                  fontSize: 27,
                },
              }}
            >
              {icon}
            </Box>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: {
                  xs: "1.65rem",
                  sm: "1.85rem",
                },
                lineHeight: 1.25,
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.75,
                  maxWidth: 760,
                  lineHeight: 1.6,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {actions && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
              width: {
                xs: "100%",
                sm: "auto",
              },

              "& > *": {
                width: {
                  xs: "100%",
                  sm: "auto",
                },
              },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default PageHeader;