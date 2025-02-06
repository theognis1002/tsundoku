package server

import (
	"fmt"
	"log"

	"github.com/taylorskalyo/goreader/epub"
)

// ProcessEpub reads an EPUB file and prints all chapter titles
func ProcessEpub(filePath string) error {
	book, err := epub.OpenReader(filePath)
	if err != nil {
		return fmt.Errorf("failed to open EPUB: %v", err)
	}
	defer book.Close()

	log.Printf("Book Title: %s\n", book.Rootfiles[0].Title)
	log.Printf("Book Author: %s\n", book.Rootfiles[0].Creator)
	log.Printf("Book Language: %s\n", book.Rootfiles[0].Language)
	log.Printf("Book Identifier: %s\n", book.Rootfiles[0].Identifier)
	log.Printf("Book Description: %s\n", book.Rootfiles[0].Description)
	log.Printf("Book Subject: %s\n", book.Rootfiles[0].Subject)
	log.Printf("Book Contributor: %s\n", book.Rootfiles[0].Contributor)
	// Print out spine items which represent the reading order
	log.Println("\nChapters/Sections in Reading Order:")

	spine := book.Rootfiles[0].Spine
	for i, itemref := range spine.Itemrefs {
		// Find the manifest item that matches this itemref
		for _, item := range book.Rootfiles[0].Manifest.Items {
			if item.ID == itemref.IDREF {
				log.Printf("Chapter %d: %s\n", i+1, item.HREF)
				break
			}
		}
	}

	return nil
}
