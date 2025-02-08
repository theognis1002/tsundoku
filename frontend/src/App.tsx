import { BrowserRouter, Routes, Route } from "react-router-dom";
import tsundokuLogo from "./assets/logo.png";
import { UploadForm } from "./components/UploadForm";
import { Reader } from "./pages/Reader";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
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
                    marginBottom: "2rem",
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
                  <h1
                    style={{
                      fontFamily: "Rampart One, sans-serif",
                      margin: "0",
                    }}
                  >
                    tsundoku (積ん読)
                  </h1>
                  <p
                    style={{
                      color: "#6B7280",
                    }}
                  >
                    n. the phenomenon of acquiring books but letting them pile
                    up in one's home without reading them
                  </p>
                </div>
                <UploadForm />
              </div>
            }
          />
          <Route path="/reader/:bookId" element={<Reader />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
