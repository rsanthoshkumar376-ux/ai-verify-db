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
