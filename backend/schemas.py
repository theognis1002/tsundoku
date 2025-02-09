from datetime import datetime

from pydantic import BaseModel


class UploadResponse(BaseModel):
    """Response schema for file upload"""

    filename: str
    success: bool
    message: str | None = None
    chapters: list[str] = []
    book_id: int


class ChapterResponse(BaseModel):
    id: int
    title: str
    order: int
    book_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChapterContentResponse(BaseModel):
    """Response schema for chapter content"""

    id: int
    content: str | None
    summary: str | None
    title: str
