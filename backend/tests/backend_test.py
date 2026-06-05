"""Backend API tests for TaxFile app: auth, documents, admin, contact."""
import os
import io
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://filetax-app.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@taxfile.com"
ADMIN_PASSWORD = "Admin@123"

TEST_USER_EMAIL = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
TEST_USER_PASSWORD = "Test@1234"
TEST_USER_NAME = "TEST User"


@pytest.fixture(scope="module")
def user_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/register", json={
        "email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD, "name": TEST_USER_NAME
    }, timeout=30)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={
        "email": ADMIN_EMAIL, "password": ADMIN_PASSWORD
    }, timeout=30)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return s


# ----- Auth -----
class TestAuth:
    def test_register_returns_user_and_sets_cookie(self):
        s = requests.Session()
        email = f"test_reg_{uuid.uuid4().hex[:6]}@example.com"
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "Pass@1234", "name": "TEST Reg"}, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert data["role"] == "user"
        assert "id" in data
        assert "access_token" in s.cookies

    def test_register_duplicate_email(self, user_session):
        r = requests.post(f"{API}/auth/register", json={
            "email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD, "name": "Dup"
        }, timeout=30)
        assert r.status_code == 400

    def test_login_success_and_me(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"
        me = s.get(f"{API}/auth/me", timeout=30)
        assert me.status_code == 200
        assert me.json()["email"] == ADMIN_EMAIL

    def test_login_invalid_password(self):
        email = f"test_inv_{uuid.uuid4().hex[:6]}@example.com"
        requests.post(f"{API}/auth/register", json={"email": email, "password": "Pass@1234", "name": "Inv"}, timeout=30)
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": "WrongPass"}, timeout=30)
        assert r.status_code == 401

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401

    def test_logout(self, user_session):
        r = user_session.post(f"{API}/auth/logout", timeout=30)
        assert r.status_code == 200
        # Re-login for subsequent tests
        rl = user_session.post(f"{API}/auth/login", json={
            "email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD
        }, timeout=30)
        assert rl.status_code == 200


# ----- Documents -----
class TestDocuments:
    doc_id = None

    def test_upload_pdf(self, user_session):
        pdf_bytes = b"%PDF-1.4\n%TestPDF\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"
        files = {"file": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        r = user_session.post(f"{API}/documents/upload", files=files, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["original_filename"] == "test.pdf"
        assert data["filing_status"] == "pending"
        assert data["content_type"] == "application/pdf"
        TestDocuments.doc_id = data["id"]

    def test_list_documents(self, user_session):
        r = user_session.get(f"{API}/documents", timeout=30)
        assert r.status_code == 200
        docs = r.json()
        assert any(d["id"] == TestDocuments.doc_id for d in docs)

    def test_download_document(self, user_session):
        assert TestDocuments.doc_id
        r = user_session.get(f"{API}/documents/{TestDocuments.doc_id}/download", timeout=60)
        assert r.status_code == 200
        assert len(r.content) > 0

    def test_upload_unsupported_extension(self, user_session):
        files = {"file": ("test.exe", io.BytesIO(b"abc"), "application/octet-stream")}
        r = user_session.post(f"{API}/documents/upload", files=files, timeout=30)
        assert r.status_code == 400

    def test_unauthenticated_upload(self):
        files = {"file": ("test.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")}
        r = requests.post(f"{API}/documents/upload", files=files, timeout=30)
        assert r.status_code == 401


# ----- Admin -----
class TestAdmin:
    def test_stats(self, admin_session):
        r = admin_session.get(f"{API}/admin/stats", timeout=30)
        assert r.status_code == 200
        d = r.json()
        for k in ["total_users", "total_documents", "pending_documents", "completed_documents"]:
            assert k in d
            assert isinstance(d[k], int)

    def test_list_users(self, admin_session):
        r = admin_session.get(f"{API}/admin/users", timeout=30)
        assert r.status_code == 200
        users = r.json()
        assert any(u["email"] == TEST_USER_EMAIL for u in users)

    def test_list_all_documents_admin(self, admin_session):
        r = admin_session.get(f"{API}/documents", timeout=30)
        assert r.status_code == 200

    def test_update_doc_status(self, admin_session):
        assert TestDocuments.doc_id
        r = admin_session.patch(
            f"{API}/admin/documents/{TestDocuments.doc_id}/status",
            json={"status": "processing"}, timeout=30
        )
        assert r.status_code == 200
        # Verify persisted
        rd = admin_session.get(f"{API}/documents", timeout=30)
        docs = rd.json()
        target = next((x for x in docs if x["id"] == TestDocuments.doc_id), None)
        assert target and target["filing_status"] == "processing"

    def test_non_admin_blocked_from_admin(self, user_session):
        r = user_session.get(f"{API}/admin/stats", timeout=30)
        assert r.status_code == 403


# ----- Delete after admin tests -----
class TestDocumentDelete:
    def test_delete_document(self, user_session):
        assert TestDocuments.doc_id
        r = user_session.delete(f"{API}/documents/{TestDocuments.doc_id}", timeout=30)
        assert r.status_code == 200
        r2 = user_session.get(f"{API}/documents", timeout=30)
        assert all(d["id"] != TestDocuments.doc_id for d in r2.json())


# ----- Contact -----
class TestContact:
    def test_submit_contact(self):
        r = requests.post(f"{API}/contact", json={
            "name": "TEST Contact", "email": "test_contact@example.com",
            "phone": "1234567890", "message": "Hello"
        }, timeout=30)
        assert r.status_code == 200
        assert "message" in r.json()
