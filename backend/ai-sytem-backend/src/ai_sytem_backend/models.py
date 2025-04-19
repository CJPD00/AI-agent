
# backend/app/models.py
from pydantic import BaseModel
from typing import Optional

class Book(BaseModel):
    title: str
    price: float
    category: str
    image_url: str
    url: str

class Headline(BaseModel):
    title: str
    url: str
    score: int

class SearchQuery(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None