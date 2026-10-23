def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AI Verify" in data["platform"]

def test_login_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "applicant@aiverify.org",
        "password": "Applicant123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "APPLICANT"

def test_login_invalid_credentials(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "applicant@aiverify.org",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_reviewer_login(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "reviewer@aiverify.org",
        "password": "Reviewer123!"
    })
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "REVIEWER"

def test_admin_login(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@aiverify.org",
        "password": "Admin123!"
    })
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "ADMIN"

def test_register_new_applicant(client):
    import uuid
    random_email = f"user_{uuid.uuid4().hex[:8]}@aiverify.org"
    response = client.post("/api/v1/auth/register", json={
        "email": random_email,
        "password": "StrongPassword123!",
        "full_name": "Test Applicant",
        "organization": "Test Org"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == random_email
    assert data["user"]["role"] == "APPLICANT"

def test_register_duplicate_email(client):
    # Try registering with existing seeded email
    response = client.post("/api/v1/auth/register", json={
        "email": "applicant@aiverify.org",
        "password": "AnotherPassword123!",
        "full_name": "Duplicate User"
    })
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()
