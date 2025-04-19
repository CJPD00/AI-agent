import json
import logging

import uvicorn
from typing import List
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Depends

from .scrapers.book_scraper import scrape_books
from .scrapers.hn_scraper import scrape_hn
from .models import Book, SearchQuery, Headline
from dotenv import load_dotenv
from .database import redis_client
# import os

load_dotenv()

app = FastAPI()
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def start():
    """Inicia el servidor con Uvicorn."""
    uvicorn.run(
        "src.ai_sytem_backend.main:app", host="0.0.0.0", port=7013, reload=True
    )


@app.post(
    "/init", response_model=List[Book], summary="Initialize database with scraped books"
)
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


@app.get(
    "/books/search",
    response_model=List[Book],
    summary="Search for books by title or category",
)
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


@app.get(
    "/headlines",
    response_model=List[Headline],
    summary="Get the latest Hacker News headlines",
)
async def get_headlines():
    """Scrapes and returns the latest headlines from Hacker News."""
    logger.info("Fetching Hacker News headlines...")
    headlines = scrape_hn()
    return headlines


@app.get(
    "/books",
    response_model=List[Book],
    summary="Retrieve all books or filter by category",
)
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
