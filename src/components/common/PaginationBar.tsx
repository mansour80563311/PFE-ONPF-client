import { Pagination, Stack } from "@mui/material";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function PaginationBar({
  page,
  totalPages,
  onChange,
}: Props) {
  return (
    <Stack
    sx={{
        mt: 3,
        display: "flex",
        alignItems: "center",
    }}
    >
      <Pagination
        page={page}
        count={totalPages}
        color="primary"
        onChange={(_, value) => onChange(value)}
      />
    </Stack>
  );
}

export default PaginationBar;