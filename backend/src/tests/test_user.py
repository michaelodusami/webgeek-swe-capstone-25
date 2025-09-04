import pytest
import logging
import uuid

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

@pytest.fixture
def user_data():
    unique = str(uuid.uuid4())[:8]
    return {
        "username": f"pytestuser_{unique}",
        "edupersonprimaryaffiliation": "student",
        "uupid": f"pytestuupid_{unique}",
        "edupersonprincipalname": f"pytestuser_{unique}@test.edu"
    }

def test_create_user(client, user_data):
    logger.info("Testing user creation with data: %s", user_data)
    response = client.post("/api/users/", json=user_data)
    logger.debug("Response status: %s, body: %s", response.status_code, response.text)
    if response.status_code != 201:
        logger.error("Failed to create user: %s", response.text)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["uupid"] == user_data["uupid"]
    assert "id" in data

def test_list_users(client):
    logger.info("Testing listing users")
    response = client.get("/api/users/")
    logger.debug("Response status: %s, body: %s", response.status_code, response.text)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_user_by_id(client, user_data):
    logger.info("Testing get user by ID")
    create_resp = client.post("/api/users/", json=user_data)
    logger.debug("Create response: %s", create_resp.text)
    if create_resp.status_code != 201:
        logger.error("Failed to create user: %s", create_resp.text)
    user_id = create_resp.json()["id"]

    response = client.get(f"/api/users/{user_id}")
    logger.debug("Get by ID response: %s", response.text)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id

def test_update_user(client, user_data):
    logger.info("Testing update user")
    create_resp = client.post("/api/users/", json=user_data)
    logger.debug("Create response: %s", create_resp.text)
    if create_resp.status_code != 201:
        logger.error("Failed to create user: %s", create_resp.text)
    user_id = create_resp.json()["id"]

    updated_data = user_data.copy()
    updated_data["username"] = "updatedpytestuser"
    logger.info("Updating user %s with data: %s", user_id, updated_data)
    response = client.put(f"/api/users/{user_id}", json=updated_data)
    logger.debug("Update response: %s", response.text)
    assert response.status_code == 200
    assert response.json()["username"] == "updatedpytestuser"

def test_delete_user(client, user_data):
    logger.info("Testing delete user")
    create_resp = client.post("/api/users/", json=user_data)
    logger.debug("Create response: %s", create_resp.text)
    if create_resp.status_code != 201:
        logger.error("Failed to create user: %s", create_resp.text)
    user_id = create_resp.json()["id"]

    response = client.delete(f"/api/users/{user_id}")
    logger.debug("Delete response: %s", response.text)
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"]

    response = client.get(f"/api/users/{user_id}")
    logger.debug("Get after delete response: %s", response.text)
    assert response.status_code == 404