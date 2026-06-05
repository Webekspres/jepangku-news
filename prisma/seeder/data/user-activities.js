/**
 * Konfigurasi aktivitas per user untuk leaderboard seeding.
 * Urutan mengikuti SAMPLE_USERS di users.js.
 */

const USER_ACTIVITY_CONFIG = [
  { quizzes: 2, polls: 2, bookmarks: 3, loginDays: 5, extraPoints: 50 },
  { quizzes: 3, polls: 3, bookmarks: 5, loginDays: 7, extraPoints: 120 },
  { quizzes: 4, polls: 4, bookmarks: 8, loginDays: 7, extraPoints: 300 },
  { quizzes: 3, polls: 3, bookmarks: 6, loginDays: 6, extraPoints: 180 },
  { quizzes: 2, polls: 2, bookmarks: 4, loginDays: 5, extraPoints: 80 },
  { quizzes: 1, polls: 2, bookmarks: 3, loginDays: 4, extraPoints: 40 },
  { quizzes: 4, polls: 3, bookmarks: 7, loginDays: 7, extraPoints: 220 },
  { quizzes: 1, polls: 1, bookmarks: 2, loginDays: 3, extraPoints: 20 },
];

const EXTRA_POINT_ACTIVITIES = [
  {
    activityType: "article_read",
    sourceType: "article",
    points: 1,
    description: "Read an article",
  },
  {
    activityType: "article_shared",
    sourceType: "article",
    points: 3,
    description: "Shared an article",
  },
  {
    activityType: "profile_updated",
    sourceType: "profile",
    points: 5,
    description: "Updated profile",
  },
  {
    activityType: "article_read",
    sourceType: "article",
    points: 1,
    description: "Read an article",
  },
  {
    activityType: "article_read",
    sourceType: "article",
    points: 1,
    description: "Read an article",
  },
];

module.exports = { USER_ACTIVITY_CONFIG, EXTRA_POINT_ACTIVITIES };
