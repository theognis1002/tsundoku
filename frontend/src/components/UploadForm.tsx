import { ChangeEvent, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  Stack,
  LinearProgress,
} from "@mui/material";
import { UploadFile, Description } from "@mui/icons-material";
import "./UploadForm.css";
import { useNavigate } from "react-router-dom";

interface UploadFormProps {
  onUploadSuccess?: () => void;
}

interface UploadResponse {
  message: string;
  filename: string;
  chapters: string[];
  book_id: number;
}

export function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/epub+zip"
      ) {
        setFile(selectedFile);
        setUploadStatus("");
      } else {
        setUploadStatus("Please select a PDF or EPUB file");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file first");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `http://localhost:${import.meta.env.VITE_PORT}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      setIsUploading(false);
      if (response.ok) {
        const data: UploadResponse = await response.json();
        setUploadStatus("File uploaded successfully!");
        setFile(null);
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        onUploadSuccess?.();
        navigate(`/reader/${data.book_id}`);
      } else {
        setUploadStatus("Upload failed!");
      }
    } catch (error) {
      setIsUploading(false);
      setUploadStatus("Error uploading file!");
      console.error("Upload error:", error);
    }

    // Clear status message after 30 seconds
    setTimeout(() => {
      setUploadStatus("");
    }, 30000);
  };

  return (
    <Paper elevation={3} className="upload-paper">
      <Stack spacing={2}>
        <Box className="upload-dropzone" component="label">
          <input
            type="file"
            accept=".pdf,.epub"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <UploadFile className="upload-icon" />
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Click to upload or drag and drop
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PDF or EPUB files only
          </Typography>
        </Box>

        {file && (
          <Box className="file-preview">
            <Description color="action" />
            <Typography variant="body2" color="text.secondary">
              {file.name}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="upload-button"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>

        {isUploading && (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
          </Box>
        )}

        {uploadStatus && (
          <Alert
            severity={
              uploadStatus.includes("successfully") ? "success" : "error"
            }
            className="status-alert"
          >
            {uploadStatus}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
