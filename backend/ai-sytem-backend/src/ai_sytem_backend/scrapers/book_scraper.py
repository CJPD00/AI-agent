# backend/app/scrapers/book_scraper.py
import json
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import redis
import logging
import time
import os
import hashlib

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

load_dotenv()
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))


def generate_book_id(url):
    """Genera un ID único basado en la URL del libro."""
    return hashlib.md5(url.encode()).hexdigest()


def scrape_books(max_books=100, price_limit=20):
    """Scrapea libros de books.toscrape.com y los guarda en Redis."""
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    base_url = "https://books.toscrape.com/catalogue/"
    page = "page-1.html"
    books_count = 0
    datos = []

    while page and books_count < max_books:
        url = base_url + str(page)
        logging.info(f"Scraping page: {url}")
        try:
            response = requests.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "html.parser")
            book_elements = soup.select("article.product_pod")

            for book_element in book_elements:
                if books_count >= max_books:
                    break

                title_element = book_element.select_one("h3 a")
                price_element = book_element.select_one(".price_color")
                category_url_relative = book_element.select_one(
                    ".product_pod > div > a"
                )["href"]  # type: ignore

                response2 = requests.get(base_url + str(category_url_relative))  # type: ignore
                response2.raise_for_status()
                image_url_relative = book_element.select_one(".image_container a img")[  # type: ignore
                    "src"
                ]

                if title_element and price_element:
                    title = title_element["title"]
                    price_str = price_element.get_text(strip=True).replace("£", "")
                    try:
                        price = float(price_str)
                        if price < price_limit:
                            book_url_relative = title_element["href"]
                            book_url = base_url + book_url_relative.replace(  # type: ignore
                                "../../..", ""
                            )
                            image_url = base_url.replace(
                                "catalogue/", ""
                            ) + image_url_relative.replace("../..", "")  # type: ignore

                            # category_link = soup.select_one(
                            #     ".breadcrumb > li:nth-child(3) > a"
                            # )
                            soup2 = BeautifulSoup(response2.content, "html.parser")
                            category_element = soup2.select_one(
                                ".breadcrumb > li:nth-child(3) > a"
                            )
                            category = (
                                category_element.get_text(strip=True)
                                if category_element
                                else "Unknown"
                            )

                            book_id = generate_book_id(book_url)
                            book_data = {
                                "title": title,
                                "price": price,
                                "category": category,
                                "image_url": image_url,
                                "url": book_url,
                            }
                            redis_client.set(f"book:{book_id}", json.dumps(book_data))
                            datos.append(book_data)
                            books_count += 1
                            logging.info(
                                f"Scraped and saved book: {title} (ID: {book_id})"
                            )
                    except ValueError as e:
                        logging.error(f"Error parsing price for '{title}': {e}")

            next_button = soup.select_one("li.next a")
            page = next_button["href"] if next_button else None

        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching {url}: {e}")
            time.sleep(5)  # Simple retry delay
        except Exception as e:
            logging.error(f"An unexpected error occurred while scraping {url}: {e}")
            break

    logging.info(f"Finished scraping. Total books scraped and saved: {books_count}")
    # logging.info(f"datos: {datos}")


if __name__ == "__main__":
    scrape_books()
