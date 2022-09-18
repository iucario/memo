from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.database import Base
from src.main import app
from src.depends import get_db

import pytest

TEST_DATABASE_URL = 'postgresql://test:testpass@localhost/testdb'

engine = create_engine(TEST_DATABASE_URL,
                       connect_args={'check_same_thread': False})
TestingSessionLocal = sessionmaker(autocommit=False,
                                   autoflush=False,
                                   bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope='session')
def login():
    data = {
        'username': 'testuser',
        'password': 'testpasSword443',
    }
    res = client.post(
        '/login',
        data={
            'username': data['username'],
            'password': data['password'],
        },
    )
    assert res.status_code == 200, res.text
    data.update(**res.json())
    data['headers'] = {
        'Authorization': f'{data["token_type"]} {data["access_token"]}'
    }
    return data


@pytest.fixture(scope='session')
def user(login):
    res = client.get('/me', headers=login['headers'])
    assert res.status_code == 200, res.text
    return {'user_id': res.json()['id']}


@pytest.fixture(scope='session')
def auth(user, login):
    return {**login, **user}


def test_create_user():
    res = client.post(
        '/register',
        json={
            'name': 'testuser',
            'password': 'testpasSword443',
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
            'password': 'testpasSword443',
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
            'password': 'testpasSword443',
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert 'access_token' in data
    assert 'token_type' in data


def test_read_user(auth):
    res = client.get('/me', headers=auth['headers'])
    assert res.status_code == 200, res.text
    data = res.json()
    assert data['name'] == auth['username']
    assert data['id'] == auth['user_id']
    assert 'total_items' in data
    assert 'created_time' in data
