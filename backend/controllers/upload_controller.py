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
    async def save_book_data(filename: str, chapters: list[str], db: Session) -> Book:
        """Save book and chapter data to database"""
        # Create book record
        book = Book(
            title=filename,
            file_path=str(UploadController.UPLOAD_DIR / filename),
        )
        db.add(book)
        db.flush()  # Get the book ID

        # Create chapter records
        for index, chapter_title in enumerate(chapters):
            chapter = Chapter(
                book_id=book.id,
                title=chapter_title,
                order=index + 1,  # 1-based ordering
            )
            db.add(chapter)

        db.commit()
        logger.info(f"Book and chapters saved for {filename}")
        return book

    @classmethod
    async def handle_epub_upload(
        cls, file: UploadFile, db: Session
    ) -> tuple[bool, str, str | None, list[str]]:
        """
        Handle the upload of an EPUB file and extract chapter names

        Args:
            file: The uploaded file
            db: Database session

        Returns:
            tuple: (success status, filename, optional error message, chapter names)
        """
        try:
            if file.filename is None:
                return False, "unknown", "No filename provided", []

            # Create upload directory if it doesn't exist
            cls.UPLOAD_DIR.mkdir(exist_ok=True)

            # Validate file extension
            if not file.filename.lower().endswith(cls.ALLOWED_EXTENSION):
                return (
                    False,
                    file.filename,
                    "Invalid file type. Only EPUB files are allowed.",
                    [],
                )

            # Save the file
            file_path = cls.UPLOAD_DIR / file.filename
            content = await file.read()

            with open(file_path, "wb") as f:
                f.write(content)

            # Extract chapter names asynchronously
            chapters = await cls.extract_chapter_names(file_path)

            # Save to database
            await cls.save_book_data(file.filename, chapters, db)

            return True, file.filename, None, chapters

        except Exception as e:
            return (
                False,
                str(file.filename or "unknown"),
                f"Error uploading file: {str(e)}",
                [],
            )
