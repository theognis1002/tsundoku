package server

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/dslipak/pdf"
)

// processPDF handles PDF file processing and text extraction
func (s *Server) processPDF(fileContent io.Reader, filename string) error {
	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, fileContent); err != nil {
		return fmt.Errorf("failed to copy file content: %v", err)
	}

	tmpFile, err := createTempPDFFile(buf.Bytes())
	if err != nil {
		return err
	}
	defer os.Remove(tmpFile.Name())

	if err := extractPDFText(tmpFile.Name()); err != nil {
		return err
	}

	return s.db.SaveFile(filename, "application/pdf", bytes.NewReader(buf.Bytes()))
}

// createTempPDFFile creates a temporary file with the given content
func createTempPDFFile(content []byte) (*os.File, error) {
	tmpFile, err := os.CreateTemp("", "pdf-*.pdf")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp file: %v", err)
	}

	if _, err := tmpFile.Write(content); err != nil {
		os.Remove(tmpFile.Name())
		return nil, fmt.Errorf("failed to write temp file: %v", err)
	}

	return tmpFile, nil
}

// extractPDFText extracts and processes text from a PDF file
func extractPDFText(filepath string) error {
	r, err := pdf.Open(filepath)
	if err != nil {
		return fmt.Errorf("failed to open PDF: %v", err)
	}

	for pageIndex := 1; pageIndex <= r.NumPage(); pageIndex++ {
		if err := processPage(r.Page(pageIndex)); err != nil {
			return err
		}
	}
	return nil
}

// processPage extracts text from a single PDF page
func processPage(p pdf.Page) error {
	if p.V.IsNull() {
		return nil
	}

	texts := p.Content().Text
	var lastText pdf.Text
	var word string

	for _, text := range texts {
		if isSameWord(lastText, text) {
			word += text.S
		} else {
			if word != "" {
				log.Printf("Text: %s\nFont: %s\nFontSize: %.2f\nX: %.2f\nY: %.2f\nWidth: %.2f\n",
					word,
					lastText.Font,
					lastText.FontSize,
					lastText.X,
					lastText.Y,
					lastText.W,
				)
			}
			word = text.S
		}
		lastText = text
	}

	if word != "" {
		log.Printf("Text: %s\nFont: %s\nFontSize: %.2f\nX: %.2f\nY: %.2f\nWidth: %.2f",
			word,
			lastText.Font,
			lastText.FontSize,
			lastText.X,
			lastText.Y,
			lastText.W,
		)
	}
	return nil
}

// isSameWord checks if two text elements are part of the same word
func isSameWord(last, current pdf.Text) bool {
	return last.Y == current.Y && (current.X-(last.X+last.W)) < 20
}
