from fastapi import APIRouter, HTTPException
import httpx
from pydantic import BaseModel
from enum import Enum

router = APIRouter(prefix="/locations", tags=["locations"])

OVERPASS_URL = "http://overpass-api.de/api/interpreter"