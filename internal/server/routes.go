package server

import (
	"log"
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

func (s *Server) uploadHandler(c *gin.Context) {
	// Get the file from the request
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file received"})
		return
	}

	// Validate file type
	contentType := file.Header.Get("Content-Type")
	if contentType != "application/pdf" && contentType != "text/plain" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only PDF and TXT files are allowed"})
		return
	}

	fileContent, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}
	defer fileContent.Close()

	err = s.db.SaveFile(file.Filename, contentType, fileContent)
	if err != nil {
		log.Fatalln(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file to database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully"})
}
