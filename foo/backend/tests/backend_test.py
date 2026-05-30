"""
Jepangku MVP - Backend API Test Suite
Tests for auth, articles, bookmarks, quizzes, polls, points, leaderboard, admin endpoints.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://nippon-reads-beta.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@jepangku.com"
ADMIN_PASSWORD = "JepangkuAdmin2025!"

# Shared state across tests
state = {}


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------------- Fixtures ----------------------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    # Extract token from set-cookie
    cookies = r.cookies
    token = cookies.get("access_token")
    assert token, "No access_token cookie returned for admin login"
    state["admin_token"] = token
    state["admin_user"] = r.json()
    return token


@pytest.fixture(scope="session")
def user_credentials():
    suffix = uuid.uuid4().hex[:8]
    return {
        "name": f"TEST User {suffix}",
        "username": f"test_user_{suffix}",
        "email": f"TEST_user_{suffix}@example.com",
        "password": "TestPass123!",
    }


@pytest.fixture(scope="session")
def user_token(user_credentials):
    r = requests.post(f"{API}/auth/register", json=user_credentials)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    token = r.cookies.get("access_token")
    assert token, "No access_token cookie returned"
    data = r.json()
    state["user_id"] = data["id"]
    state["user_token"] = token
    state["user_credentials"] = user_credentials
    return token


# ---------------------- AUTH ----------------------
class TestAuth:
    def test_admin_login(self, admin_token):
        assert admin_token
        assert state["admin_user"]["role"] == "admin"
        assert state["admin_user"]["email"] == ADMIN_EMAIL

    def test_register_new_user(self, user_token, user_credentials):
        assert user_token
        assert state["user_id"]

    def test_login_with_new_user(self, user_credentials):
        r = requests.post(f"{API}/auth/login", json={
            "email": user_credentials["email"], "password": user_credentials["password"]
        })
        assert r.status_code == 200
        assert r.cookies.get("access_token")

    def test_login_invalid_credentials(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nouser@x.com", "password": "wrong"})
        assert r.status_code == 401

    def test_register_duplicate_email(self, user_credentials):
        r = requests.post(f"{API}/auth/register", json=user_credentials)
        assert r.status_code == 400

    def test_get_me_authenticated(self, user_token):
        r = requests.get(f"{API}/auth/me", headers=_auth_headers(user_token))
        assert r.status_code == 200
        assert r.json()["id"] == state["user_id"]

    def test_get_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout(self, user_token):
        r = requests.post(f"{API}/auth/logout")
        assert r.status_code == 200

    def test_daily_login_points(self, user_credentials, user_token):
        # On register, no daily login awarded; on first login of the day -> +3 pts
        r = requests.post(f"{API}/auth/login", json={
            "email": user_credentials["email"], "password": user_credentials["password"]
        })
        assert r.status_code == 200
        # Verify points transaction exists
        tok = r.cookies.get("access_token")
        pts = requests.get(f"{API}/points/my", headers=_auth_headers(tok))
        assert pts.status_code == 200
        types = [t["activity_type"] for t in pts.json()]
        assert "daily_login" in types, f"Expected daily_login in transactions, got: {types}"


# ---------------------- CATEGORIES / TAGS ----------------------
class TestCategoriesTags:
    def test_get_categories(self):
        r = requests.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list)
        assert len(cats) >= 10, f"Expected >=10 categories, got {len(cats)}"
        state["categories"] = cats
        slugs = [c["slug"] for c in cats]
        expected = {"anime", "manga", "culture", "travel", "food", "event", "technology", "lifestyle", "education", "fun"}
        assert expected.issubset(set(slugs)), f"Missing categories: {expected - set(slugs)}"

    def test_get_tags(self):
        r = requests.get(f"{API}/tags")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------------------- ARTICLES (PUBLIC) ----------------------
class TestArticlesPublic:
    def test_list_articles(self):
        r = requests.get(f"{API}/articles")
        assert r.status_code == 200
        data = r.json()
        assert "articles" in data and "total" in data
        assert data["total"] >= 9, f"Expected >=9 seeded articles, got {data['total']}"
        assert len(data["articles"]) > 0
        state["sample_article"] = data["articles"][0]

    def test_list_articles_sort_popular(self):
        r = requests.get(f"{API}/articles?sort=popular&limit=5")
        assert r.status_code == 200
        assert len(r.json()["articles"]) <= 5

    def test_list_articles_sort_trending(self):
        r = requests.get(f"{API}/articles?sort=trending")
        assert r.status_code == 200

    def test_list_articles_filter_category(self):
        r = requests.get(f"{API}/articles?category=anime")
        assert r.status_code == 200

    def test_list_articles_search(self):
        r = requests.get(f"{API}/articles?search=sakura")
        assert r.status_code == 200

    def test_article_detail_and_related(self):
        slug = state["sample_article"]["slug"]
        r = requests.get(f"{API}/articles/{slug}")
        assert r.status_code == 200
        a = r.json()
        assert a["slug"] == slug
        assert "related_articles" in a
        assert "tags" in a
        state["sample_article_id"] = a["id"]

    def test_article_detail_not_found(self):
        r = requests.get(f"{API}/articles/non-existent-slug-xyz-123")
        assert r.status_code == 404

    def test_read_complete_awards_points(self, user_token):
        aid = state["sample_article_id"]
        r = requests.post(f"{API}/articles/{aid}/read-complete", headers=_auth_headers(user_token))
        assert r.status_code == 200
        data = r.json()
        assert data["awarded"] is True
        assert data["points"] == 2

    def test_read_complete_idempotent(self, user_token):
        aid = state["sample_article_id"]
        r = requests.post(f"{API}/articles/{aid}/read-complete", headers=_auth_headers(user_token))
        assert r.status_code == 200
        data = r.json()
        assert data["awarded"] is False
        assert data["points"] == 0


# ---------------------- BOOKMARKS ----------------------
class TestBookmarks:
    def test_create_bookmark_first_time(self, user_token):
        aid = state["sample_article_id"]
        r = requests.post(f"{API}/bookmarks/{aid}", headers=_auth_headers(user_token))
        assert r.status_code == 200
        assert r.json().get("points_awarded") is True

    def test_get_bookmarks(self, user_token):
        r = requests.get(f"{API}/bookmarks", headers=_auth_headers(user_token))
        assert r.status_code == 200
        bookmarks = r.json()
        assert isinstance(bookmarks, list)
        assert any(b.get("id") == state["sample_article_id"] for b in bookmarks)

    def test_delete_bookmark(self, user_token):
        aid = state["sample_article_id"]
        r = requests.delete(f"{API}/bookmarks/{aid}", headers=_auth_headers(user_token))
        assert r.status_code == 200

    def test_rebookmark_no_additional_points(self, user_token):
        aid = state["sample_article_id"]
        r = requests.post(f"{API}/bookmarks/{aid}", headers=_auth_headers(user_token))
        assert r.status_code == 200
        # Should NOT award points the 2nd time
        assert r.json().get("points_awarded") is False


# ---------------------- ARTICLE SUBMIT/EDIT/DELETE FLOW ----------------------
class TestArticleSubmitFlow:
    def test_submit_article_pending(self, user_token):
        cat_id = None
        # category in /categories has "id" field
        for c in state["categories"]:
            if c["slug"] == "anime":
                cat_id = c.get("id")
                break
        payload = {
            "title": f"TEST My Submission {uuid.uuid4().hex[:6]}",
            "excerpt": "Test excerpt",
            "content": "<p>Test content</p>",
            "category_id": None,  # leave None, ObjectId conversion may fail with uuid string
            "tags": ["test-tag-a", "test-tag-b"],
            "status": "pending_review"
        }
        r = requests.post(f"{API}/articles", json=payload, headers=_auth_headers(user_token))
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "pending_review"
        state["submitted_article_id"] = data["id"]

    def test_my_articles_list(self, user_token):
        r = requests.get(f"{API}/articles/my/list", headers=_auth_headers(user_token))
        assert r.status_code == 200
        ids = [a["id"] for a in r.json()]
        assert state["submitted_article_id"] in ids

    def test_cannot_edit_pending_review(self, user_token):
        aid = state["submitted_article_id"]
        r = requests.put(f"{API}/articles/{aid}", json={"title": "New Title"},
                         headers=_auth_headers(user_token))
        # Article in pending_review - can only edit draft/rejected, so should fail
        assert r.status_code == 400

    def test_create_draft_then_edit(self, user_token):
        # Create a draft article
        r = requests.post(f"{API}/articles", json={
            "title": f"TEST Draft {uuid.uuid4().hex[:6]}",
            "content": "<p>draft</p>",
            "status": "draft",
            "tags": []
        }, headers=_auth_headers(user_token))
        assert r.status_code == 200
        draft_id = r.json()["id"]
        state["draft_article_id"] = draft_id
        # Now edit
        r2 = requests.put(f"{API}/articles/{draft_id}", json={"title": "TEST Edited Draft"},
                          headers=_auth_headers(user_token))
        assert r2.status_code == 200

    def test_delete_draft(self, user_token):
        aid = state["draft_article_id"]
        r = requests.delete(f"{API}/articles/{aid}", headers=_auth_headers(user_token))
        assert r.status_code == 200


# ---------------------- ADMIN: REVIEW ----------------------
class TestAdminReview:
    def test_non_admin_cannot_access_admin(self, user_token):
        r = requests.get(f"{API}/admin/articles/pending", headers=_auth_headers(user_token))
        assert r.status_code == 403

    def test_unauth_cannot_access_admin(self):
        r = requests.get(f"{API}/admin/articles/pending")
        assert r.status_code == 401

    def test_admin_get_pending_articles(self, admin_token):
        r = requests.get(f"{API}/admin/articles/pending", headers=_auth_headers(admin_token))
        assert r.status_code == 200
        ids = [a["id"] for a in r.json()]
        assert state["submitted_article_id"] in ids

    def test_admin_approve_article(self, admin_token):
        aid = state["submitted_article_id"]
        r = requests.post(f"{API}/admin/articles/{aid}/approve", headers=_auth_headers(admin_token))
        assert r.status_code == 200
        # verify it's published
        r2 = requests.get(f"{API}/admin/articles?status=published", headers=_auth_headers(admin_token))
        assert r2.status_code == 200
        ids = [a["id"] for a in r2.json()]
        assert aid in ids

    def test_admin_reject_flow(self, admin_token, user_token):
        # Create a new pending article from user
        r = requests.post(f"{API}/articles", json={
            "title": f"TEST Reject Me {uuid.uuid4().hex[:6]}",
            "content": "<p>x</p>",
            "status": "pending_review",
            "tags": []
        }, headers=_auth_headers(user_token))
        assert r.status_code == 200
        aid = r.json()["id"]
        # Admin rejects
        rr = requests.post(f"{API}/admin/articles/{aid}/reject",
                           json={"note": "Insufficient content"},
                           headers=_auth_headers(admin_token))
        assert rr.status_code == 200
        # User can now edit (rejected status)
        r2 = requests.put(f"{API}/articles/{aid}", json={"title": "TEST Edited After Reject"},
                          headers=_auth_headers(user_token))
        assert r2.status_code == 200
        # User can delete
        r3 = requests.delete(f"{API}/articles/{aid}", headers=_auth_headers(user_token))
        assert r3.status_code == 200


# ---------------------- QUIZZES ----------------------
class TestQuizzes:
    def test_list_quizzes(self):
        r = requests.get(f"{API}/quizzes")
        assert r.status_code == 200
        quizzes = r.json()
        assert len(quizzes) >= 1
        state["quiz"] = quizzes[0]

    def test_get_quiz_detail(self):
        slug = state["quiz"]["slug"]
        r = requests.get(f"{API}/quizzes/{slug}")
        assert r.status_code == 200
        q = r.json()
        assert "questions" in q
        assert len(q["questions"]) > 0
        # Ensure options don't reveal is_correct
        for question in q["questions"]:
            for opt in question["options"]:
                assert "is_correct" not in opt
        state["quiz_full"] = q

    def test_attempt_quiz(self, user_token):
        quiz = state["quiz_full"]
        # Pick first option for each question
        answers = []
        for q in quiz["questions"]:
            answers.append({
                "question_id": q["id"],
                "selected_option_id": q["options"][0]["id"]
            })
        r = requests.post(f"{API}/quizzes/{quiz['id']}/attempt",
                          json={"answers": answers}, headers=_auth_headers(user_token))
        assert r.status_code == 200, r.text
        data = r.json()
        assert "score" in data
        assert "points_awarded" in data
        assert data["points_awarded"] >= 10  # base 10 + 5*correct

    def test_quiz_single_attempt_only(self, user_token):
        quiz = state["quiz_full"]
        answers = [{"question_id": q["id"], "selected_option_id": q["options"][0]["id"]}
                   for q in quiz["questions"]]
        r = requests.post(f"{API}/quizzes/{quiz['id']}/attempt",
                          json={"answers": answers}, headers=_auth_headers(user_token))
        assert r.status_code == 400


# ---------------------- POLLS ----------------------
class TestPolls:
    def test_list_polls(self):
        r = requests.get(f"{API}/polls")
        assert r.status_code == 200
        polls = r.json()
        assert len(polls) >= 1
        state["poll"] = polls[0]

    def test_get_poll_detail(self):
        slug = state["poll"]["slug"]
        r = requests.get(f"{API}/polls/{slug}")
        assert r.status_code == 200
        p = r.json()
        assert "options" in p and len(p["options"]) > 0
        state["poll_full"] = p

    def test_vote_poll(self, user_token):
        poll = state["poll_full"]
        opt_id = poll["options"][0]["id"]
        r = requests.post(f"{API}/polls/{poll['id']}/vote",
                          json={"option_id": opt_id}, headers=_auth_headers(user_token))
        assert r.status_code == 200
        assert r.json()["points_awarded"] == 5

    def test_vote_once_per_poll(self, user_token):
        poll = state["poll_full"]
        opt_id = poll["options"][0]["id"]
        r = requests.post(f"{API}/polls/{poll['id']}/vote",
                          json={"option_id": opt_id}, headers=_auth_headers(user_token))
        assert r.status_code == 400


# ---------------------- POINTS & LEADERBOARD ----------------------
class TestPointsLeaderboard:
    def test_my_points(self, user_token):
        r = requests.get(f"{API}/points/my", headers=_auth_headers(user_token))
        assert r.status_code == 200
        txns = r.json()
        assert isinstance(txns, list)
        assert len(txns) > 0
        types = {t["activity_type"] for t in txns}
        # Should have multiple types from earlier tests
        assert {"article_read", "article_bookmarked", "quiz_completed", "poll_joined"}.issubset(types), \
            f"Missing types, got: {types}"

    def test_weekly_leaderboard(self):
        r = requests.get(f"{API}/leaderboard/weekly")
        assert r.status_code == 200
        lb = r.json()
        assert isinstance(lb, list)
        if lb:
            assert "weekly_points" in lb[0]
            assert "rank" in lb[0]


# ---------------------- ADMIN CRUD ----------------------
class TestAdminCRUD:
    def test_admin_stats(self, admin_token):
        r = requests.get(f"{API}/admin/stats", headers=_auth_headers(admin_token))
        assert r.status_code == 200
        data = r.json()
        for k in ["total_articles", "published_articles", "total_users", "total_quizzes", "total_polls"]:
            assert k in data

    def test_admin_create_category(self, admin_token):
        name = f"TEST Cat {uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/admin/categories",
                          json={"name": name, "color": "#123456"},
                          headers=_auth_headers(admin_token))
        assert r.status_code == 200
        assert "id" in r.json()

    def test_admin_create_quiz(self, admin_token):
        payload = {
            "title": f"TEST Quiz {uuid.uuid4().hex[:6]}",
            "description": "Test quiz",
            "status": "draft",
            "questions": [{
                "question_text": "What is 1+1?",
                "options": [
                    {"option_text": "1", "is_correct": False},
                    {"option_text": "2", "is_correct": True},
                ]
            }]
        }
        r = requests.post(f"{API}/admin/quizzes", json=payload, headers=_auth_headers(admin_token))
        assert r.status_code == 200
        assert "id" in r.json()

    def test_admin_create_poll(self, admin_token):
        payload = {
            "title": f"TEST Poll {uuid.uuid4().hex[:6]}",
            "description": "Test poll",
            "poll_type": "polling",
            "status": "draft",
            "options": ["Option A", "Option B"]
        }
        r = requests.post(f"{API}/admin/polls", json=payload, headers=_auth_headers(admin_token))
        assert r.status_code == 200
        assert "id" in r.json()


# ---------------------- FILE UPLOAD ----------------------
class TestUpload:
    def test_upload_and_download(self, user_token):
        # Create small in-memory file
        files = {"file": ("test.txt", b"hello jepangku", "text/plain")}
        r = requests.post(f"{API}/upload", files=files, headers=_auth_headers(user_token))
        assert r.status_code == 200, r.text
        data = r.json()
        assert "path" in data and "url" in data
        # Download via API
        dr = requests.get(f"{BASE_URL}{data['url']}")
        assert dr.status_code == 200
        assert dr.content == b"hello jepangku"

    def test_upload_unauth(self):
        files = {"file": ("test.txt", b"x", "text/plain")}
        r = requests.post(f"{API}/upload", files=files)
        assert r.status_code == 401
