
# backend/app/database.py
from dotenv import load_dotenv
import redis
import os

load_dotenv()
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))

redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

def get_redis_client():
    return redis_client