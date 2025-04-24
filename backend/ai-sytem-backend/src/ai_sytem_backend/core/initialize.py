import json
import logging
from typing import List
from fastapi import HTTPException

from ..scrapers.book_scraper import scrape_books
from ..models import Book
from ..database import redis_client

logger = logging.getLogger(__name__)

async def initialize_books():
    """Scrapes books from the website and stores them in Redis."""
    logger.info("Initializing book data...")
    scrape_books()

    try:
        book_keys = redis_client.keys("book:*")
        book_data_list = [json.loads(redis_client.get(key)) for key in book_keys[:5]] # type: ignore
        books = [
            Book(**data)  # type: ignore
            for data in book_data_list
            if data
            and all(
                field in data
                for field in ["title", "price", "category", "image_url", "url"]
            )
        ]
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

    return books
