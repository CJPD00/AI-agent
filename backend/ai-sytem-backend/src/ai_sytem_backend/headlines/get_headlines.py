import logging
from typing import List
from fastapi import FastAPI, HTTPException, Query, Depends

from ..scrapers.hn_scraper import scrape_hn
from ..models import Headline

logger = logging.getLogger(__name__)

async def get_headlines():
    """Scrapes and returns the latest headlines from Hacker News."""
    logger.info("Fetching Hacker News headlines...")
    headlines = scrape_hn()
    return headlines
