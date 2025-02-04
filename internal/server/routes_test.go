package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestMainHandler(t *testing.T) {
	s := &Server{}
	r := gin.New()
	r.GET("/", s.MainHandler)
	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	expected := "{\"message\":\"📚\"}"
	if rr.Body.String() != expected {
		t.Errorf("Handler returned unexpected body: got %v want %v", rr.Body.String(), expected)
	}
}
