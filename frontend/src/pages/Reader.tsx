import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  CircularProgress,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import { ChapterList } from "../components/ChapterList";
import { useParams, Link } from "react-router-dom";
import tsundokuLogo from "../assets/logo.png";

interface ChapterContent {
  content: string | null;
  summary: string;
  title: string;
}

export function Reader() {
  const { bookId } = useParams();
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChapterSelect = async (chapterId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:${
          import.meta.env.VITE_PORT
        }/chapters/${chapterId}/content`
      );

      if (response.ok) {
        const data: ChapterContent = await response.json();
        setChapterContent(data);
      }
    } catch (error) {
      console.error("Error fetching chapter content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!bookId) {
    return <div>Book not found</div>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "white",
          color: "black",
          boxShadow: "none",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <Toolbar>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                py: 1,
              }}
            >
              <img
                src={tsundokuLogo}
                alt="tsundoku logo"
                style={{
                  width: "6rem",
                  height: "auto",
                  marginRight: "1.5rem",
                  marginBottom: "1rem",
                }}
              />
              <h1
                style={{
                  fontFamily: "Rampart One, sans-serif",
                  margin: 0,
                }}
              >
                tsundoku (積ん読)
              </h1>
            </Box>
          </Link>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1, position: "relative" }}>
        <ChapterList bookId={bookId} onChapterSelect={handleChapterSelect} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ml: "240px",
            overflowY: "auto",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : chapterContent ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                backgroundColor: "transparent",
                "& p": { lineHeight: 1.8, fontSize: "1.1rem" },
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {chapterContent.title}
              </Typography>

              {chapterContent.content && (
                <>
                  <Typography component="div" sx={{ whiteSpace: "pre-wrap" }}>
                    {chapterContent.content.split("\n").map(
                      (paragraph, index) =>
                        paragraph.trim() && (
                          <Typography key={index} paragraph>
                            {paragraph}
                          </Typography>
                        )
                    )}
                  </Typography>

                  <Divider sx={{ my: 4 }} />

                  <Box
                    sx={{ backgroundColor: "#f5f5f5", p: 3, borderRadius: 1 }}
                  >
                    <Typography variant="h6" gutterBottom color="primary">
                      Summary
                    </Typography>
                    <Typography>{chapterContent.summary}</Typography>
                  </Box>
                </>
              )}
            </Paper>
          ) : (
            <Box sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
              <Typography>Select a chapter to begin reading</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
