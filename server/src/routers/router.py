import json
import os
import shutil
import tempfile
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from src import crud, schemas
from src.depends import create_access_token, get_current_user, get_db
from src.settings import ACCESS_TOKEN_EXPIRE_DAYS, DATA_DIR

router = APIRouter()


@router.post("/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_name(db, name=user.name)
    if db_user:
        raise HTTPException(status_code=400, detail="Name already registered")
    return crud.create_user(db=db, user=user)


@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(
        db: Session = Depends(get_db),
        form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    access_token = create_access_token(data={"sub": user.name},
                                       expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserMe)
async def read_user(db: Session = Depends(get_db),
                    current_user: schemas.User = Depends(get_current_user)):
    me = crud.get_me(db, current_user.id)
    return me


file_router = APIRouter(prefix="/data", tags=["files"])


@file_router.get("/{image_id}", response_class=FileResponse)
async def get_image(image_id: int, db: Session = Depends(get_db)):
    db_img = crud.get_image(db, image_id)
    if not db_img:
        raise HTTPException(status_code=404)
    return FileResponse(os.path.join(DATA_DIR, db_img.data),
                        media_type=db_img.file_type)


async def get_temp_dir():
    temp_dir = tempfile.TemporaryDirectory()
    try:
        yield temp_dir.name
    finally:
        del temp_dir


def zip_dir(dir: str, filename: str):
    """Zip the provided directory without navigating to 
        that directory using `pathlib` module
    """

    # Convert to Path object
    dir = Path(dir)

    with zipfile.ZipFile(filename, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for entry in dir.rglob("*"):
            zip_file.write(entry, entry.relative_to(dir))


@router.get("/export", response_class=FileResponse)
async def export_user(db: Session = Depends(get_db),
                      current_user: schemas.User = Depends(get_current_user),
                      temp_dir: str = Depends(get_temp_dir)):
    """Returns a zip of the user's data."""
    user = crud.get_me(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    total_items = user.total_items
    with open(f"{temp_dir}/{user.name}.json", "w") as f:
        items = crud.get_user_items(db,
                                    current_user.id,
                                    offset=0,
                                    limit=total_items)
        item_dict = [item.as_dict() for item in items]
        json.dump({'items': item_dict}, f)
    zip_file = f"{temp_dir}/{user.name}.zip"
    shutil.move(f"{DATA_DIR}/{user.name}", f"{temp_dir}/{user.name}")
    shutil.move(f"{temp_dir}/{user.name}.json", f"{temp_dir}/{user.name}")
    shutil.make_archive(zip_file[:-4], 'zip', temp_dir, user.name)
    return zip_file
