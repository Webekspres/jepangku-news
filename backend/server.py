from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Response, Query
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
import uuid
import secrets
from typing import Optional, List
import re

from auth_utils import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    get_current_user, get_current_admin
)
from storage_utils import init_storage, put_object, get_object, APP_NAME
from models import (
    RegisterRequest, LoginRequest, UserResponse, ArticleStatus,
    ArticleCreate, ArticleUpdate, ArticleReview,
    QuizCreate, QuizAttempt, QuizStatus,
    PollCreate, PollVote, PollType, PollStatus,
    CategoryCreate, TagCreate, ActivityType
)

ROOT_DIR = Path(__file__).parent
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Helper function to create slug
def create_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return f"{slug}-{uuid.uuid4().hex[:8]}"

# Helper function to check article ownership
async def check_article_ownership(article_id: str, user_id: str) -> dict:
    try:
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        if str(article.get("author_id")) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this article")
        return article
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=400, detail=str(e))

# Helper function to award points
async def award_points(user_id: str, activity_type: str, source_type: str, source_id: str, points: int, description: str = None):
    try:
        existing = await db.point_transactions.find_one({
            "user_id": user_id,
            "source_app": "news",
            "activity_type": activity_type,
            "source_type": source_type,
            "source_id": source_id
        })
        
        if existing:
            return False
        
        transaction = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "source_app": "news",
            "activity_type": activity_type,
            "source_type": source_type,
            "source_id": source_id,
            "points": points,
            "description": description,
            "occurred_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.point_transactions.insert_one(transaction)
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"total_points": points}}
        )
        
        return True
    except Exception as e:
        logger.error(f"Error awarding points: {e}")
        return False

# Helper function for daily login reward
async def check_daily_login(user_id: str):
    try:
        today = datetime.now(timezone.utc).date()
        existing = await db.daily_login_rewards.find_one({
            "user_id": user_id,
            "source_app": "news",
            "reward_date": today.isoformat()
        })
        
        if not existing:
            points = 3
            trans_id = str(uuid.uuid4())
            transaction = {
                "_id": trans_id,
                "user_id": user_id,
                "source_app": "news",
                "activity_type": "daily_login",
                "source_type": "system",
                "source_id": None,
                "points": points,
                "description": "Daily login reward",
                "occurred_at": datetime.now(timezone.utc),
                "created_at": datetime.now(timezone.utc)
            }
            
            await db.point_transactions.insert_one(transaction)
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$inc": {"total_points": points}}
            )
            
            await db.daily_login_rewards.insert_one({
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "source_app": "news",
                "reward_date": today.isoformat(),
                "points_awarded": points,
                "point_transaction_id": trans_id,
                "created_at": datetime.now(timezone.utc)
            })
    except Exception as e:
        logger.error(f"Error checking daily login: {e}")

# ==================== AUTH ENDPOINTS ====================
@api_router.post("/auth/register")
async def register(data: RegisterRequest):
    try:
        email = data.email.lower()
        username = data.username.lower()
        
        existing_email = await db.users.find_one({"email": email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        existing_username = await db.users.find_one({"username": username})
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        new_oid = ObjectId()
        user_id = str(new_oid)
        user_doc = {
            "_id": new_oid,
            "name": data.name,
            "username": username,
            "email": email,
            "password_hash": hash_password(data.password),
            "role": "user",
            "avatar_url": None,
            "status": "active",
            "total_points": 0,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.users.insert_one(user_doc)
        
        profile_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "display_name": data.name,
            "bio": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.user_profiles.insert_one(profile_doc)
        
        access_token = create_access_token(user_id, email)
        refresh_token = create_refresh_token(user_id)
        
        response = JSONResponse(content={
            "id": user_id,
            "name": data.name,
            "username": username,
            "email": email,
            "role": "user",
            "avatar_url": None,
            "total_points": 0,
            "created_at": user_doc["created_at"].isoformat()
        })
        
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Register error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login")
async def login(data: LoginRequest):
    try:
        email_or_username = data.email.lower()
        
        user = await db.users.find_one({
            "$or": [
                {"email": email_or_username},
                {"username": email_or_username}
            ]
        })
        
        if not user or not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_id = str(user["_id"])
        await check_daily_login(user_id)
        
        user = await db.users.find_one({"_id": user["_id"]})
        
        access_token = create_access_token(user_id, user["email"])
        refresh_token = create_refresh_token(user_id)
        
        response = JSONResponse(content={
            "id": user_id,
            "name": user["name"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "avatar_url": user.get("avatar_url"),
            "total_points": user.get("total_points", 0),
            "created_at": user["created_at"].isoformat()
        })
        
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/logout")
async def logout():
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return response

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request, db)
    return user

# ==================== UPLOAD ENDPOINTS ====================
@api_router.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{user_id}/{uuid.uuid4()}.{ext}"
    
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/octet-stream")
    
    file_doc = {
        "_id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result["size"],
        "user_id": user_id,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc)
    }
    await db.files.insert_one(file_doc)
    
    return {"path": result["path"], "size": result["size"], "url": f"/api/files/{result['path']}"}

@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))

# ==================== CATEGORY & TAG ENDPOINTS ====================
@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({"is_active": True}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return categories

@api_router.get("/categories/{slug}")
async def get_category(slug: str):
    category = await db.categories.find_one({"slug": slug, "is_active": True}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@api_router.get("/tags")
async def get_tags():
    tags = await db.tags.find({}, {"_id": 0}).to_list(100)
    return tags

# ==================== ARTICLE ENDPOINTS (PUBLIC) ====================
@api_router.get("/articles")
async def get_articles(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "latest",
    limit: int = 20,
    skip: int = 0
):
    query = {
        "status": ArticleStatus.PUBLISHED.value,
        "visibility": "public"
    }
    
    if category:
        cat = await db.categories.find_one({"slug": category})
        if cat:
            query["category_id"] = cat["_id"]
    
    if tag:
        tag_doc = await db.tags.find_one({"slug": tag})
        if tag_doc:
            article_tags = await db.article_tags.find({"tag_id": tag_doc["_id"]}).to_list(1000)
            article_ids = [at["article_id"] for at in article_tags]
            query["_id"] = {"$in": [ObjectId(aid) for aid in article_ids]}
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"excerpt": {"$regex": search, "$options": "i"}}
        ]
    
    sort_option = [("published_at", -1)]
    if sort == "popular":
        sort_option = [("view_count", -1)]
    elif sort == "trending":
        sort_option = [("weekly_view_count", -1)]
    
    articles = await db.articles.find(query, {"_id": 0}).sort(sort_option).skip(skip).limit(limit).to_list(limit)
    total = await db.articles.count_documents(query)
    
    for article in articles:
        if article.get("author_id"):
            author = await db.users.find_one({"_id": ObjectId(article["author_id"])}, {"name": 1, "username": 1})
            article["author"] = {"name": author.get("name"), "username": author.get("username")} if author else None
        
        if article.get("category_id"):
            category = await db.categories.find_one({"_id": article["category_id"]}, {"name": 1, "slug": 1, "_id": 0})
            article["category"] = category if category else None
        article.pop("category_id", None)
    
    return {"articles": articles, "total": total, "limit": limit, "skip": skip}

@api_router.get("/articles/{slug}")
async def get_article(slug: str, request: Request):
    article = await db.articles.find_one({"slug": slug, "status": ArticleStatus.PUBLISHED.value}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    await db.articles.update_one(
        {"slug": slug},
        {"$inc": {"view_count": 1, "weekly_view_count": 1}}
    )
    
    if article.get("author_id"):
        author = await db.users.find_one({"_id": ObjectId(article["author_id"])}, {"name": 1, "username": 1, "avatar_url": 1, "_id": 0})
        article["author"] = author if author else None
    
    cat_id = article.get("category_id")
    if cat_id:
        category = await db.categories.find_one({"_id": cat_id}, {"_id": 0, "name": 1, "slug": 1, "id": 1, "color": 1})
        article["category"] = category if category else None
    article.pop("category_id", None)
    
    tag_associations = await db.article_tags.find({"article_id": article["id"]}).to_list(100)
    tag_ids = [ta["tag_id"] for ta in tag_associations]
    if tag_ids:
        # tag_ids stored as strings, need to query by them
        tag_obj_ids = []
        for tid in tag_ids:
            try:
                tag_obj_ids.append(ObjectId(tid))
            except Exception:
                pass
        tags = await db.tags.find({"_id": {"$in": tag_obj_ids}}, {"_id": 0, "name": 1, "slug": 1}).to_list(100) if tag_obj_ids else []
        article["tags"] = tags
    else:
        article["tags"] = []
    
    # Related articles
    related = []
    if article.get("category"):
        category_name = article["category"].get("slug")
        if category_name:
            cat_doc = await db.categories.find_one({"slug": category_name})
            if cat_doc:
                related_docs = await db.articles.find({
                    "category_id": cat_doc["_id"],
                    "slug": {"$ne": slug},
                    "status": ArticleStatus.PUBLISHED.value
                }, {"_id": 0}).limit(3).to_list(3)
                for rel in related_docs:
                    rel.pop("category_id", None)
                related = related_docs
    article["related_articles"] = related
    
    return article

@api_router.post("/articles/{article_id}/read-complete")
async def mark_article_read(article_id: str, request: Request):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    awarded = await award_points(
        user_id=user_id,
        activity_type=ActivityType.ARTICLE_READ.value,
        source_type="article",
        source_id=article_id,
        points=2,
        description=f"Read article: {article.get('title', 'Untitled')}"
    )
    
    return {"awarded": awarded, "points": 2 if awarded else 0}

# ==================== ARTICLE ENDPOINTS (USER) ====================
@api_router.get("/articles/my/list")
async def get_my_articles(request: Request):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    articles = await db.articles.find({"author_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for article in articles:
        if article.get("category_id"):
            category = await db.categories.find_one({"_id": article["category_id"]}, {"name": 1, "slug": 1, "_id": 0})
            article["category"] = category if category else None
        article.pop("category_id", None)
    
    return articles

@api_router.post("/articles")
async def create_article(request: Request, data: ArticleCreate):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    article_id = str(uuid.uuid4())
    slug = create_slug(data.title)
    
    article_doc = {
        "_id": ObjectId(),
        "id": article_id,
        "source_app": "news",
        "author_id": user_id,
        "category_id": ObjectId(data.category_id) if data.category_id else None,
        "title": data.title,
        "slug": slug,
        "excerpt": data.excerpt,
        "content": data.content,
        "cover_image_url": data.cover_image_url,
        "status": data.status.value,
        "visibility": "public",
        "is_featured": False,
        "is_hot": False,
        "published_at": None,
        "view_count": 0,
        "weekly_view_count": 0,
        "bookmark_count": 0,
        "share_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.articles.insert_one(article_doc)
    
    for tag_name in data.tags:
        tag_slug = create_slug(tag_name)
        tag = await db.tags.find_one({"slug": tag_slug})
        if not tag:
            tag_id = ObjectId()
            tag = {
                "_id": tag_id,
                "source_app": "news",
                "name": tag_name,
                "slug": tag_slug,
                "created_at": datetime.now(timezone.utc)
            }
            await db.tags.insert_one(tag)
        else:
            tag_id = tag["_id"]
        
        await db.article_tags.insert_one({
            "_id": str(uuid.uuid4()),
            "article_id": article_id,
            "tag_id": str(tag_id),
            "created_at": datetime.now(timezone.utc)
        })
    
    article_doc["_id"] = str(article_doc["_id"])
    if article_doc["category_id"]:
        article_doc["category_id"] = str(article_doc["category_id"])
    
    return article_doc

@api_router.put("/articles/{article_id}")
async def update_article(article_id: str, request: Request, data: ArticleUpdate):
    user = await get_current_user(request, db)
    article = await check_article_ownership(article_id, user["id"])
    
    if article["status"] not in [ArticleStatus.DRAFT.value, ArticleStatus.REJECTED.value]:
        raise HTTPException(status_code=400, detail="Can only edit draft or rejected articles")
    
    update_data = {}
    if data.title is not None:
        update_data["title"] = data.title
        update_data["slug"] = create_slug(data.title)
    if data.excerpt is not None:
        update_data["excerpt"] = data.excerpt
    if data.content is not None:
        update_data["content"] = data.content
    if data.cover_image_url is not None:
        update_data["cover_image_url"] = data.cover_image_url
    if data.category_id is not None:
        update_data["category_id"] = ObjectId(data.category_id)
    if data.status is not None:
        update_data["status"] = data.status.value
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.articles.update_one({"_id": ObjectId(article["_id"])}, {"$set": update_data})
    
    if data.tags is not None:
        await db.article_tags.delete_many({"article_id": article_id})
        
        for tag_name in data.tags:
            tag_slug = create_slug(tag_name)
            tag = await db.tags.find_one({"slug": tag_slug})
            if not tag:
                tag_id = ObjectId()
                tag = {
                    "_id": tag_id,
                    "source_app": "news",
                    "name": tag_name,
                    "slug": tag_slug,
                    "created_at": datetime.now(timezone.utc)
                }
                await db.tags.insert_one(tag)
            else:
                tag_id = tag["_id"]
            
            await db.article_tags.insert_one({
                "_id": str(uuid.uuid4()),
                "article_id": article_id,
                "tag_id": str(tag_id),
                "created_at": datetime.now(timezone.utc)
            })
    
    return {"message": "Article updated successfully"}

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, request: Request):
    user = await get_current_user(request, db)
    article = await check_article_ownership(article_id, user["id"])
    
    if article["status"] == ArticleStatus.PUBLISHED.value:
        raise HTTPException(status_code=400, detail="Cannot delete published articles")
    
    await db.articles.delete_one({"_id": ObjectId(article["_id"])})
    await db.article_tags.delete_many({"article_id": article_id})
    
    return {"message": "Article deleted successfully"}

# ==================== BOOKMARK ENDPOINTS ====================
@api_router.post("/bookmarks/{article_id}")
async def bookmark_article(article_id: str, request: Request):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    existing = await db.bookmarks.find_one({"user_id": user_id, "article_id": article_id, "deleted_at": None})
    if existing:
        return {"message": "Already bookmarked"}
    
    old_bookmark = await db.bookmarks.find_one({"user_id": user_id, "article_id": article_id})
    
    if old_bookmark:
        await db.bookmarks.update_one(
            {"_id": old_bookmark["_id"]},
            {"$set": {"deleted_at": None, "updated_at": datetime.now(timezone.utc)}}
        )
        points_awarded = False
    else:
        await db.bookmarks.insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "article_id": article_id,
            "first_bookmarked_at": datetime.now(timezone.utc),
            "deleted_at": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        
        points_awarded = await award_points(
            user_id=user_id,
            activity_type=ActivityType.ARTICLE_BOOKMARKED.value,
            source_type="article",
            source_id=article_id,
            points=1,
            description=f"Bookmarked article: {article.get('title', 'Untitled')}"
        )
    
    await db.articles.update_one({"id": article_id}, {"$inc": {"bookmark_count": 1}})
    
    return {"message": "Article bookmarked", "points_awarded": points_awarded}

@api_router.delete("/bookmarks/{article_id}")
async def remove_bookmark(article_id: str, request: Request):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    bookmark = await db.bookmarks.find_one({"user_id": user_id, "article_id": article_id, "deleted_at": None})
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    await db.bookmarks.update_one(
        {"_id": bookmark["_id"]},
        {"$set": {"deleted_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}}
    )
    
    await db.articles.update_one({"id": article_id}, {"$inc": {"bookmark_count": -1}})
    
    return {"message": "Bookmark removed"}

@api_router.get("/bookmarks")
async def get_bookmarks(request: Request):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    bookmarks = await db.bookmarks.find({"user_id": user_id, "deleted_at": None}).sort("created_at", -1).to_list(100)
    
    article_ids = [b["article_id"] for b in bookmarks]
    articles = []
    
    for aid in article_ids:
        article = await db.articles.find_one({"id": aid}, {"_id": 0})
        if article:
            if article.get("category_id"):
                category = await db.categories.find_one({"_id": article["category_id"]}, {"name": 1, "slug": 1, "_id": 0})
                article["category"] = category if category else None
            article.pop("category_id", None)
            articles.append(article)
    
    return articles

# ==================== QUIZ ENDPOINTS ====================
@api_router.get("/quizzes")
async def get_quizzes(status: str = "active"):
    query = {"status": status}
    quizzes = await db.quizzes.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for quiz in quizzes:
        question_count = await db.quiz_questions.count_documents({"quiz_id": quiz["id"]})
        quiz["question_count"] = question_count
    
    return quizzes

@api_router.get("/quizzes/{slug}")
async def get_quiz(slug: str):
    quiz = await db.quizzes.find_one({"slug": slug}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    questions = await db.quiz_questions.find({"quiz_id": quiz["id"]}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    
    for question in questions:
        options = await db.quiz_options.find({"question_id": question["id"]}, {"_id": 0, "is_correct": 0}).sort("sort_order", 1).to_list(10)
        question["options"] = options
    
    quiz["questions"] = questions
    return quiz

@api_router.post("/quizzes/{quiz_id}/attempt")
async def attempt_quiz(quiz_id: str, request: Request, data: QuizAttempt):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    quiz = await db.quizzes.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    existing_attempt = await db.quiz_attempts.find_one({"quiz_id": quiz_id, "user_id": user_id})
    if existing_attempt:
        raise HTTPException(status_code=400, detail="You have already attempted this quiz")
    
    questions = await db.quiz_questions.find({"quiz_id": quiz_id}).to_list(100)
    total_questions = len(questions)
    correct_answers = 0
    
    attempt_id = str(uuid.uuid4())
    
    for answer in data.answers:
        question_id = answer.get("question_id")
        selected_option_id = answer.get("selected_option_id")
        
        option = await db.quiz_options.find_one({"id": selected_option_id})
        is_correct = option.get("is_correct", False) if option else False
        
        if is_correct:
            correct_answers += 1
        
        await db.quiz_attempt_answers.insert_one({
            "_id": str(uuid.uuid4()),
            "attempt_id": attempt_id,
            "question_id": question_id,
            "selected_option_id": selected_option_id,
            "is_correct": is_correct,
            "created_at": datetime.now(timezone.utc)
        })
    
    score = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    base_points = quiz.get("points_reward", 10)
    correct_answer_points = quiz.get("correct_answer_points", 5)
    total_points = base_points + (correct_answers * correct_answer_points)
    
    await db.quiz_attempts.insert_one({
        "_id": attempt_id,
        "quiz_id": quiz_id,
        "user_id": user_id,
        "score": score,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "points_awarded": total_points,
        "is_point_awarded": True,
        "started_at": datetime.now(timezone.utc),
        "submitted_at": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc)
    })
    
    await award_points(
        user_id=user_id,
        activity_type=ActivityType.QUIZ_COMPLETED.value,
        source_type="quiz",
        source_id=quiz_id,
        points=base_points,
        description=f"Completed quiz: {quiz.get('title', 'Untitled')}"
    )
    
    for i in range(correct_answers):
        await award_points(
            user_id=user_id,
            activity_type=ActivityType.QUIZ_CORRECT_ANSWER.value,
            source_type="quiz",
            source_id=f"{quiz_id}-q{i}",
            points=correct_answer_points,
            description=f"Correct answer in quiz: {quiz.get('title', 'Untitled')}"
        )
    
    return {
        "attempt_id": attempt_id,
        "score": score,
        "correct_answers": correct_answers,
        "total_questions": total_questions,
        "points_awarded": total_points
    }

# ==================== POLL ENDPOINTS ====================
@api_router.get("/polls")
async def get_polls(status: str = "active"):
    query = {"status": status}
    polls = await db.polls.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for poll in polls:
        options = await db.poll_options.find({"poll_id": poll["id"]}, {"_id": 0}).sort("sort_order", 1).to_list(100)
        poll["options"] = options
        total_votes = sum([opt.get("vote_count", 0) for opt in options])
        poll["total_votes"] = total_votes
    
    return polls

@api_router.get("/polls/{slug}")
async def get_poll(slug: str):
    poll = await db.polls.find_one({"slug": slug}, {"_id": 0})
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    options = await db.poll_options.find({"poll_id": poll["id"]}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    poll["options"] = options
    
    total_votes = sum([opt.get("vote_count", 0) for opt in options])
    poll["total_votes"] = total_votes
    
    for option in poll["options"]:
        option["percentage"] = (option.get("vote_count", 0) / total_votes * 100) if total_votes > 0 else 0
    
    return poll

@api_router.post("/polls/{poll_id}/vote")
async def vote_poll(poll_id: str, request: Request, data: PollVote):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    poll = await db.polls.find_one({"id": poll_id})
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    existing_vote = await db.poll_votes.find_one({"poll_id": poll_id, "user_id": user_id})
    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already voted on this poll")
    
    option = await db.poll_options.find_one({"id": data.option_id})
    if not option or option["poll_id"] != poll_id:
        raise HTTPException(status_code=400, detail="Invalid option")
    
    await db.poll_votes.insert_one({
        "_id": str(uuid.uuid4()),
        "poll_id": poll_id,
        "option_id": data.option_id,
        "user_id": user_id,
        "points_awarded": 5,
        "is_point_awarded": True,
        "voted_at": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc)
    })
    
    await db.poll_options.update_one({"id": data.option_id}, {"$inc": {"vote_count": 1}})
    
    await award_points(
        user_id=user_id,
        activity_type=ActivityType.POLL_JOINED.value,
        source_type="poll",
        source_id=poll_id,
        points=5,
        description=f"Voted in poll: {poll.get('title', 'Untitled')}"
    )
    
    return {"message": "Vote recorded", "points_awarded": 5}

# ==================== POINTS & LEADERBOARD ====================
@api_router.get("/points/my")
async def get_my_points(request: Request):
    user = await get_current_user(request, db)
    user_id = user["id"]
    
    transactions = await db.point_transactions.find(
        {"user_id": user_id, "source_app": "news"},
        {"_id": 0}
    ).sort("occurred_at", -1).limit(100).to_list(100)
    
    return transactions

@api_router.get("/leaderboard/weekly")
async def get_weekly_leaderboard():
    week_start = datetime.now(timezone.utc) - timedelta(days=7)
    
    pipeline = [
        {
            "$match": {
                "source_app": "news",
                "occurred_at": {"$gte": week_start}
            }
        },
        {
            "$group": {
                "_id": "$user_id",
                "weekly_points": {"$sum": "$points"}
            }
        },
        {
            "$sort": {"weekly_points": -1}
        },
        {
            "$limit": 10
        }
    ]
    
    results = await db.point_transactions.aggregate(pipeline).to_list(10)
    
    leaderboard = []
    rank = 1
    
    for result in results:
        user_id = result["_id"]
        user = await db.users.find_one({"_id": ObjectId(user_id)}, {"name": 1, "username": 1, "avatar_url": 1})
        profile = await db.user_profiles.find_one({"user_id": user_id}, {"display_name": 1})
        
        if user:
            leaderboard.append({
                "rank": rank,
                "user_id": user_id,
                "display_name": profile.get("display_name") if profile else user.get("name"),
                "username": user.get("username"),
                "avatar_url": user.get("avatar_url"),
                "weekly_points": result["weekly_points"]
            })
            rank += 1
    
    return leaderboard

# ==================== ADMIN ENDPOINTS ====================
@api_router.get("/admin/articles")
async def admin_get_articles(request: Request, status: Optional[str] = None):
    await get_current_admin(request, db)
    
    query = {}
    if status:
        query["status"] = status
    
    articles = await db.articles.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    
    for article in articles:
        if article.get("author_id"):
            author = await db.users.find_one({"_id": ObjectId(article["author_id"])}, {"name": 1, "username": 1, "_id": 0})
            article["author"] = author if author else None
        
        if article.get("category_id"):
            category = await db.categories.find_one({"_id": article["category_id"]}, {"name": 1, "slug": 1, "_id": 0})
            article["category"] = category if category else None
        article.pop("category_id", None)
    
    return articles

@api_router.get("/admin/articles/pending")
async def admin_get_pending_articles(request: Request):
    await get_current_admin(request, db)
    
    articles = await db.articles.find(
        {"status": ArticleStatus.PENDING_REVIEW.value},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    for article in articles:
        if article.get("author_id"):
            author = await db.users.find_one({"_id": ObjectId(article["author_id"])}, {"name": 1, "username": 1, "email": 1, "_id": 0})
            article["author"] = author if author else None
        article.pop("category_id", None)
    
    return articles

@api_router.post("/admin/articles/{article_id}/approve")
async def admin_approve_article(article_id: str, request: Request):
    admin = await get_current_admin(request, db)
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    await db.articles.update_one(
        {"id": article_id},
        {
            "$set": {
                "status": ArticleStatus.PUBLISHED.value,
                "published_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    await db.article_reviews.insert_one({
        "_id": str(uuid.uuid4()),
        "article_id": article_id,
        "reviewer_id": admin["id"],
        "previous_status": article["status"],
        "new_status": ArticleStatus.PUBLISHED.value,
        "note": "Approved",
        "reviewed_at": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Article approved and published"}

@api_router.post("/admin/articles/{article_id}/reject")
async def admin_reject_article(article_id: str, request: Request, data: ArticleReview):
    admin = await get_current_admin(request, db)
    
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    await db.articles.update_one(
        {"id": article_id},
        {
            "$set": {
                "status": ArticleStatus.REJECTED.value,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    await db.article_reviews.insert_one({
        "_id": str(uuid.uuid4()),
        "article_id": article_id,
        "reviewer_id": admin["id"],
        "previous_status": article["status"],
        "new_status": ArticleStatus.REJECTED.value,
        "note": data.note or "Rejected",
        "reviewed_at": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Article rejected"}

@api_router.post("/admin/categories")
async def admin_create_category(request: Request, data: CategoryCreate):
    await get_current_admin(request, db)
    
    slug = create_slug(data.name)
    
    category = {
        "_id": ObjectId(),
        "id": str(uuid.uuid4()),
        "source_app": "news",
        "name": data.name,
        "slug": slug,
        "description": data.description,
        "icon_url": data.icon_url,
        "color": data.color,
        "is_active": True,
        "sort_order": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.categories.insert_one(category)
    
    return {"message": "Category created", "id": category["id"]}

@api_router.post("/admin/quizzes")
async def admin_create_quiz(request: Request, data: QuizCreate):
    admin = await get_current_admin(request, db)
    
    quiz_id = str(uuid.uuid4())
    slug = create_slug(data.title)
    
    quiz_doc = {
        "_id": ObjectId(),
        "id": quiz_id,
        "source_app": "news",
        "created_by": admin["id"],
        "title": data.title,
        "slug": slug,
        "description": data.description,
        "thumbnail_url": data.thumbnail_url,
        "quiz_type": "trivia",
        "status": data.status.value,
        "points_reward": 10,
        "correct_answer_points": 5,
        "allow_retry": False,
        "show_result_immediately": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.quizzes.insert_one(quiz_doc)
    
    for i, question in enumerate(data.questions):
        question_id = str(uuid.uuid4())
        
        question_doc = {
            "_id": ObjectId(),
            "id": question_id,
            "quiz_id": quiz_id,
            "question_text": question["question_text"],
            "image_url": question.get("image_url"),
            "sort_order": i,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.quiz_questions.insert_one(question_doc)
        
        for j, option in enumerate(question["options"]):
            option_doc = {
                "_id": ObjectId(),
                "id": str(uuid.uuid4()),
                "question_id": question_id,
                "option_text": option["option_text"],
                "image_url": option.get("image_url"),
                "is_correct": option.get("is_correct", False),
                "sort_order": j,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            
            await db.quiz_options.insert_one(option_doc)
    
    return {"message": "Quiz created", "id": quiz_id}

@api_router.post("/admin/polls")
async def admin_create_poll(request: Request, data: PollCreate):
    admin = await get_current_admin(request, db)
    
    poll_id = str(uuid.uuid4())
    slug = create_slug(data.title)
    
    poll_doc = {
        "_id": ObjectId(),
        "id": poll_id,
        "source_app": "news",
        "created_by": admin["id"],
        "title": data.title,
        "slug": slug,
        "description": data.description,
        "poll_type": data.poll_type.value,
        "status": data.status.value,
        "thumbnail_url": data.thumbnail_url,
        "points_reward": 5,
        "allow_guest_vote": False,
        "show_result_before_vote": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.polls.insert_one(poll_doc)
    
    for i, option_text in enumerate(data.options):
        option_doc = {
            "_id": ObjectId(),
            "id": str(uuid.uuid4()),
            "poll_id": poll_id,
            "option_text": option_text,
            "vote_count": 0,
            "sort_order": i,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.poll_options.insert_one(option_doc)
    
    return {"message": "Poll created", "id": poll_id}

@api_router.get("/admin/stats")
async def admin_get_stats(request: Request):
    await get_current_admin(request, db)
    
    total_articles = await db.articles.count_documents({})
    pending_articles = await db.articles.count_documents({"status": ArticleStatus.PENDING_REVIEW.value})
    published_articles = await db.articles.count_documents({"status": ArticleStatus.PUBLISHED.value})
    total_users = await db.users.count_documents({"role": "user"})
    total_quizzes = await db.quizzes.count_documents({})
    total_polls = await db.polls.count_documents({})
    
    return {
        "total_articles": total_articles,
        "pending_articles": pending_articles,
        "published_articles": published_articles,
        "total_users": total_users,
        "total_quizzes": total_quizzes,
        "total_polls": total_polls
    }

# ==================== STARTUP & SEEDING ====================
@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.articles.create_index("slug")
    await db.articles.create_index("status")
    await db.quizzes.create_index("slug")
    await db.polls.create_index("slug")
    
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@jepangku.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "JepangkuAdmin2025!")
    
    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "_id": ObjectId(),
            "email": admin_email,
            "username": "admin",
            "password_hash": hashed,
            "name": "Admin Jepangku",
            "role": "admin",
            "status": "active",
            "total_points": 0,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing_admin["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info("Admin password updated")
    
    categories_data = [
        {"name": "Anime", "slug": "anime", "color": "#D90429"},
        {"name": "Manga", "slug": "manga", "color": "#0A0A0A"},
        {"name": "Culture", "slug": "culture", "color": "#D90429"},
        {"name": "Travel", "slug": "travel", "color": "#0A0A0A"},
        {"name": "Food", "slug": "food", "color": "#D90429"},
        {"name": "Event", "slug": "event", "color": "#0A0A0A"},
        {"name": "Technology", "slug": "technology", "color": "#D90429"},
        {"name": "Lifestyle", "slug": "lifestyle", "color": "#0A0A0A"},
        {"name": "Education", "slug": "education", "color": "#D90429"},
        {"name": "Fun", "slug": "fun", "color": "#0A0A0A"}
    ]
    
    for i, cat_data in enumerate(categories_data):
        existing_cat = await db.categories.find_one({"slug": cat_data["slug"]})
        if not existing_cat:
            await db.categories.insert_one({
                "_id": ObjectId(),
                "id": str(uuid.uuid4()),
                "source_app": "news",
                "name": cat_data["name"],
                "slug": cat_data["slug"],
                "description": None,
                "icon_url": None,
                "color": cat_data["color"],
                "is_active": True,
                "sort_order": i,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
    
    logger.info("Categories seeded")
    
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials for Jepangku MVP\n\n")
        f.write("## Admin Account\n")
        f.write(f"- **Email**: {admin_email}\n")
        f.write(f"- **Password**: {admin_password}\n")
        f.write("- **Role**: admin\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/logout\n")
        f.write("- GET /api/auth/me\n\n")
        f.write("## Test User (Register manually)\n")
        f.write("- Use /api/auth/register to create test users\n")

app.include_router(api_router)

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
