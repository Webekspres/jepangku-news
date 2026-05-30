"""Seed dummy articles for Jepangku MVP demo"""
import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone, timedelta
import uuid
import re

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


def create_slug(title):
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return f"{slug}-{uuid.uuid4().hex[:8]}"


SAMPLE_ARTICLES = [
    {
        "title": "Sakura Bloom 2026: Tempat Terbaik Lihat Bunga Sakura di Jepang",
        "category_slug": "travel",
        "excerpt": "Musim semi telah tiba! Inilah 10 lokasi terbaik untuk menikmati keindahan bunga sakura tahun ini.",
        "content": "<p>Musim semi di Jepang adalah salah satu momen paling magis dalam setahun. Ketika bunga sakura mulai mekar, seluruh negara berubah menjadi lautan warna pink yang memukau.</p><h2>1. Ueno Park, Tokyo</h2><p>Salah satu hotspot hanami paling populer di Tokyo dengan lebih dari 1000 pohon sakura.</p><h2>2. Maruyama Park, Kyoto</h2><p>Terkenal dengan pohon sakura raksasa yang diterangi pada malam hari.</p><h2>3. Hirosaki Castle, Aomori</h2><p>Pemandangan kastil dikelilingi sakura yang menakjubkan.</p>",
        "cover_image_url": "https://images.unsplash.com/photo-1558870832-c8db4b5b47d1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "is_featured": True,
        "is_hot": True,
    },
    {
        "title": "Anime Musim Spring 2026: 5 Judul Wajib Tonton",
        "category_slug": "anime",
        "excerpt": "Daftar anime baru yang siap menghibur kamu di musim semi ini, dari aksi hingga slice of life.",
        "content": "<p>Musim spring 2026 kembali menghadirkan deretan anime berkualitas. Berikut adalah pilihan terbaik yang wajib masuk watchlist kamu:</p><h2>1. Chainsaw Man Season 2</h2><p>Kelanjutan kisah Denji yang penuh aksi dan kekacauan.</p><h2>2. Spy x Family Season 3</h2><p>Keluarga Forger kembali dengan misi-misi baru.</p>",
        "cover_image_url": "https://images.unsplash.com/photo-1534085757171-98a01360495c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "is_hot": True,
    },
    {
        "title": "Mengenal Ikigai: Filosofi Hidup Bahagia ala Jepang",
        "category_slug": "culture",
        "excerpt": "Konsep Ikigai mengajarkan kita menemukan tujuan hidup melalui perpaduan passion, mission, vocation, dan profession.",
        "content": "<p>Ikigai (生き甲斐) adalah konsep filosofis Jepang yang berarti 'alasan untuk hidup'. Kata ini berasal dari iki (hidup) dan gai (nilai atau alasan).</p><p>Filosofi ini menggabungkan empat elemen kunci:</p><ul><li>Apa yang kamu cintai</li><li>Apa yang kamu kuasai</li><li>Apa yang dunia butuhkan</li><li>Apa yang bisa dibayar</li></ul>",
        "cover_image_url": "https://images.unsplash.com/photo-1545569310-29ddd0a82dac?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    },
    {
        "title": "Ramen vs Udon vs Soba: Mie Mana yang Paling Otentik?",
        "category_slug": "food",
        "excerpt": "Tiga jenis mie ikonik Jepang ini punya karakter dan sejarah yang berbeda. Mana favoritmu?",
        "content": "<p>Jepang dikenal sebagai negara dengan budaya mie yang sangat kaya. Tiga jenis mie paling populer adalah ramen, udon, dan soba. Masing-masing punya keunikan tersendiri.</p><h2>Ramen</h2><p>Mie tipis dengan kuah kaldu kaya rasa. Bisa shoyu, miso, tonkotsu, atau shio.</p><h2>Udon</h2><p>Mie tebal yang kenyal, biasanya disajikan dengan kuah ringan.</p>",
        "cover_image_url": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    },
    {
        "title": "10 Manga Terlaris Sepanjang Masa di Jepang",
        "category_slug": "manga",
        "excerpt": "Dari One Piece hingga Dragon Ball, inilah manga yang telah mencetak rekor penjualan global.",
        "content": "<p>Industri manga Jepang telah melahirkan banyak karya legendaris. Berikut adalah top 10 manga dengan penjualan tertinggi:</p><h2>1. One Piece - 516.6 juta copy</h2><p>Karya Eiichiro Oda yang masih berjalan hingga kini.</p><h2>2. Golgo 13 - 300 juta copy</h2><p>Manga aksi seinen terpanjang yang masih aktif.</p>",
        "cover_image_url": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "is_featured": False,
    },
    {
        "title": "Akihabara: Surga Anime dan Elektronik di Jantung Tokyo",
        "category_slug": "travel",
        "excerpt": "Jalan-jalan virtual ke distrik Akihabara yang penuh dengan toko anime, manga, gaming, dan maid cafe.",
        "content": "<p>Akihabara, atau yang akrab disebut 'Akiba', adalah distrik di Tokyo yang menjadi pusat budaya pop Jepang. Dari toko manga raksasa hingga arcade game lawas, semuanya bisa kamu temui di sini.</p><h2>Yang Wajib Dikunjungi</h2><ul><li>Mandarake - Toko manga & figure bekas terlengkap</li><li>Super Potato - Game retro paradise</li><li>Maid Cafe - Pengalaman unik ala anime</li></ul>",
        "cover_image_url": "https://images.unsplash.com/photo-1542931287-023b922fa89b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        "is_hot": True,
    },
    {
        "title": "Mengapa Generasi Muda Jepang Lebih Suka Solo Living?",
        "category_slug": "lifestyle",
        "excerpt": "Tren solo culture di Jepang semakin meningkat. Apa penyebabnya dan bagaimana dampaknya?",
        "content": "<p>Di Jepang modern, semakin banyak anak muda yang memilih hidup sendiri tanpa pasangan atau keluarga. Fenomena ini disebut 'ohitorisama' (sendirian).</p><p>Penyebab tren ini bervariasi:</p><ul><li>Tingginya biaya hidup di kota besar</li><li>Fokus pada karir dan pengembangan diri</li><li>Kebebasan personal</li></ul>",
        "cover_image_url": "https://images.unsplash.com/photo-1480796927426-f609979314bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    },
    {
        "title": "Belajar Bahasa Jepang dari 0: Hiragana dan Katakana",
        "category_slug": "education",
        "excerpt": "Panduan lengkap memulai pembelajaran bahasa Jepang dengan dua sistem tulisan dasar.",
        "content": "<p>Bahasa Jepang menggunakan tiga sistem tulisan: Hiragana (ひらがな), Katakana (カタカナ), dan Kanji (漢字). Sebagai pemula, fokuslah pada Hiragana dan Katakana terlebih dahulu.</p><h2>Hiragana</h2><p>Digunakan untuk kata-kata asli Jepang. Total 46 karakter dasar.</p><h2>Katakana</h2><p>Digunakan untuk kata serapan dari bahasa asing. Juga 46 karakter dasar.</p>",
        "cover_image_url": "https://images.unsplash.com/photo-1528164344705-47542687000d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    },
    {
        "title": "Comiket 2026: Event Manga Terbesar di Dunia",
        "category_slug": "event",
        "excerpt": "Persiapkan dirimu! Comiket musim winter 2026 akan kembali dengan ratusan ribu doujinshi unik.",
        "content": "<p>Comic Market atau Comiket adalah event doujinshi (komik amatir/penggemar) terbesar di dunia yang diadakan dua kali setahun di Tokyo Big Sight.</p><p>Event ini menjadi tempat berkumpulnya creator, kolektor, dan penggemar dari seluruh dunia.</p>",
        "cover_image_url": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    },
]


async def seed_articles():
    print("Seeding articles...")
    
    admin = await db.users.find_one({"role": "admin"})
    if not admin:
        print("No admin user found")
        return
    
    admin_id = str(admin["_id"])
    
    # Get categories
    categories = {}
    async for cat in db.categories.find({}):
        categories[cat["slug"]] = cat
    
    existing_count = await db.articles.count_documents({})
    if existing_count > 0:
        print(f"Already have {existing_count} articles, skipping...")
        return
    
    for idx, article in enumerate(SAMPLE_ARTICLES):
        category = categories.get(article["category_slug"])
        if not category:
            print(f"Category {article['category_slug']} not found")
            continue
        
        article_id = str(uuid.uuid4())
        slug = create_slug(article["title"])
        published_at = datetime.now(timezone.utc) - timedelta(days=idx, hours=idx*2)
        
        article_doc = {
            "_id": ObjectId(),
            "id": article_id,
            "source_app": "news",
            "author_id": admin_id,
            "category_id": category["_id"],
            "title": article["title"],
            "slug": slug,
            "excerpt": article["excerpt"],
            "content": article["content"],
            "cover_image_url": article["cover_image_url"],
            "status": "published",
            "visibility": "public",
            "is_featured": article.get("is_featured", False),
            "is_hot": article.get("is_hot", False),
            "published_at": published_at,
            "view_count": 100 + idx * 47,
            "weekly_view_count": 50 + idx * 12,
            "bookmark_count": 5 + idx,
            "share_count": 2 + idx,
            "created_at": published_at,
            "updated_at": published_at,
        }
        
        await db.articles.insert_one(article_doc)
        print(f"Created article: {article['title']}")
    
    # Seed sample quiz
    quiz_exists = await db.quizzes.count_documents({})
    if quiz_exists == 0:
        quiz_id = str(uuid.uuid4())
        quiz_slug = create_slug("Trivia Anime Klasik")
        
        await db.quizzes.insert_one({
            "_id": ObjectId(),
            "id": quiz_id,
            "source_app": "news",
            "created_by": admin_id,
            "title": "Trivia Anime Klasik Jepang",
            "slug": quiz_slug,
            "description": "Tes pengetahuanmu tentang anime klasik Jepang!",
            "thumbnail_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
            "quiz_type": "trivia",
            "status": "active",
            "points_reward": 10,
            "correct_answer_points": 5,
            "allow_retry": False,
            "show_result_immediately": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })
        
        questions_data = [
            {
                "q": "Siapa pencipta manga Dragon Ball?",
                "opts": [("Akira Toriyama", True), ("Eiichiro Oda", False), ("Masashi Kishimoto", False), ("Hajime Isayama", False)],
            },
            {
                "q": "Anime 'Spirited Away' diproduksi oleh studio?",
                "opts": [("Studio Ghibli", True), ("Kyoto Animation", False), ("MAPPA", False), ("Madhouse", False)],
            },
            {
                "q": "Apa nama karakter utama anime Naruto?",
                "opts": [("Naruto Uzumaki", True), ("Sasuke Uchiha", False), ("Kakashi Hatake", False), ("Sakura Haruno", False)],
            },
        ]
        
        for i, qd in enumerate(questions_data):
            question_id = str(uuid.uuid4())
            await db.quiz_questions.insert_one({
                "_id": ObjectId(),
                "id": question_id,
                "quiz_id": quiz_id,
                "question_text": qd["q"],
                "image_url": None,
                "sort_order": i,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            })
            
            for j, (opt_text, is_correct) in enumerate(qd["opts"]):
                await db.quiz_options.insert_one({
                    "_id": ObjectId(),
                    "id": str(uuid.uuid4()),
                    "question_id": question_id,
                    "option_text": opt_text,
                    "image_url": None,
                    "is_correct": is_correct,
                    "sort_order": j,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                })
        
        print("Created sample quiz with 3 questions")
    
    # Seed sample poll
    poll_exists = await db.polls.count_documents({})
    if poll_exists == 0:
        poll_id = str(uuid.uuid4())
        poll_slug = create_slug("Anime Spring 2026 Favorit")
        
        await db.polls.insert_one({
            "_id": ObjectId(),
            "id": poll_id,
            "source_app": "news",
            "created_by": admin_id,
            "title": "Anime Spring 2026 paling kamu tunggu?",
            "slug": poll_slug,
            "description": "Pilih satu anime spring 2026 yang paling kamu nantikan!",
            "poll_type": "polling",
            "status": "active",
            "thumbnail_url": None,
            "points_reward": 5,
            "allow_guest_vote": False,
            "show_result_before_vote": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })
        
        poll_options = ["Chainsaw Man S2", "Spy x Family S3", "Demon Slayer Movie", "Jujutsu Kaisen S3"]
        for i, opt in enumerate(poll_options):
            await db.poll_options.insert_one({
                "_id": ObjectId(),
                "id": str(uuid.uuid4()),
                "poll_id": poll_id,
                "option_text": opt,
                "vote_count": 0,
                "sort_order": i,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            })
        
        print("Created sample poll")
    
    print("Seeding complete!")


asyncio.run(seed_articles())
