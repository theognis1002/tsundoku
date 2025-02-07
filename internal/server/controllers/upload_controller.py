from pathlib import Path
from typing import List, Optional

from bs4 import BeautifulSoup
from ebooklib import epub
from fastapi import UploadFile


class UploadController:
    """Controller for handling file uploads"""

    UPLOAD_DIR = Path("uploads")
    ALLOWED_EXTENSION = ".epub"

    @staticmethod
    def extract_chapter_names(epub_path: Path) -> List[str]:
        """
        Extract chapter names from an EPUB file using the table of contents

        Args:
            epub_path: Path to the EPUB file

        Returns:
            List of chapter names
        """
        book = epub.read_epub(str(epub_path))
        chapters = []

        # Extract chapters from table of contents
        for item in book.toc:
            if isinstance(item, tuple):  # Handle nested TOC entries
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
                        if heading.text.strip():
                            chapters.append(heading.text.strip())

        return chapters

    @classmethod
    async def handle_epub_upload(
        cls, file: UploadFile
    ) -> tuple[bool, str, Optional[str], List[str]]:
        """
        Handle the upload of an EPUB file and extract chapter names

        Args:
            file: The uploaded file

        Returns:
            tuple: (success status, filename, optional error message, chapter names)
        """
        try:
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

            # Extract chapter names
            chapters = cls.extract_chapter_names(file_path)

            return True, file.filename, None, chapters

        except Exception as e:
            return False, file.filename, f"Error uploading file: {str(e)}", []
