import { useState, useCallback } from "react";
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
import { useDropzone } from "react-dropzone";
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
  const [fileError, setFileError] = useState<string>("");
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Clear previous errors
    setFileError("");

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      setFileError("Only EPUB files are supported currently");
      setFile(null);
      return;
    }

    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // "application/pdf": [".pdf"],
      "application/epub+zip": [".epub"],
    },
    multiple: false,
  });

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
        <Box
          {...getRootProps()}
          className={`upload-dropzone ${
            isDragActive ? "dropzone-active" : ""
          } ${fileError ? "dropzone-error" : ""}`}
        >
          <input {...getInputProps()} />
          <UploadFile className="upload-icon" />
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {isDragActive
              ? "Drop the file here"
              : "Click to upload or drag and drop"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PDF or EPUB files only
          </Typography>
        </Box>

        {fileError && (
          <Alert severity="error" className="status-alert">
            {fileError}
          </Alert>
        )}

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
