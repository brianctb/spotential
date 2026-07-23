from slowapi import Limiter
from slowapi.util import get_remote_address
from dotenv import load_dotenv
import os

load_dotenv()

limiter = Limiter(key_func=get_remote_address, default_limits=["8/minute", "50/day"])
limiter.enabled = os.getenv("RATE_LIMIT_ENABLED", "true").lower() != "false"
