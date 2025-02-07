from typing import List, Optional

from pydantic import BaseModel


class UploadResponse(BaseModel):
    """Response schema for file upload"""

    filename: str
    success: bool
    message: Optional[str] = None
    chapters: List[str] = []
