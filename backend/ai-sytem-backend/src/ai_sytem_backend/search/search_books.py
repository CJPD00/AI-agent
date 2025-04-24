import json
import logging
from typing import List
from fastapi import FastAPI, HTTPException, Query, Depends

from ..models import Book, SearchQuery
from ..database import redis_client

logger = logging.getLogger(__name__)

async def search_books(query: SearchQuery = Depends()):
    """Searches for books in Redis based on title or category."""
    try:
        results = []
        for key in redis_client.scan_iter("book:*"):
            book_data = redis_client.get(key)
            if book_data:
                try:
                    book_data = json.loads(book_data) # type: ignore
                    book = Book(**book_data)
                except Exception as e:
                    logger.error(f"Error creating Book object: {e}")
                    continue

                if query.title and query.title.lower() in book.title.lower():
                    results.append(book)
                elif query.category and query.category.lower() in book.category.lower():
                    results.append(book)
                elif not query.title and not query.category:
                    results.append(book)  # Return all if no query params
        return results
    
    except Exception as e:
        logger.error(f"Error searching books: {e}")
        raise HTTPException(status_code=500, detail="Error searching books")
