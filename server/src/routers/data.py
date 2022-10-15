import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from src import crud
from src.config import get_settings
from src.database import SessionLocal, get_db

DATA_DIR = get_settings().data_dir
router = APIRouter(
    prefix='/data',
    tags=['file'],
    dependencies=[Depends(get_db)],
)


# Files not authenticated for easy development
# Use S3 or other cloud storage for production
@router.get("/{image_id}", response_class=FileResponse)
async def get_image(image_id: int, db: SessionLocal = Depends(get_db)):
    db_img = crud.get_image(db, image_id)
    if not db_img:
        raise HTTPException(status_code=404)
    return FileResponse(os.path.join(DATA_DIR, db_img.data),
                        media_type=db_img.file_type)
