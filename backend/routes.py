import logging

import groq
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.book import Chapter
from backend.schemas import ChapterContentResponse, ChapterResponse

from .controllers.upload_controller import UploadController

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize GROQ client
client = groq.Groq(api_key="your-groq-api-key")


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

    # Generate summary using GROQ
    if chapter.content:
        prompt = f"""Summarize this chapter concisely:

{chapter.content}

Key points and summary:"""

        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="mixtral-8x7b-32768",  # or your preferred model
                temperature=0.3,
                max_tokens=500,
            )
            summary = chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            summary = "Error generating summary. Please try again later."
    else:
        summary = "No content available to summarize"

    return {"content": chapter.content, "summary": summary, "title": chapter.title}
