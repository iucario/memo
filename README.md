# Memo

A lightweight, self-hosted memo web application.
Built with TypeScript, React, Python, FastAPI and PostgreSQL.

<img src="demo.png" alt="demo" height="500">

## Requirements

python3.10
fastapi
SQLAlchemy
Pillow

`server/src/settings.py`

```python
SECRET_KEY = 'generate using `openssl rand -hex 32`'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_DAYS = 7
DATABASE_URL = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/memo'
DATA_DIR = '/data'
LOG_PATH = '/data/app.log'
```

## Development Local

`git checkout local`

Frontend

```
cd frontend
npm install
npm start
```

Backend

```
docker compose up
```

Check API at `http://localhost:8000/docs`

## Data

Default settings:

Uploaded files are saved to `data/username/date/random hex`.
Log file is stored in `data/app.log`.
