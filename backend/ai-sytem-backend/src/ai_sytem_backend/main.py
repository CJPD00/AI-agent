import logging
from typing import List
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Depends

from .core import main as core_main
from .core import initialize as core_initialize
from .search import search_books as search_search_books
from .headlines import get_headlines as headlines_get_headlines
from .core import get_all_books as core_get_all_books
from .models import Book, SearchQuery, Headline
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def start():
    core_main.start()


@app.post(
    "/init", response_model=List[Book], summary="Initialize database with scraped books"
)
async def initialize_books():
    return await core_initialize.initialize_books()


@app.get(
    "/books/search",
    response_model=List[Book],
    summary="Search for books by title or category",
)
async def search_books(query: SearchQuery = Depends()):
    return await search_search_books.search_books(query)


@app.get(
    "/headlines",
    response_model=List[Headline],
    summary="Get the latest Hacker News headlines",
)
async def get_headlines():
    return await headlines_get_headlines.get_headlines()


@app.get(
    "/books",
    response_model=List[Book],
    summary="Retrieve all books or filter by category",
)
async def get_all_books(category: Optional[str] = Query(None)):
    return await core_get_all_books.get_all_books(category)
