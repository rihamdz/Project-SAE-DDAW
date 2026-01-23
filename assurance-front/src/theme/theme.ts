import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1b4ed8" },
    background: { default: "#f6f7fb", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#475569" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(","),
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 12, paddingInline: 14, paddingBlock: 10 } },
    },
  },
});
