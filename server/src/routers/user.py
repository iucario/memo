import json
import shutil
import tempfile
import zipfile
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from src import crud, schemas
from src.config import get_settings
from src.database import get_db, oauth2_scheme

router = APIRouter(prefix='/api/v1/user', tags=['user'])


async def get_current_user(db: Session = Depends(get_db),
                           token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    settings = get_settings()
    try:
        payload = jwt.decode(token,
                             settings.secret_key,
                             algorithms=[settings.algorithm])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_name(db, name=username)
    if user is None:
        raise credentials_exception
    return user


@router.get("/me", response_model=schemas.UserMe)
async def read_user(db: Session = Depends(get_db),
                    current_user: schemas.User = Depends(get_current_user)):
    me = crud.get_me(db, current_user.id)
    return me


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
    pathobj = Path(dir)

    with zipfile.ZipFile(filename, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for entry in pathobj.rglob("*"):
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
    s3_folder = f'{BUCKET_PREFIX}/{user.name}'
    local_folder = f'{temp_dir}/{user.name}'
    download_s3_folder(s3_folder, local_folder)
    zip_file = f"{temp_dir}/{user.name}.zip"
    shutil.move(f"{temp_dir}/{user.name}.json", f"{temp_dir}/{user.name}")
    shutil.make_archive(zip_file[:-4], 'zip', temp_dir, user.name)
    return zip_file
