package server

import (
	"fmt"
	"log"
	"mime/multipart"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Add your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.GET("/", s.MainHandler)

	r.GET("/health", s.healthHandler)

	r.POST("/upload", s.uploadHandler)

	return r
}

func (s *Server) MainHandler(c *gin.Context) {
	resp := make(map[string]string)
	resp["message"] = "📚"

	c.JSON(http.StatusOK, resp)
}

func (s *Server) healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, s.db.Health())
}

// uploadHandler handles file upload requests
func (s *Server) uploadHandler(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file received"})
		return
	}

	if err := s.validateFileType(file); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fileContent, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}
	defer fileContent.Close()

	if file.Header.Get("Content-Type") == "application/pdf" {
		resultChan := make(chan error)
		go func() {
			resultChan <- s.processPDF(fileContent, file.Filename)
		}()

		if err := <-resultChan; err != nil {
			log.Printf("Error processing file: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := s.db.SaveFile(file.Filename, file.Header.Get("Content-Type"), fileContent); err != nil {
			log.Printf("Error saving file: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file to database"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully"})
}

// validateFileType checks if the uploaded file type is supported
func (s *Server) validateFileType(file *multipart.FileHeader) error {
	contentType := file.Header.Get("Content-Type")
	if contentType != "application/pdf" && contentType != "text/plain" {
		return fmt.Errorf("only PDF and TXT files are allowed")
	}
	return nil
}
