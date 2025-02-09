import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.book import Chapter
from backend.schemas import ChapterContentResponse, ChapterResponse

from .controllers.summary_controller import SummaryController
from .controllers.upload_controller import UploadController

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
    """Get chapter content and its summary from the database."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    return ChapterContentResponse(
        id=chapter.id,
        content=chapter.content,
        summary=chapter.summary,
        title=chapter.title,
    )


@router.post("/chapters/{chapter_id}/summarize")
async def summarize_chapter(chapter_id: int, db: Session = Depends(get_db)):
    """Generate a summary for the chapter"""
    try:
        summary = await SummaryController.summarize_chapter(chapter_id, db)
        return {"summary": summary}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
