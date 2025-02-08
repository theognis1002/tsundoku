import { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";

interface Chapter {
  id: number;
  title: string;
  order: number;
  book_id: number;
  created_at: string;
  updated_at: string;
}

interface ChapterListProps {
  bookId: string;
  onChapterSelect: (chapterId: string) => void;
}

export function ChapterList({ bookId, onChapterSelect }: ChapterListProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch(
          `http://localhost:${
            import.meta.env.VITE_PORT
          }/books/${bookId}/chapters`
        );
        if (response.ok) {
          const data = await response.json();
          setChapters(data.sort((a: Chapter, b: Chapter) => a.order - b.order));
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };

    fetchChapters();
  }, [bookId]);

  const handleChapterClick = async (chapterId: string) => {
    setSelectedChapter(chapterId);
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:${
          import.meta.env.VITE_PORT
        }/chapters/${chapterId}/content`
      );

      if (response.ok) {
        onChapterSelect(chapterId);
      } else {
        console.error("Failed to fetch chapter content");
      }
    } catch (error) {
      console.error("Error fetching chapter content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          position: "relative",
          height: "100vh",
        },
      }}
    >
      <Box sx={{ overflow: "auto", height: "100%" }}>
        <Typography variant="h5" sx={{ px: 2, mb: 2, mt: 2 }}>
          Chapters
        </Typography>
        <List>
          {chapters.map((chapter) => (
            <ListItem key={chapter.id} disablePadding>
              <ListItemButton
                selected={selectedChapter === chapter.id.toString()}
                onClick={() => handleChapterClick(chapter.id.toString())}
                disabled={isLoading}
              >
                <ListItemText primary={chapter.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
