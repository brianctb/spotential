import httpx
from fastapi import FastAPI, Request, Depends
from service.OSMService import OSMService
from config.osm import OVERPASS_URL


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client

def get_osm_service(client: httpx.AsyncClient = Depends(get_http_client)) -> OSMService:
    return OSMService(client=client, base_url=OVERPASS_URL)