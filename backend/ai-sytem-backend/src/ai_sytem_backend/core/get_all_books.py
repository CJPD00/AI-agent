import logging
from typing import List
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Depends

from ..models import Book
from ..database import redis_client

logger = logging.getLogger(__name__)

async def get_all_books(category: Optional[str] = Query(None)):
    """Retrieves all books from Redis, optionally filtered by category."""
    results = []
    for key in redis_client.scan_iter("book:*"):
        book_data = redis_client.json().get(key)
        if book_data and isinstance(book_data, dict):
            book_data = {str(k): v for k, v in book_data.items()}
            book = Book(**book_data)
            if category and book.category.lower() == category.lower():
                results.append(book)
            elif not category:
                results.append(book)
    return results
