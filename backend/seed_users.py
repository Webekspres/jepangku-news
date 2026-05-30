"""Seed additional users with activity for Jepangku MVP"""
import asyncio
import os
import sys
import random
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone, timedelta
import uuid
import bcrypt

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


SAMPLE_USERS = [
    {"name": "Sakura Tanaka", "username": "sakura_tanaka", "email": "sakura@jepangku.com", "bio": "Anime enthusiast & manga collector"},
    {"name": "Hiroshi Nakamura", "username": "hiroshi_n", "email": "hiroshi@jepangku.com", "bio": "Pelancong Jepang sejati"},
    {"name": "Akira Yamamoto", "username": "akira_yama", "email": "akira@jepangku.com", "bio": "Pecinta sushi dan ramen"},
    {"name": "Mei Watanabe", "username": "mei_watanabe", "email": "mei@jepangku.com", "bio": "Studi budaya pop Jepang"},
    {"name": "Kenji Suzuki", "username": "kenji_s", "email": "kenji@jepangku.com", "bio": "Otaku sejati dari Bandung"},
    {"name": "Yuki Kobayashi", "username": "yuki_k", "email": "yuki@jepangku.com", "bio": "Belajar bahasa Jepang setiap hari"},
    {"name": "Daichi Sato", "username": "daichi_sato", "email": "daichi@jepangku.com", "bio": "Tech & gaming aficionado"},
    {"name": "Rina Ishikawa", "username": "rina_ishi", "email": "rina@jepangku.com", "bio": "Travel blogger Jepang"},
    {"name": "Takeshi Mori", "username": "takeshi_m", "email": "takeshi@jepangku.com", "bio": "Manga artist wannabe"},
    {"name": "Aiko Fujimoto", "username": "aiko_f", "email": "aiko@jepangku.com", "bio": "Kawaii culture lover"},
]

DEFAULT_PASSWORD = "Jepangku2026!"


async def seed_users_with_activity():
    print("Seeding additional users with activity...")
    
    # Get articles, quiz, poll
    articles = await db.articles.find({"status": "published"}).to_list(20)
    quizzes = await db.quizzes.find({"status": "active"}).to_list(5)
    polls = await db.polls.find({"status": "active"}).to_list(5)
    
    if not articles:
        print("No articles found, run seed_data.py first")
        return
    
    created_count = 0
    for user_data in SAMPLE_USERS:
        existing = await db.users.find_one({"email": user_data["email"]})
        if existing:
            print(f"User {user_data['email']} already exists, skipping...")
            continue
        
        # Create user
        new_oid = ObjectId()
        user_id = str(new_oid)
        created_at = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
        
        user_doc = {
            "_id": new_oid,
            "name": user_data["name"],
            "username": user_data["username"],
            "email": user_data["email"],
            "password_hash": hash_password(DEFAULT_PASSWORD),
            "role": "user",
            "avatar_url": None,
            "status": "active",
            "total_points": 0,
            "created_at": created_at,
            "updated_at": created_at,
        }
        await db.users.insert_one(user_doc)
        
        profile_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "display_name": user_data["name"],
            "bio": user_data["bio"],
            "created_at": created_at,
            "updated_at": created_at,
        }
        await db.user_profiles.insert_one(profile_doc)
        
        # Generate activity (within the past 7 days for weekly leaderboard)
        total_points = 0
        
        # 1. Daily login rewards (3-5 days)
        login_days = random.randint(2, 5)
        for d in range(login_days):
            reward_date = (datetime.now(timezone.utc) - timedelta(days=d)).date()
            occurred = datetime.now(timezone.utc) - timedelta(days=d, hours=random.randint(0, 12))
            
            trans_id = str(uuid.uuid4())
            await db.point_transactions.insert_one({
                "_id": trans_id,
                "user_id": user_id,
                "source_app": "news",
                "activity_type": "daily_login",
                "source_type": "system",
                "source_id": None,
                "points": 3,
                "description": "Daily login reward",
                "occurred_at": occurred,
                "created_at": occurred,
            })
            await db.daily_login_rewards.insert_one({
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "source_app": "news",
                "reward_date": reward_date.isoformat(),
                "points_awarded": 3,
                "point_transaction_id": trans_id,
                "created_at": occurred,
            })
            total_points += 3
        
        # 2. Read articles (3-7 articles)
        articles_to_read = random.sample(articles, min(random.randint(3, 7), len(articles)))
        for article in articles_to_read:
            occurred = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 168))
            await db.point_transactions.insert_one({
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "source_app": "news",
                "activity_type": "article_read",
                "source_type": "article",
                "source_id": article["id"],
                "points": 2,
                "description": f"Read article: {article['title']}",
                "occurred_at": occurred,
                "created_at": occurred,
            })
            total_points += 2
            # Increase view count
            await db.articles.update_one({"id": article["id"]}, {"$inc": {"view_count": 1, "weekly_view_count": 1}})
        
        # 3. Bookmarks (1-3 articles)
        articles_to_bookmark = random.sample(articles, min(random.randint(1, 3), len(articles)))
        for article in articles_to_bookmark:
            occurred = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 100))
            await db.bookmarks.insert_one({
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "article_id": article["id"],
                "first_bookmarked_at": occurred,
                "deleted_at": None,
                "created_at": occurred,
                "updated_at": occurred,
            })
            await db.point_transactions.insert_one({
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "source_app": "news",
                "activity_type": "article_bookmarked",
                "source_type": "article",
                "source_id": article["id"],
                "points": 1,
                "description": f"Bookmarked article: {article['title']}",
                "occurred_at": occurred,
                "created_at": occurred,
            })
            await db.articles.update_one({"id": article["id"]}, {"$inc": {"bookmark_count": 1}})
            total_points += 1
        
        # 4. Take quiz (60% chance)
        if quizzes and random.random() < 0.6:
            quiz = quizzes[0]
            questions = await db.quiz_questions.find({"quiz_id": quiz["id"]}).to_list(50)
            
            correct_count = 0
            attempt_id = str(uuid.uuid4())
            
            for q in questions:
                options = await db.quiz_options.find({"question_id": q["id"]}).to_list(10)
                # 70% chance correct
                if options:
                    if random.random() < 0.7:
                        selected = next((o for o in options if o.get("is_correct")), options[0])
                        is_correct = True
                        correct_count += 1
                    else:
                        wrong = [o for o in options if not o.get("is_correct")]
                        selected = random.choice(wrong) if wrong else options[0]
                        is_correct = False
                    
                    await db.quiz_attempt_answers.insert_one({
                        "_id": str(uuid.uuid4()),
                        "attempt_id": attempt_id,
                        "question_id": q["id"],
                        "selected_option_id": selected["id"],
                        "is_correct": is_correct,
                        "created_at": datetime.now(timezone.utc),
                    })
            
            occurred = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 72))
            quiz_points = 10 + (correct_count * 5)
            
            await db.quiz_attempts.insert_one({
                "_id": attempt_id,
                "quiz_id": quiz["id"],
                "user_id": user_id,
                "score": (correct_count / len(questions) * 100) if questions else 0,
                "total_questions": len(questions),
                "correct_answers": correct_count,
                "points_awarded": quiz_points,
                "is_point_awarded": True,
                "started_at": occurred,
                "submitted_at": occurred,
                "created_at": occurred,
            })
            
            await db.point_transactions.insert_one({
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "source_app": "news",
                "activity_type": "quiz_completed",
                "source_type": "quiz",
                "source_id": quiz["id"],
                "points": 10,
                "description": f"Completed quiz: {quiz['title']}",
                "occurred_at": occurred,
                "created_at": occurred,
            })
            total_points += 10
            
            for i in range(correct_count):
                await db.point_transactions.insert_one({
                    "_id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "source_app": "news",
                    "activity_type": "quiz_correct_answer",
                    "source_type": "quiz",
                    "source_id": f"{quiz['id']}-q{i}",
                    "points": 5,
                    "description": f"Correct answer in quiz: {quiz['title']}",
                    "occurred_at": occurred,
                    "created_at": occurred,
                })
                total_points += 5
        
        # 5. Vote on poll (50% chance)
        if polls and random.random() < 0.5:
            poll = polls[0]
            options = await db.poll_options.find({"poll_id": poll["id"]}).to_list(10)
            if options:
                selected = random.choice(options)
                occurred = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 100))
                
                await db.poll_votes.insert_one({
                    "_id": str(uuid.uuid4()),
                    "poll_id": poll["id"],
                    "option_id": selected["id"],
                    "user_id": user_id,
                    "points_awarded": 5,
                    "is_point_awarded": True,
                    "voted_at": occurred,
                    "created_at": occurred,
                })
                await db.poll_options.update_one({"id": selected["id"]}, {"$inc": {"vote_count": 1}})
                
                await db.point_transactions.insert_one({
                    "_id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "source_app": "news",
                    "activity_type": "poll_joined",
                    "source_type": "poll",
                    "source_id": poll["id"],
                    "points": 5,
                    "description": f"Voted in poll: {poll['title']}",
                    "occurred_at": occurred,
                    "created_at": occurred,
                })
                total_points += 5
        
        # Update user total points
        await db.users.update_one({"_id": new_oid}, {"$set": {"total_points": total_points}})
        
        print(f"Created {user_data['name']} (@{user_data['username']}) with {total_points} points")
        created_count += 1
    
    print(f"\nSeeded {created_count} new users with activity!")
    print(f"All users password: {DEFAULT_PASSWORD}")


asyncio.run(seed_users_with_activity())
