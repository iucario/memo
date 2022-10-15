from pydantic import BaseModel, validator, ConstrainedStr
from typing import Pattern
import re


class Username(ConstrainedStr):
    min_length = 3
    max_length = 30
    regex: Pattern[str] = re.compile(r"^[a-zA-Z0-9_]*$")


class Password(ConstrainedStr):
    min_length = 12
    max_length = 80
    # Password at least one upppercase, one lowercase,
    # one number, one special character,
    # and 12 to 80 characters long.
    regex: Pattern[str] = re.compile(r"^(?=[^A-Z\n]*[A-Z])"
                                     r"(?=[^a-z\n]*[a-z])"
                                     r"(?=[^0-9\n]*[0-9])"
                                     r"(?=[^#?!@$%^&*\n-]*"
                                     r"[#?!@$%^&*-]).{12,}$")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    token: str


class Image(BaseModel):
    id: int
    data: str
    thumbnail: str | None = None
    item_id: int
    deleted_at: int | None = None

    # owner_id: int

    class Config:
        orm_mode = True


class Item(BaseModel):
    id: int
    text: str = ""
    owner_id: int
    created_time: int
    updated_time: int
    images: list[Image] | None = None
    deleted_at: int | None = None

    class Config:
        orm_mode = True

    @validator("images")
    def replace_none(cls, v):
        return v if v else []


class UserBase(BaseModel):
    name: Username


class UserCreate(UserBase):
    password: Password


class User(UserBase):
    id: int
    items: list[Item] = []
    created_time: int

    class Config:
        orm_mode = True


class UserMe(UserBase):
    id: int
    total_items: int = 0
    total_images: int = 0
    created_time: int