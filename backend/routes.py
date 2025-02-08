import logging

# import groq
from bs4 import BeautifulSoup
from ebooklib import epub
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.book import Book, Chapter
from backend.schemas import ChapterContentResponse, ChapterResponse

from .controllers.upload_controller import UploadController

# import os


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile, db: Session = Depends(get_db)) -> dict:
    (
        success,
        filename,
        error,
        chapters,
        book_id,
    ) = await UploadController.handle_epub_upload(file, db)
    if not success:
        raise HTTPException(status_code=400, detail=error)
    return {
        "message": "File uploaded successfully",
        "filename": filename,
        "chapters": chapters,
        "book_id": book_id,
    }


@router.get("/books/{book_id}/chapters", response_model=list[ChapterResponse])
async def get_book_chapters(book_id: int, db: Session = Depends(get_db)):
    """Get all chapters for a specific book."""
    chapters = (
        db.query(Chapter)
        .filter(Chapter.book_id == book_id)
        .order_by(Chapter.order)
        .all()
    )

    if not chapters:
        raise HTTPException(status_code=404, detail="No chapters found for this book")

    return chapters


@router.get("/chapters/{chapter_id}/content", response_model=ChapterContentResponse)
async def get_chapter_content(chapter_id: int, db: Session = Depends(get_db)):
    """Get chapter content and its summary."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    book = db.query(Book).filter(Book.id == chapter.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    try:
        epub_book = epub.read_epub(book.file_path)
        content = None
        logger.info(f"Looking for chapter: {chapter.title}")

        # Try to find content in EPUB manifest (actual content storage)
        for item in epub_book.get_items():
            if (
                item.media_type == "application/xhtml+xml"
            ):  # Ensure it's readable content
                soup = BeautifulSoup(item.get_body_content(), "html.parser")

                # Try to find the chapter title inside the document
                title_tag = soup.find(["h1", "h2", "h3"], string=chapter.title)
                if title_tag:
                    logger.info(f"Found chapter: {chapter.title} in {item.file_name}")
                    content = title_tag.find_parent().get_text().strip()
                    break

        if not content:
            logger.warning(f"No content found for chapter: {chapter.title}")
            content = "No content found for this chapter"

        # Generate summary (Mocked for now)

        # Initialize GROQ client
        # client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
        # client.chat.completions.create(
        #     messages=[{"role": "user", "content": content}],
        #     model="mixtral-8x7b-32768",
        #     temperature=0.3,
        #     max_tokens=500,
        # )

        summary = "N/A"

    except Exception as e:
        logger.error(f"Error reading EPUB file: {str(e)}")
        raise HTTPException(status_code=500, detail="Error reading chapter content")

    return {"content": content, "summary": summary, "title": chapter.title}
