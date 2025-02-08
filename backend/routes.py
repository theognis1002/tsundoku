from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.database import get_db

from .controllers.upload_controller import UploadController

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile, db: Session = Depends(get_db)) -> dict:
    success, filename, error, chapters = await UploadController.handle_epub_upload(
        file, db
    )
    if not success:
        raise HTTPException(status_code=400, detail=error)
    return {
        "message": "File uploaded successfully",
        "filename": filename,
        "chapters": chapters,
    }
