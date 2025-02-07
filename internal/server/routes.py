from fastapi import APIRouter, File, UploadFile

from .controllers.upload_controller import UploadController
from .schemas import UploadResponse

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_epub(file: UploadFile = File(...)) -> UploadResponse:
    """
    Handle POST request for EPUB file upload and extract chapter names

    Args:
        file: The uploaded EPUB file

    Returns:
        UploadResponse: Response containing upload status, details and chapter names
    """
    success, filename, error, chapters = await UploadController.handle_epub_upload(file)

    return UploadResponse(
        success=success, filename=filename, error=error, chapters=chapters
    )
