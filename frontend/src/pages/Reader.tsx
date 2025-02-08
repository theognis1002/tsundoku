import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  CircularProgress,
  Paper,
  Typography,
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
          }}
        >
          {isLoading ? (
            <CircularProgress />
          ) : chapterContent ? (
            <>
              <Typography variant="h4" gutterBottom>
                {chapterContent.title}
              </Typography>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Typography>{chapterContent.summary}</Typography>
              </Paper>
              {chapterContent.content && (
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Full Content
                  </Typography>
                  <Typography>{chapterContent.content}</Typography>
                </Paper>
              )}
            </>
          ) : (
            <div>Select a chapter to begin reading</div>
          )}
        </Box>
      </Box>
    </Box>
  );
}
