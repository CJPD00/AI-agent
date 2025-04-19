# backend/app/scrapers/hn_scraper.py
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import logging
import time
import os

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
load_dotenv()

REMOTE_DRIVER_URL = os.environ.get("REMOTE_DRIVER_URL", "http://127.0.0.1:4444/wd/hub")


def scrape_hn(max_pages=5):
    """Scrapea titulares de Hacker News."""
    headlines = []
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--remote-debugging-port=9222")
    driver = None  # Ejecutar Chrome en modo headless

    try:
        driver = webdriver.Remote(
            command_executor=REMOTE_DRIVER_URL,
            options=chrome_options,
        )
        driver.get("https://news.ycombinator.com/")
        logging.info("Navigated to Hacker News")

        for page in range(max_pages):
            logging.info(f"Scraping page {page + 1} of Hacker News")
            stories = driver.find_elements(By.CSS_SELECTOR, "tr.athing")
            subtexts = driver.find_elements(By.CSS_SELECTOR, "td.subtext")

            for story, subtext in zip(stories, subtexts):
                title_element = story.find_element(
                    By.CSS_SELECTOR, "td.title span a"
                )
                url = title_element.get_attribute("href")
                title = title_element.text

                score_element = subtext.find_elements(By.CSS_SELECTOR, "span.score")
                score = score_element[0].text.split()[0] if score_element else "0"

                headlines.append({"title": title, "url": url, "score": int(score)})

            next_link = driver.find_elements(By.CSS_SELECTOR, "a.morelink")
            if next_link:
                next_link[0].click()
                time.sleep(2)  # Esperar a que la página cargue
            else:
                break

    except Exception as e:
        logging.error(f"Error scraping Hacker News: {e}")
    finally:
        if "driver" in locals() and driver:
            driver.quit()
            logging.info("Selenium WebDriver closed")

    logging.info(f"data: {headlines}")

    return headlines


if __name__ == "__main__":
    headlines = scrape_hn()
    for headline in headlines:
        print(headline)
