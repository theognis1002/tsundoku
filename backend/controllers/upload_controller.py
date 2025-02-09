import asyncio
import logging
from pathlib import Path

from bs4 import BeautifulSoup
from ebooklib import epub
from fastapi import UploadFile
from sqlalchemy.orm import Session

from backend.models.book import Book, Chapter

logger = logging.getLogger(__name__)


class UploadController:
    """Controller for handling file uploads"""

    UPLOAD_DIR = Path("uploads")
    ALLOWED_EXTENSION = ".epub"

    @staticmethod
    async def extract_chapter_names(epub_path: Path) -> list[str]:
        """
        Extract chapter names from an EPUB file using the table of contents asynchronously

        Args:
            epub_path: Path to the EPUB file

        Returns:
            List of chapter names
        """

        def _extract_chapters() -> list[str]:
            book = epub.read_epub(str(epub_path))
            chapters: list[str] = []

            # Extract chapters from table of contents
            for item in book.toc:
                title: str | None = None
                if isinstance(item, tuple):
                    title = item[0].title
                else:
                    title = item.title

                if title and title.strip():
                    chapters.append(title.strip())

            # If TOC is empty, fall back to scanning epub items
            if not chapters:
                for item in book.get_items():
                    if isinstance(item, epub.EpubHtml):
                        soup = BeautifulSoup(item.get_body_content(), "html.parser")
                        for heading in soup.find_all(["h1", "h2", "h3"]):
                            heading_text = heading.text
                            if heading_text and heading_text.strip():
                                chapters.append(heading_text.strip())

            return chapters

        # Run CPU-intensive work in a thread pool and await the result
        return await asyncio.to_thread(_extract_chapters)

    @staticmethod
    def extract_chapters(epub_path: Path) -> dict[str, str]:
        """
        Extract chapter titles and content from an EPUB file

        Args:
            epub_path: Path to the EPUB file

        Returns:
            Dictionary mapping chapter titles to their content
        """
        book = epub.read_epub(str(epub_path), {"ignore_ncx": True})
        chapters: dict[str, str] = {}

        for item in book.get_items():
            if isinstance(item, epub.EpubHtml):
                soup = BeautifulSoup(item.get_body_content(), "html.parser")

                # Extract title from headings
                title = None
                for heading in soup.find_all(["h1", "h2", "h3"]):
                    if heading.text.strip():
                        title = heading.text.strip()
                        # Remove the heading from the soup so it's not included in content
                        heading.decompose()
                        break

                # If no heading found, use item ID as title
                if not title:
                    title = item.id

                # Extract and clean content, excluding the title
                content = soup.get_text().strip()

                # Only add if we have actual content
                if content:
                    logger.debug(
                        f"Extracted chapter '{title}' with {len(content)} characters"
                    )
                    chapters[title] = content

        return chapters

    @staticmethod
    def save_book_data(filename: str, chapters: dict[str, str], db: Session) -> Book:
        """Save book and chapter data to database"""
        book = Book(
            title=filename,
            file_path=str(UploadController.UPLOAD_DIR / filename),
        )
        db.add(book)
        db.flush()

        # Create chapter records with content
        for index, (chapter_title, chapter_content) in enumerate(chapters.items(), 1):
            print(f"Chapter Length: {len(chapter_content)}")
            chapter = Chapter(
                book_id=book.id,
                title=chapter_title,
                content=chapter_content,
                order=index,
            )
            db.add(chapter)

        db.commit()
        logger.info(f"Book and chapters saved for {filename}")
        return book

    @classmethod
    async def handle_epub_upload(
        cls, file: UploadFile, db: Session
    ) -> tuple[bool, str, str | None, list[str], int | None]:
        """
        Handle the upload of an EPUB file and extract chapter data

        Args:
            file: The uploaded file
            db: Database session

        Returns:
            tuple: (success status, filename, optional error message, chapter titles, book_id)
        """
        try:
            if file.filename is None:
                return False, "unknown", "No filename provided", [], None

            # Create upload directory if it doesn't exist
            cls.UPLOAD_DIR.mkdir(exist_ok=True)

            # Validate file extension
            if not file.filename.lower().endswith(cls.ALLOWED_EXTENSION):
                return (
                    False,
                    file.filename,
                    "Invalid file type. Only EPUB files are allowed.",
                    [],
                    None,
                )

            # Save the file
            file_path = cls.UPLOAD_DIR / file.filename
            content = await file.read()  # Use async read for UploadFile

            with open(file_path, "wb") as f:
                f.write(content)

            # Extract chapter data
            chapters = cls.extract_chapters(file_path)

            # Save to database
            book = cls.save_book_data(file.filename, chapters, db)

            return True, file.filename, None, list(chapters.keys()), book.id

        except Exception as e:
            return (
                False,
                str(file.filename or "unknown"),
                f"Error uploading file: {str(e)}",
                [],
                None,
            )
