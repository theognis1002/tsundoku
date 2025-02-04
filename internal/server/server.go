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

	handler := s.RegisterRoutes()
	return &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}
}
