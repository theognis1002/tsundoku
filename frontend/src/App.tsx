import tsundokuLogo from "./assets/logo.png";
import { UploadForm } from "./components/UploadForm";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({});

function App() {
  const fetchData = () => {
    fetch(`http://localhost:${import.meta.env.VITE_PORT}/`)
      .then((response) => response.text())
      .catch((error) => console.error("Error fetching data:", error));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <a href="/">
            <img
              src={tsundokuLogo}
              className="logo"
              alt="tsundoku logo"
              style={{ width: "12rem", height: "auto" }}
            />
          </a>
          <h1 style={{ fontFamily: "Rampart One, sans-serif" }}>
            tsundoku (積ん読)
          </h1>
          <p
            style={{
              color: "#6B7280",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            n. the phenomenon of acquiring books but letting them pile up in
            one's home without reading them
          </p>
        </div>

        <UploadForm onUploadSuccess={fetchData} />
      </div>
    </ThemeProvider>
  );
}

export default App;
