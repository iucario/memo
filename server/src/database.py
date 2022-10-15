import redis
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import (BigInteger, Column, ForeignKey, Integer, String,
                        create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

from src.config import get_settings

DATABASE_URL = get_settings().database_url
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_redis():
    settings = get_settings()
    redis_client = redis.Redis.from_url(settings.redis_url,
                                        decode_responses=True)
    try:
        yield redis_client
    finally:
        redis_client.close()


class User(Base):  # type: ignore
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    hashed_password = Column(String)
    created_time = Column(BigInteger)
    items = relationship("Item", back_populates="owner")
    images = relationship("Image", back_populates="owner")


class UserStatistics(Base):  # type: ignore
    __tablename__ = "user_statistics"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_items = Column(Integer)
    total_images = Column(Integer)


class Item(Base):  # type: ignore
    __tablename__ = "items"
    id = Column(Integer, primary_key=True)
    text = Column(String)
    created_time = Column(BigInteger)
    updated_time = Column(BigInteger)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="items")
    images = relationship("Image", back_populates="item")
    deleted_at = Column(BigInteger, nullable=True)

    def as_dict(self):
        d = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        d['images'] = [i.data for i in self.images]
        return d


class Image(Base):  # type: ignore
    __tablename__ = "images"
    id = Column(Integer, primary_key=True)
    data = Column(String)
    file_type = Column(String, default="image/jpeg")
    item_id = Column(Integer, ForeignKey("items.id"))
    item = relationship("Item", back_populates="images")
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="images")
    deleted_at = Column(BigInteger, nullable=True)
    created_at = Column(BigInteger)
