import os
import time

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from src import schemas
from src.config import get_settings
from src.database import Image, Item, User, UserStatistics

DATA_DIR = get_settings().data_dir

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str):
    return pwd_context.hash(password)


def get_time():
    return int(time.time() * 1000)


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_statistics(db: Session, user_id: int):
    return db.query(UserStatistics).filter(
        UserStatistics.user_id == user_id).first()


def get_me(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        return None
    user_stats = get_user_statistics(db, user_id)
    if user_stats is None:
        return None
    return schemas.UserMe(id=user.id,
                          name=user.name,
                          total_items=user_stats.total_items,
                          total_images=user_stats.total_images,
                          created_time=user.created_time)


def get_user_by_name(db: Session, name: str):
    return db.query(User).filter(User.name == name).first()


def get_users(db: Session, limit: int = 100):
    return db.query(User).limit(limit).all()


def authenticate_user(db: Session, name: str, password: str):
    user = get_user_by_name(db, name)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_user_statistics(db: Session, user_id: int):
    db_user_stats = UserStatistics(user_id=user_id,
                                   total_items=0,
                                   total_images=0)
    db.add(db_user_stats)
    db.commit()
    db.refresh(db_user_stats)
    return db_user_stats


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(name=user.name,
                   hashed_password=hashed_password,
                   created_time=get_time())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    create_user_statistics(db, user_id=db_user.id)  # type: ignore
    return db_user


def verify_item(db: Session, user_id: int, item_id: int):
    item = get_item(db, item_id)
    if item is None:
        return None
    return item.owner_id == user_id


def verify_image_owner(db: Session, user_id: int, image_id: int):
    image = get_image(db, image_id)
    if image is None:
        return None
    return image.owner_id == user_id


def get_image(db: Session, image_id: int) -> Image | None:
    return db.query(Image).filter(Image.id == image_id).first()


def get_image_by_path(db: Session, path: str) -> Image | None:
    return db.query(Image).filter(Image.data == path).first()


def get_item(db: Session, item_id: int) -> Item | None:
    return db.query(Item).filter(Item.id == item_id).first()


def get_item_images(db: Session, item_id: int):
    return db.query(Image).filter(Image.item_id == item_id).all()


def get_user_items(db: Session,
                   user_id: int,
                   offset: int = 0,
                   limit: int = 100):
    res = db.query(Item).filter(
        Item.owner_id == user_id, Item.deleted_at == None).order_by(
            Item.created_time.desc()).offset(offset).limit(limit).all()

    return res


def get_deleted_items(db: Session,
                      user_id: int,
                      offset: int = 0,
                      limit: int = 100):
    return db.query(Item).filter(
        Item.owner_id == user_id, Item.deleted_at != None).order_by(
            Item.deleted_at.desc()).offset(offset).limit(limit).all()


def update_user_statistics(db: Session,
                           user_id: int,
                           diff_items: int = 0,
                           diff_images: int = 0):
    user_stats = get_user_statistics(db, user_id)
    user_stats.total_items += diff_items  # type: ignore
    user_stats.total_images += diff_images  # type: ignore
    db.commit()
    return user_stats


def create_images(db: Session, item_id: int, images: list[str],
                  file_types: list[str], user_id: int):
    """Save image uuid names to database."""
    if not images:
        return None
    for filename, file_type in zip(images, file_types):
        db_image = Image(data=filename,
                         item_id=item_id,
                         file_type=file_type,
                         owner_id=user_id,
                         created_at=get_time())
        db.add(db_image)
    db.commit()
    update_user_statistics(db, user_id, 0, len(images))
    # db.refresh(db_image)
    return True


def create_user_item(db: Session, user_id: int, text: str, paths: list[str],
                     file_types: list[str]):
    timenow = get_time()
    db_item = Item(text=text,
                   owner_id=user_id,
                   created_time=timenow,
                   updated_time=timenow)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    update_user_statistics(db, user_id, 1, 0)
    create_images(
        db,
        item_id=db_item.id,  # type: ignore
        images=paths,
        file_types=file_types,
        user_id=user_id)
    return db_item


def delete_item_images_hard(db: Session, item_id: int):
    images = get_item_images(db, item_id)
    for img in images:
        db.delete(img)
    db.commit()
    return True


def delete_user_item(db: Session, item_id: int, user_id: int):
    """Set `deleted_at` to timestamp and hard delete after 30 days."""
    if not verify_item(db, user_id, item_id):
        return False
    db_item = get_item(db, item_id)
    if db_item is None or db_item.deleted_at is not None:
        return False
    # delete_files_s3(db_item.images)
    # delete_item_images_hard(db, item_id)
    # db.delete(db_item)
    db_item.deleted_at = get_time()  # type: ignore
    update_user_statistics(db, user_id, -1, 0)
    delete_images_soft(db, item_id, get_item_images(db, item_id))
    db.commit()
    return db_item


def delete_images_soft(db: Session, item_id: int, images: list[int]):
    """Set `deleted_at` to timestamp and hard delete later."""
    if not images:
        return
    orig_imgs = get_item_images(db, item_id)
    del_imgs = set(images)
    for img in orig_imgs:
        if img.id in del_imgs:
            img.deleted_at = get_time()
    update_user_statistics(db, orig_imgs[0].owner_id, 0, -len(del_imgs))
    db.commit()


def delete_images_hard(db: Session, item_id: int, images: list[int]):
    """Remove images from database, S3 and disk."""
    orig_imgs = get_item_images(db, item_id)
    del_imgs = set(images)
    for img in orig_imgs:
        if img.id in del_imgs:
            db.delete(img)
            os.remove(os.path.join(DATA_DIR, img.data))
    db.commit()


def update_user_item(db: Session, user_id: int, item_id: int, text: str,
                     img_ids: list[int], add_file_paths: list[str],
                     file_types: list[str]):
    if not verify_item(db, user_id, item_id):
        return False
    db_item = get_item(db, item_id)
    if db_item is None:
        return False

    if text != db_item.text or img_ids or add_file_paths:
        db_item.updated_time = get_time()  # type: ignore

    db_item.text = text  # type: ignore
    delete_images_soft(db, item_id, img_ids)
    create_images(
        db,
        item_id=db_item.id,  # type: ignore
        images=add_file_paths,
        file_types=file_types,
        user_id=user_id)
    db.commit()
    return db_item


def restore_item(db: Session, item_id: int, user_id: int):
    if not verify_item(db, user_id, item_id):
        return False
    db_item = get_item(db, item_id)
    if db_item is None:
        return False
    db_item.deleted_at = None  # type: ignore
    for image in db_item.images:
        image.deleted_at = None
    update_user_statistics(db, user_id, 1, len(db_item.images))
    db.commit()
    return db_item
