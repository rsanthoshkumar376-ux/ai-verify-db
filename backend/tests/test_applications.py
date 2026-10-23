def test_list_categories(client):
    response = client.get("/api/v1/applications/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 4
    codes = [c["code"] for c in categories]
    assert "SCH-2026" in codes
    assert "BIZ-2026" in codes

def test_applicant_cannot_view_others_without_auth(client):
    response = client.get("/api/v1/applications/")
    assert response.status_code == 401

def test_applicant_applications_view(client):
    # Log in as applicant
    login_res = client.post("/api/v1/auth/login", json={
        "email": "applicant@aiverify.org",
        "password": "Applicant123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch applicant's list
    res = client.get("/api/v1/applications/", headers=headers)
    assert res.status_code == 200
    apps = res.json()
    assert len(apps) >= 1
    # Check that each application belongs to the applicant
    for a in apps:
        assert a["applicant_name"] == "Sarah Jenkins"

def test_reviewer_queue_access(client):
    # Log in as reviewer
    login_res = client.post("/api/v1/auth/login", json={
        "email": "reviewer@aiverify.org",
        "password": "Reviewer123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/applications/", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1
