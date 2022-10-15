import pytest
import requests

API = "http://localhost:8000/api/v1"


def test_index():
    r = requests.get('http://localhost:8000')
    assert r.status_code == 200
    assert r.json() == {"message": "ok"}


def test_me_fail():
    r = requests.get(API + "/user/me", headers={'Authorization': 'Bearer 123'})
    assert r.status_code == 401, r.text


def test_register_ok():
    r = requests.post(API + "/auth/register",
                      data={
                          'username': 'testuser',
                          'password': 'password12Caps@#$',
                      })
    assert r.status_code == 200, r.text


def test_register_duplicate():
    r = requests.post(API + "/auth/register",
                      data={
                          'username': 'testuser',
                          'password': 'password12Caps@#$',
                      })
    assert r.status_code == 400, r.text


@pytest.fixture(scope='session')
def auth():
    data = {
        'username': 'testuser',
        'password': 'password12Caps@#$!',
    }
    res = requests.post(
        API + '/auth/login',
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
    res = requests.get(API + '/user/me', headers=auth)
    assert res.status_code == 200, res.text
    return res.json()


def test_item_create_ok(auth, user) -> tuple[list, list]:
    total_items = user['total_items']
    total_images = user['total_images']
    new_item_id_list = []
    new_image_id_list = []

    # only text
    resp = _create_item("test", [], auth)
    _check_user_info(total_items + 1, total_images, auth)
    new_item_id_list.append(resp['id'])

    # with image
    resp = _create_item("test body", ["tests/test.jpg"], auth)
    _check_user_info(total_items + 2, total_images + 1, auth)
    new_item_id_list.append(resp['id'])
    new_image_id_list.append(resp['images'][0]['id'])

    # only image
    _create_item("", ["tests/test.jpg"], auth)
    _check_user_info(total_items + 3, total_images + 2, auth)
    new_item_id_list.append(resp['id'])
    new_image_id_list.append(resp['images'][0]['id'])

    return new_item_id_list, new_image_id_list


def test_item_get_ok(auth):
    r = requests.get(API + "/item/?id=1", headers=auth)
    assert r.status_code == 200, r.text
    expected_keys = [
        'id', 'text', 'images', 'created_time', 'updated_time', 'owner_id',
        'deleted_at'
    ]
    assert all([k in r.json() for k in expected_keys]), \
        f"missing keys in response: {r.text}"


@pytest.fixture(scope='session')
def test_get_items_ok(auth):
    r = requests.get(API + "/item/list", headers=auth)
    assert r.status_code == 200, r.text
    return r.json()


def test_item_delete_ok(test_get_items_ok, user, auth):
    items = test_get_items_ok
    images = []
    for item in items:
        images += item['images']
    for item in items:
        _delete_item(item['id'], auth)
    user['total_items'] -= len(items)
    user['total_images'] -= len(images)
    _check_user_info(user['total_items'], user['total_images'], auth)


def _create_item(text: str, images: list, headers):
    image_files = [open(i, "rb") for i in images]
    r = requests.post(API + "/item",
                      headers=headers,
                      data={"text": text},
                      files=[("images", i) for i in image_files])
    assert r.status_code == 200, r.text
    assert 'images' in r.json(), "images field not in response"
    return r.json()


def _delete_item(id: int, headers):
    r = requests.delete(API + f"/item/{id}", headers=headers)
    assert r.status_code == 200, r.text


def _check_user_info(expected_total_items: int, expected_total_images: int,
                     headers: dict):
    r = requests.get(API + "/user/me", headers=headers)
    user = r.json()
    assert user['total_items'] == expected_total_items, \
        "total_items not updated"
    assert user['total_images'] == expected_total_images, \
        "total_images not updated"
