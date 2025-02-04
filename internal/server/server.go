package server

import (
	"net/http"

	"tsundoku/internal/database"

	"github.com/gin-gonic/gin"
)

type Server struct {
	router *gin.Engine
	db     database.Service
}

func NewServer(db database.Service) *http.Server {
	s := &Server{
		router: gin.Default(),
		db:     db,
	}
	s.routes()

	return &http.Server{
		Addr:    ":8080",
		Handler: s.router,
	}
}

func (s *Server) HelloWorld1Handler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Hello World"})
}

func (s *Server) routes() {
	s.router.GET("/", s.HelloWorldHandler)
}
