import { ChangeEvent, useState } from "react";
import { Box, Button, Paper, Typography, Alert, Stack } from "@mui/material";
import { UploadFile, Description } from "@mui/icons-material";
import "./UploadForm.css";

interface UploadFormProps {
  onUploadSuccess?: () => void;
}

export function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "text/plain"
      ) {
        setFile(selectedFile);
        setUploadStatus("");
      } else {
        setUploadStatus("Please select a PDF or TXT file");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file first");
      return;
    }

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

      if (response.ok) {
        setUploadStatus("File uploaded successfully!");
        setFile(null);
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        onUploadSuccess?.();
      } else {
        setUploadStatus("Upload failed");
      }
    } catch (error) {
      setUploadStatus("Error uploading file");
      console.error("Upload error:", error);
    }
  };

  return (
    <Paper elevation={3} className="upload-paper">
      <Stack spacing={2}>
        <Box className="upload-dropzone" component="label">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <UploadFile className="upload-icon" />
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Click to upload or drag and drop
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PDF or TXT files only
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
          disabled={!file}
          className="upload-button"
        >
          Upload
        </Button>

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
