

import pytest
from httpx import AsyncClient
from ai_sytem_backend.models import Book, Headline


@pytest.fixture
async def client():
    async with AsyncClient(base_url="http://test") as client:
        yield client


async def test_init_endpoint(client):
    response = await client.post("/init")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    assert len(books) > 0
    if books:
        book = Book(**books[0])
        assert book.title is not None


async def test_search_books_by_title(client):
    response = await client.get("/books/search?title=Potter")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    if books:
        for book_data in books:
            book = Book(**book_data)
            assert "potter" in book.title.lower()


async def test_search_books_by_category(client):
    response = await client.get("/books/search?category=Fiction")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    if books:
        for book_data in books:
            book = Book(**book_data)
            assert "fiction" in book.category.lower()


async def test_get_headlines(client):
    response = await client.get("/headlines")
    assert response.status_code == 200
    headlines = response.json()
    assert isinstance(headlines, list)
    assert len(headlines) >= 0
    if headlines:
        headline = Headline(**headlines[0])
        assert headline.title is not None
        assert headline.url is not None
        assert headline.score is not None


async def test_get_all_books(client):
    response = await client.get("/books")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    assert len(books) >= 0


async def test_get_books_by_category_filter(client):
    response = await client.get("/books?category=Travel")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    if books:
        for book_data in books:
            book = Book(**book_data)
            assert book.category.lower() == "travel"
