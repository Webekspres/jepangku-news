from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"

class QuizStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"

class PollType(str, Enum):
    POLLING = "polling"
    VOTING = "voting"

class PollStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"

class ActivityType(str, Enum):
    ARTICLE_READ = "article_read"
    POLL_JOINED = "poll_joined"
    QUIZ_COMPLETED = "quiz_completed"
    QUIZ_CORRECT_ANSWER = "quiz_correct_answer"
    DAILY_LOGIN = "daily_login"
    ARTICLE_SHARED = "article_shared"
    ARTICLE_BOOKMARKED = "article_bookmarked"

class RegisterRequest(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    username: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    total_points: int = 0
    created_at: str

class ArticleCreate(BaseModel):
    title: str
    excerpt: Optional[str] = None
    content: str
    cover_image_url: Optional[str] = None
    category_id: Optional[str] = None
    tags: List[str] = []
    status: ArticleStatus = ArticleStatus.DRAFT

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[ArticleStatus] = None

class ArticleReview(BaseModel):
    note: Optional[str] = None

class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    questions: List[dict]
    status: QuizStatus = QuizStatus.DRAFT

class QuizAttempt(BaseModel):
    answers: List[dict]

class PollCreate(BaseModel):
    title: str
    description: Optional[str] = None
    poll_type: PollType = PollType.POLLING
    thumbnail_url: Optional[str] = None
    options: List[str]
    status: PollStatus = PollStatus.DRAFT

class PollVote(BaseModel):
    option_id: str

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    color: Optional[str] = None

class TagCreate(BaseModel):
    name: str
