import {
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  loading = false,
}: Props) {
  return (
    <TextField
  fullWidth
  value={value}
  placeholder={placeholder}
  onChange={(e) => onChange(e.target.value)}
  sx={{ mb: 3 }}
  slotProps={{
    input: {
      endAdornment: loading ? (
        <InputAdornment position="end">
          <CircularProgress size={18} />
        </InputAdornment>
      ) : undefined,
    },
  }}
/>
  );
}

export default SearchBar;