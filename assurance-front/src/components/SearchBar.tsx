import { TextField } from "@mui/material";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      fullWidth
      size="small"
    />
  );
}
