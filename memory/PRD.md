# Jepangku MVP - Product Requirements Document

## Original Problem Statement
Build MVP Jepangku - an interactive Japanese-themed news portal for Indonesian readers. The platform aims to be a single-app news portal with features including articles, user submissions, admin review system, quizzes, polls/voting, gamification points system, weekly leaderboard, and user profiles. Design is global-ready for future LMS integration (jepangku.com ecosystem).

## User Personas
1. **Guest Visitor**: Can read articles, view leaderboard, browse quizzes/polls without earning points
2. **Registered User**: Can read articles (earn points), submit articles for review, take quizzes, vote on polls, bookmark articles, earn points & climb leaderboard
3. **Admin**: Manages articles, reviews user submissions, creates quizzes/polls, manages categories, oversees portal

## Architecture
- **Backend**: FastAPI + MongoDB with JWT auth (httpOnly cookies)
- **Frontend**: React + Tailwind CSS (Swiss-style design - red/black/white sharp edges)
- **Storage**: Emergent Object Storage for image uploads
- **Auth**: JWT-based custom auth with bcrypt password hashing
- **Design**: Cabinet Grotesk + IBM Plex Sans fonts, rounded-none everywhere

## Core Requirements (Static)
1. Public portal with article reading
2. User auth (register/login/logout with role: user/admin)
3. Article CRUD with status flow: draft → pending_review → published/rejected → archived
4. Admin review with approve/reject + note
5. Multiple choice quizzes with single-attempt-per-user
6. Polls & Voting (1 vote per poll per user)
7. Points system with anti-spam (idempotent transactions)
8. Weekly leaderboard from point_transactions aggregation
9. Bookmarks (point only on first bookmark)
10. Daily login bonus (+3 points, 1x per day)
11. File upload for article covers

## Points System Rules
- Read article (until end): +2 (idempotent per article)
- Bookmark article: +1 (first time only per article)
- Complete quiz: +10 base + 5 per correct answer
- Vote on poll: +5 (1x per poll)
- Daily login: +3 (1x per day)
- Share article: +5 (with daily limit)

## What's Been Implemented (2026-02)

### Backend (FastAPI)
- ✅ JWT authentication with httpOnly cookies + Bearer fallback
- ✅ Admin seeding on startup (admin@jepangku.com)
- ✅ 10 seeded categories (Anime, Manga, Culture, Travel, Food, Event, Technology, Lifestyle, Education, Fun)
- ✅ Articles CRUD with status flow (POST/GET/PUT/DELETE /api/articles)
- ✅ Public article list with filters (category, tag, search) and sort (latest/popular/trending)
- ✅ Article detail with view counter, related articles, tags
- ✅ Read-complete endpoint for awarding points (idempotent)
- ✅ Bookmarks (toggle, with point logic)
- ✅ Quizzes with questions/options and attempt submission
- ✅ Polls with multiple options and voting
- ✅ Points transactions + anti-spam unique constraints
- ✅ Weekly leaderboard via aggregation pipeline
- ✅ Admin endpoints (pending review, approve/reject, stats, create quiz/poll/category)
- ✅ File upload to Emergent Object Storage
- ✅ Daily login rewards tracking
- ✅ Global-ready schema with source_app field

### Frontend (React)
- ✅ Swiss-style design (red #D90429, black, white, off-white)
- ✅ Cabinet Grotesk + IBM Plex Sans fonts
- ✅ AuthContext + ProtectedRoute
- ✅ Navbar with user menu, points display, mobile responsive
- ✅ Footer with sitemap
- ✅ Homepage (hero, featured article, trending sidebar, latest grid, active poll, latest quiz, leaderboard preview, categories)
- ✅ Article List with filters, search, sort
- ✅ Article Detail with reading progress + auto award points
- ✅ Login/Register pages
- ✅ User Profile dashboard
- ✅ My Articles with status filtering
- ✅ Submit Article (rich text formatter with HTML tags)
- ✅ Edit Article
- ✅ Bookmarks page
- ✅ Points History
- ✅ Quiz List + Quiz Detail with submission
- ✅ Poll List + Poll Detail with voting
- ✅ Leaderboard with podium for top 3
- ✅ Admin Dashboard with stats
- ✅ Admin Review Articles (approve/reject)
- ✅ Admin Articles list
- ✅ Admin Create Quiz (with questions/options)
- ✅ Admin Create Poll
- ✅ Toast notifications (sonner)
- ✅ data-testid on all interactive elements

## Seeded Data
- 9 sample articles (across all categories)
- 1 active quiz with 3 questions about anime trivia
- 1 active poll for Spring 2026 anime
- Admin account (admin@jepangku.com / JepangkuAdmin2025!)

## Prioritized Backlog (P0/P1/P2)

### P0 - Critical (Done in MVP)
- [x] Auth system
- [x] Article CRUD with review flow
- [x] Quiz, Poll engagement features
- [x] Points & Leaderboard
- [x] Admin panel basics

### P1 - High Priority (Future)
- [ ] Email verification flow
- [ ] Password reset
- [ ] Profile image upload
- [ ] Comments on articles
- [ ] Notification system
- [ ] Admin: manage tags page
- [ ] Admin: manage users page (ban/unban, role change)
- [ ] Admin: manage homepage banners

### P2 - Nice to Have (Future)
- [ ] Multi-app ecosystem (LMS at learn.jepangku.com)
- [ ] Shared auth service
- [ ] Badge/achievement system
- [ ] Social share with tracking
- [ ] Advanced search with full-text
- [ ] AI content recommendation
- [ ] Mobile app
- [ ] Article comments

## Next Tasks
1. Add admin user management page
2. Implement profile editing (avatar upload, bio, display name)
3. Add admin tag management
4. Add homepage section management for admin
5. Add email verification flow
6. Improve UI animations on engagement (quiz completion, poll vote)

## Update 2026-02 - Admin Pages Added

### New Backend Endpoints
- GET /api/admin/users (with search & role filter)
- GET /api/admin/users/{user_id} (detail with articles, transactions, stats)
- PUT /api/admin/users/{user_id} (update role/status)
- GET /api/admin/tags (with usage_count)
- POST /api/admin/tags (deterministic slug + duplicate check)
- DELETE /api/admin/tags/{tag_id} (only if usage_count=0)
- GET /api/admin/homepage (featured + hot articles)
- PUT /api/admin/articles/{id}/featured (toggle)
- PUT /api/admin/articles/{id}/hot (toggle)

### New Frontend Pages
- /admin/users - User list with search, role filter, promote/demote, ban/unban
- /admin/users/:id - User detail (articles, recent transactions, stats)
- /admin/tags - Create/list/delete tags with usage count
- /admin/homepage - Manage Featured + Hot article flags

### Seeded Data Additions
- 10 new users with realistic activity (read articles, take quiz, vote polls, bookmarks, daily logins)
- Each user has 19-57 weekly points for competitive leaderboard
- Top 3: Rina Ishikawa (57pts), Kenji Suzuki (52pts), Daichi Sato (51pts)
- All seeded users password: Jepangku2026!

### Test Results
- 85/85 tests pass (35 new admin tests + 50 regression)
- 2 minor issues fixed: duplicate tag prevention + legacy tag usage_count
