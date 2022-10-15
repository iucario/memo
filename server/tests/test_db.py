import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = 'postgresql://myuser:mypassword@localhost:5432/testdb'
os.environ['DATABASE_URL'] = TEST_DATABASE_URL

from src.main import app
import pytest

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False,
                                   autoflush=False,
                                   bind=engine)
from src.database import Base

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()  # type: ignore


from src.database import get_db

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope='session')
def auth():
    data = {
        'username': 'testuser',
        'password': 'password12Caps@#$',
    }
    res = client.post(
        '/login',
        data={
            'username': data['username'],
            'password': data['password'],
        },
    )
    assert res.status_code == 200, res.text
    assert 'access_token' in res.json()
    assert 'token_type' in res.json()
    data.update(**res.json())
    headers = {'Authorization': f'{data["token_type"]} {data["access_token"]}'}
    return headers


@pytest.fixture(scope='session')
def user(auth):
    print(auth)
    res = client.get('/me', headers=auth)
    assert res.status_code == 200, res.text
    return res.json()


def test_create_user():
    res = client.post(
        '/register',
        json={
            'name': 'testuser',
            'password': 'password12Caps@#$',
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data['name'] == 'testuser'
    assert 'id' in data
    assert data['items'] == [], data['items']
    assert 'created_time' in data


def test_create_user_dup_name():
    res = client.post(
        '/register',
        json={
            'name': 'testuser',
            'password': 'password12Caps@#$',
        },
    )
    assert res.status_code == 400, res.text
    data = res.json()
    assert data == {"detail": "Name already registered"}


def test_login():
    res = client.post(
        '/login',
        data={
            'username': 'testuser',
            'password': 'password12Caps@#$',
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert 'access_token' in data
    assert 'token_type' in data


def test_read_user(auth):
    res = client.get('/me', headers=auth)
    assert res.status_code == 200, res.text
    data = res.json()
    assert 'total_items' in data
    assert 'total_images' in data
    assert 'created_time' in data
