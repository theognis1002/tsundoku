from pydantic import BaseModel


class UploadResponse(BaseModel):
    """Response schema for file upload"""

    filename: str
    success: bool
    message: str | None = None
    chapters: list[str] = []
