import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  CircularProgress,
  Paper,
  Typography,
  Divider,
  IconButton,
  Collapse,
  Button,
} from "@mui/material";
import { ChapterList } from "../components/ChapterList";
import { useParams, Link } from "react-router-dom";
import tsundokuLogo from "../assets/logo.png";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface ChapterContent {
  content: string | null;
  summary: string;
  title: string;
  id: string;
}

export function Reader() {
  const { bookId } = useParams();
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleSummarize = async () => {
    if (!chapterContent || isSummarizing) return;

    setIsSummarizing(true);
    try {
      const response = await fetch(
        `http://localhost:${import.meta.env.VITE_PORT}/chapters/${
          chapterContent.id
        }/summarize`,
        { method: "POST" }
      );

      if (response.ok) {
        const data = await response.json();
        setChapterContent((prev) =>
          prev ? { ...prev, summary: data.summary } : null
        );
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsSummarizing(false);
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
                "& p": {
                  fontFamily: "Helvetica, Arial, sans-serif",
                },
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {chapterContent.title}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  mb: 2,
                }}
                onClick={handleExpandClick}
              >
                <Typography variant="subtitle2">
                  {expanded ? "Collapse" : "Expand"}
                </Typography>
                <IconButton>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expanded}>
                <Box sx={{ maxWidth: "100%", textAlign: "justify" }}>
                  {chapterContent.content && (
                    <>
                      {expanded ? (
                        // Full content with paragraphs
                        chapterContent.content
                          .split("\n")
                          .map(
                            (paragraph, index) =>
                              paragraph.trim() && (
                                <Typography key={index}>{paragraph}</Typography>
                              )
                          )
                      ) : (
                        // Preview of first paragraph
                        <Typography
                          sx={{
                            textIndent: "2em",
                            mb: 1.5,
                            textAlign: "justify",
                            fontFamily: "inherit",
                          }}
                        >
                          {`${chapterContent.content
                            .split("\n")[0]
                            .slice(0, 200)}...`}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mt: 2,
                          cursor: "pointer",
                        }}
                        onClick={handleExpandClick}
                      >
                        <Typography variant="subtitle2" color="primary">
                          {expanded ? "Show Less" : "Read More"}
                        </Typography>
                        <IconButton size="small">
                          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </>
                  )}
                </Box>
              </Collapse>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ backgroundColor: "#f5f5f5", p: 3, borderRadius: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" color="primary">
                    Summary
                  </Typography>
                  {chapterContent?.summary === null && (
                    <Button
                      onClick={handleSummarize}
                      disabled={isSummarizing}
                      variant="outlined"
                      size="small"
                    >
                      {isSummarizing ? "Generating..." : "Generate Summary"}
                    </Button>
                  )}
                </Box>
                <Typography>
                  {isSummarizing ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} />
                      <span>Generating summary...</span>
                    </Box>
                  ) : (
                    chapterContent.summary
                  )}
                </Typography>
              </Box>
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
