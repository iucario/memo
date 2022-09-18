import logging
import logging.handlers

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database import Base, engine
from src.routers import item, router
from src.settings import LOG_PATH

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(router.router)
app.include_router(router.file_router)
app.include_router(item.router)

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger = logging.getLogger("uvicorn.access")
    handler = logging.handlers.RotatingFileHandler(LOG_PATH,
                                                   mode="a",
                                                   maxBytes=100 * 1024,
                                                   backupCount=3)
    handler.setFormatter(
        logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(handler)


@app.get("/")
async def main():
    return {'message': 'ok'}
