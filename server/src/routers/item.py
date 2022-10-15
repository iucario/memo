import os
import time
import uuid

import aiofiles  # type: ignore
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from src import crud, schemas
from src.config import get_settings
from src.database import get_db
from src.routers.user import get_current_user

router = APIRouter(
    prefix='/api/v1/item',
    tags=['item'],
    dependencies=[Depends(get_db), Depends(get_current_user)],
)
DATA_DIR = get_settings().data_dir
STAGE = get_settings().stage
CHUNK_SIZE = 1024 * 1024 * 5  # 5 MB


async def save_file(user: schemas.User, file: UploadFile):
    """Save file to disk and return filename.
   
    Files are saved in `{DATA_DIR}/{user}/{ymd}/{filename}`.
    Relative path `{user}/{ymd}/{filename}` is saved in database.
    """

    random_hex = uuid.uuid4().hex
    ext = file.filename.split('.')[-1]
    name = f"{user.name}/{time.strftime('%y%m%d')}/{random_hex}.{ext}"
    path = f"{DATA_DIR}/{name}"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    async with aiofiles.open(path, 'wb') as f:
        while chunk := await file.read(CHUNK_SIZE):
            await f.write(chunk)

    return name


async def save_file_paths(current_user, images: list[UploadFile]) -> list[str]:
    """Save file to disk and return paths"""
    paths = []
    if images:
        for image in images:
            path = await save_file(current_user, image)
            paths.append(path)
    return paths


def parse_images(images):
    for img in images:
        if STAGE == 'dev':
            img.data = f'http://localhost:8000/data/{img.id}'
            img.thumbnail = f'http://localhost:8000/data/{img.id}'
        else:
            img.data = f'/data/{img.id}'
            img.thumbnail = f'/data/{img.id}'
    return images


@router.get("/", response_model=schemas.Item)
async def read_one_item(id: int,
                        db: Session = Depends(get_db),
                        current_user: schemas.User = Depends(get_current_user)):
    verify = crud.verify_item(db, current_user.id, id)
    if verify == False:
        raise HTTPException(status_code=400, detail="Not authorized")
    elif verify is None:
        raise HTTPException(status_code=404, detail="Item not found")
    item = crud.get_item(db, id)
    item.images = parse_images(item.images)  # type: ignore
    return item


@router.get("/list", response_model=list[schemas.Item])
async def read_own_items(
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)):
    db_items = crud.get_user_items(db, current_user.id, offset, limit=10)
    for item in db_items:
        item.images = parse_images(item.images)
    return db_items


@router.post("/", response_model=schemas.Item)
async def create_item(text: str = Form(''),
                      images: list[UploadFile] | None = None,
                      db: Session = Depends(get_db),
                      current_user: schemas.User = Depends(get_current_user)):
    if images:
        paths = await save_file_paths(current_user, images)
        file_types = [image.content_type for image in images]
    else:
        paths = []
        file_types = []
    db_items = crud.create_user_item(db, current_user.id, text, paths,
                                     file_types)
    db_items.images = parse_images(db_items.images)
    return db_items


@router.delete("/{id}", response_model=int)
async def delete_item(id: int,
                      db: Session = Depends(get_db),
                      current_user: schemas.User = Depends(get_current_user)):
    item = crud.delete_user_item(db, id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    return item.id


@router.put("/{id}", response_model=schemas.Item)
async def edit_item(id: int,
                    text: str = Form(''),
                    delete: list[int] = Form([]),
                    add: list[UploadFile] | None = None,
                    db: Session = Depends(get_db),
                    current_user: schemas.User = Depends(get_current_user)):
    if add:
        paths = await save_file_paths(current_user, add)
        file_types = [image.content_type for image in add]
    else:
        paths = []
        file_types = []
    item = crud.update_user_item(db, current_user.id, id, text, delete, paths,
                                 file_types)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.images = parse_images(item.images)

    return item


@router.get("/recycle", response_model=list[schemas.Item])
async def read_recycle_items(
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)):
    db_items = crud.get_deleted_items(db, current_user.id, offset, limit=10)
    for item in db_items:
        item.images = parse_images(item.images)
    return db_items


@router.post("/restore/{id}")
async def restore_item(id: int,
                       db: Session = Depends(get_db),
                       current_user: schemas.User = Depends(get_current_user)):
    item = crud.restore_item(db, id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"detail": f"Restored item {id}"}
