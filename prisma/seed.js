const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

const { CATEGORIES_DATA } = require("./seeder/data/categories.js");
const { TAGS_DATA } = require("./seeder/data/tags.js");
const SAMPLE_ARTICLES = require("./seeder/data/articles.js");

// ---------------------------------------------------------------------------
// QUIZZES
// ---------------------------------------------------------------------------

const SAMPLE_QUIZZES = require("./seeder/data/quizzes.js");

// ---------------------------------------------------------------------------
// POLLS
// ---------------------------------------------------------------------------

const SAMPLE_POLLS = require("./seeder/data/polls.js");

// ---------------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------------

const SAMPLE_USERS = require("./seeder/data/users.js");

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function createSlug(base) {
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${clean}-${Math.random().toString(36).substring(2, 8)}`;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Starting seed...");

  // ── 1. Admin user ──────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || "admin@jepangku.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "JepangkuAdmin2025!";

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: "admin",
        passwordHash: hashedPassword,
        name: "Admin Jepangku",
        role: "ADMIN",
        status: "active",
        profile: {
          create: {
            displayName: "Admin Jepangku",
            bio: "Official Administrator of Jepangku Portal.",
          },
        },
      },
    });
    console.log(`✅ Created admin: ${adminEmail}`);
  } else {
    console.log(`⏭  Admin already exists: ${adminEmail}`);
  }

  // ── 2. Sample users ────────────────────────────────────────────────────
  const defaultUserPassword = "UserJepangku2025!";
  const hashedUserPassword = await bcrypt.hash(defaultUserPassword, 10);

  for (const userData of SAMPLE_USERS) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existing) {
      console.log(`⏭  User exists: ${userData.email}`);
      continue;
    }
    await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        passwordHash: hashedUserPassword,
        name: userData.name,
        role: "USER",
        status: "active",
        totalPoints: userData.totalPoints,
        profile: {
          create: {
            displayName: userData.displayName,
            bio: userData.bio,
          },
        },
      },
    });
    console.log(`✅ Created user: ${userData.email}`);
  }

  // ── 3. Categories ──────────────────────────────────────────────────────
  const categories = {};
  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    const cat = CATEGORIES_DATA[i];
    let dbCat = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!dbCat) {
      dbCat = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          color: cat.color,
          sortOrder: i,
          isActive: true,
        },
      });
      console.log(`✅ Created category: ${cat.name}`);
    }
    categories[cat.slug] = dbCat;
  }

  // ── 4. Tags ────────────────────────────────────────────────────────────
  const tags = {};
  for (const tagData of TAGS_DATA) {
    let dbTag = await prisma.tag.findUnique({ where: { slug: tagData.slug } });
    if (!dbTag) {
      dbTag = await prisma.tag.create({
        data: { name: tagData.name, slug: tagData.slug },
      });
      console.log(`✅ Created tag: ${tagData.name}`);
    }
    tags[tagData.slug] = dbTag;
  }

  // ── 5. Articles ────────────────────────────────────────────────────────
  // Idempotent: check by exact title
  for (let i = 0; i < SAMPLE_ARTICLES.length; i++) {
    const art = SAMPLE_ARTICLES[i];
    const category = categories[art.category_slug];
    if (!category) {
      console.warn(`⚠️  Category not found for article: ${art.title}`);
      continue;
    }

    const existing = await prisma.article.findFirst({
      where: { title: art.title },
    });
    if (existing) {
      console.log(`⏭  Article exists: "${art.title}"`);
      continue;
    }

    const slug = createSlug(art.title);
    const publishedAt = new Date(
      Date.now() - i * 23 * 60 * 60 * 1000 - i * 37 * 60 * 1000,
    );

    // Resolve author: prefer author_email from seed data (so user-owned articles exist)
    const authorEmail = art.author_email;
    const author = authorEmail
      ? await prisma.user.findUnique({ where: { email: authorEmail } })
      : null;
    const resolvedAuthorId = author?.id || admin.id;

    const resolvedStatus = art.status || "PUBLISHED";

    const created = await prisma.article.create({
      data: {
        title: art.title,
        slug,
        excerpt: art.excerpt,
        content: art.content,
        coverImageUrl: art.cover_image_url,
        status: resolvedStatus,
        visibility: "public",
        isFeatured: art.is_featured || false,
        isHot: art.is_hot || false,
        publishedAt: resolvedStatus === "PUBLISHED" ? publishedAt : null,
        viewCount: resolvedStatus === "PUBLISHED" ? 80 + i * 53 : 0,
        weeklyViewCount: resolvedStatus === "PUBLISHED" ? 30 + i * 17 : 0,
        bookmarkCount: resolvedStatus === "PUBLISHED" ? 3 + i : 0,
        shareCount: resolvedStatus === "PUBLISHED" ? 1 + i : 0,
        authorId: resolvedAuthorId,
        categoryId: category.id,
        createdAt: publishedAt,
        updatedAt: publishedAt,
      },
    });

    // Attach tags
    if (art.tags && art.tags.length > 0) {
      for (const tagSlug of art.tags) {
        const tag = tags[tagSlug];
        if (tag) {
          await prisma.articleTag.create({
            data: { articleId: created.id, tagId: tag.id },
          });
        }
      }
    }

    console.log(`✅ Created article: "${art.title}"`);
  }

  // ── 6. Quizzes ─────────────────────────────────────────────────────────
  for (const quizData of SAMPLE_QUIZZES) {
    const existing = await prisma.quiz.findFirst({
      where: { title: quizData.title },
    });
    if (existing) {
      console.log(`⏭  Quiz exists: "${quizData.title}"`);
      continue;
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: quizData.title,
        slug: createSlug(quizData.slug_base),
        description: quizData.description,
        thumbnailUrl: quizData.thumbnailUrl,
        quizType: quizData.quizType,
        status: "ACTIVE",
        pointsReward: quizData.pointsReward,
        correctAnswerPoints: quizData.correctAnswerPoints,
        allowRetry: false,
        showResultImmediately: true,
        createdBy: admin.id,
      },
    });

    for (let i = 0; i < quizData.questions.length; i++) {
      const qd = quizData.questions[i];
      const question = await prisma.quizQuestion.create({
        data: { quizId: quiz.id, questionText: qd.q, sortOrder: i },
      });
      for (let j = 0; j < qd.opts.length; j++) {
        await prisma.quizOption.create({
          data: {
            questionId: question.id,
            optionText: qd.opts[j].text,
            isCorrect: qd.opts[j].isCorrect,
            sortOrder: j,
          },
        });
      }
    }
    console.log(
      `✅ Created quiz: "${quizData.title}" (${quizData.questions.length} questions)`,
    );
  }

  // ── 7. Polls ───────────────────────────────────────────────────────────
  for (const pollData of SAMPLE_POLLS) {
    const existing = await prisma.poll.findFirst({
      where: { title: pollData.title },
    });
    if (existing) {
      console.log(`⏭  Poll exists: "${pollData.title}"`);
      continue;
    }

    const poll = await prisma.poll.create({
      data: {
        title: pollData.title,
        slug: createSlug(pollData.slug_base),
        description: pollData.description,
        pollType: pollData.pollType,
        status: "ACTIVE",
        pointsReward: pollData.pointsReward,
        allowGuestVote: false,
        showResultBeforeVote: false,
        createdBy: admin.id,
      },
    });

    for (let i = 0; i < pollData.options.length; i++) {
      await prisma.pollOption.create({
        data: {
          pollId: poll.id,
          optionText: pollData.options[i],
          voteCount: 0,
          sortOrder: i,
        },
      });
    }
    console.log(
      `✅ Created poll: "${pollData.title}" (${pollData.options.length} options)`,
    );
  }

  // ── 8. User Activities (for leaderboard) ──────────────────────────────
  // Fetch all seeded users (excluding admin) and all quizzes/polls/articles
  const allUsers = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true, email: true },
  });

  if (allUsers.length === 0) {
    console.log("⏭  No users found, skipping activity seed.");
  } else {
    const allQuizzes = await prisma.quiz.findMany({
      include: { questions: { include: { options: true } } },
    });
    const allPolls = await prisma.poll.findMany({
      include: { options: true },
    });
    const allArticles = await prisma.article.findMany({
      select: { id: true },
    });

    // Helper: random int between min and max inclusive
    const randInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    // Helper: date within last N days
    const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

    // Per-user activity config — controls how "active" each user is
    // Maps to SAMPLE_USERS order: budi, siti, andi, dewi, rizky, maya, fajar, lina
    const activityConfig = [
      { quizzes: 2, polls: 2, bookmarks: 3, loginDays: 5, extraPoints: 50 }, // budi
      { quizzes: 3, polls: 3, bookmarks: 5, loginDays: 7, extraPoints: 120 }, // siti
      { quizzes: 4, polls: 4, bookmarks: 8, loginDays: 7, extraPoints: 300 }, // andi (top)
      { quizzes: 3, polls: 3, bookmarks: 6, loginDays: 6, extraPoints: 180 }, // dewi
      { quizzes: 2, polls: 2, bookmarks: 4, loginDays: 5, extraPoints: 80 }, // rizky
      { quizzes: 1, polls: 2, bookmarks: 3, loginDays: 4, extraPoints: 40 }, // maya
      { quizzes: 4, polls: 3, bookmarks: 7, loginDays: 7, extraPoints: 220 }, // fajar
      { quizzes: 1, polls: 1, bookmarks: 2, loginDays: 3, extraPoints: 20 }, // lina
    ];

    for (let uIdx = 0; uIdx < allUsers.length; uIdx++) {
      const user = allUsers[uIdx];
      const cfg =
        activityConfig[uIdx] || activityConfig[activityConfig.length - 1];

      // ── a. Daily Login Rewards ────────────────────────────────────────
      for (let d = 0; d < cfg.loginDays; d++) {
        const rewardDate = new Date(daysAgo(d));
        const dateStr = rewardDate.toISOString().split("T")[0]; // YYYY-MM-DD

        const existingLogin = await prisma.dailyLoginReward.findFirst({
          where: { userId: user.id, rewardDate: dateStr },
        });
        if (existingLogin) continue;

        const loginPoints = 5;
        const tx = await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: "daily_login",
            sourceType: "login",
            points: loginPoints,
            description: `Daily login reward - ${dateStr}`,
            occurredAt: rewardDate,
          },
        });
        await prisma.dailyLoginReward.create({
          data: {
            userId: user.id,
            rewardDate: dateStr,
            pointsAwarded: loginPoints,
            pointTransactionId: tx.id,
          },
        });
      }

      // ── b. Quiz Attempts ──────────────────────────────────────────────
      const quizzesToAttempt = allQuizzes.slice(0, cfg.quizzes);
      for (const quiz of quizzesToAttempt) {
        const existingAttempt = await prisma.quizAttempt.findFirst({
          where: { userId: user.id, quizId: quiz.id },
        });
        if (existingAttempt) continue;

        const questions = quiz.questions;
        if (questions.length === 0) continue;

        // Simulate answers: user gets ~70-100% correct
        let correctCount = 0;
        const answerData = [];
        for (const question of questions) {
          const correctOpt = question.options.find((o) => o.isCorrect);
          const wrongOpts = question.options.filter((o) => !o.isCorrect);
          const isCorrect = Math.random() > 0.25; // 75% chance correct
          const selectedOpt = isCorrect
            ? correctOpt
            : wrongOpts[randInt(0, wrongOpts.length - 1)] || correctOpt;
          if (!selectedOpt) continue;
          if (isCorrect) correctCount++;
          answerData.push({ question, selectedOpt, isCorrect });
        }

        const score = (correctCount / questions.length) * 100;
        const pointsAwarded =
          correctCount * quiz.correctAnswerPoints + quiz.pointsReward;
        const attemptDate = daysAgo(randInt(0, 6));

        const attempt = await prisma.quizAttempt.create({
          data: {
            quizId: quiz.id,
            userId: user.id,
            score,
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            pointsAwarded,
            isPointAwarded: true,
            startedAt: attemptDate,
            submittedAt: new Date(
              attemptDate.getTime() + randInt(2, 8) * 60 * 1000,
            ),
            createdAt: attemptDate,
          },
        });

        for (const { question, selectedOpt, isCorrect } of answerData) {
          await prisma.quizAttemptAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: question.id,
              selectedOptionId: selectedOpt.id,
              isCorrect,
              createdAt: attemptDate,
            },
          });
        }

        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: "quiz_completed",
            sourceType: "quiz",
            sourceId: quiz.id,
            points: pointsAwarded,
            description: `Completed quiz: ${quiz.title} (${correctCount}/${questions.length} correct)`,
            occurredAt: attemptDate,
          },
        });

        console.log(
          `  ✅ Quiz attempt: ${user.email} → "${quiz.title}" (${correctCount}/${questions.length})`,
        );
      }

      // ── c. Poll Votes ─────────────────────────────────────────────────
      const pollsToVote = allPolls.slice(0, cfg.polls);
      for (const poll of pollsToVote) {
        const existingVote = await prisma.pollVote.findFirst({
          where: { userId: user.id, pollId: poll.id },
        });
        if (existingVote) continue;

        if (poll.options.length === 0) continue;
        const chosenOption = poll.options[randInt(0, poll.options.length - 1)];
        const voteDate = daysAgo(randInt(0, 6));

        await prisma.pollVote.create({
          data: {
            pollId: poll.id,
            optionId: chosenOption.id,
            userId: user.id,
            pointsAwarded: poll.pointsReward,
            isPointAwarded: true,
            votedAt: voteDate,
            createdAt: voteDate,
          },
        });

        // Increment voteCount on the chosen option
        await prisma.pollOption.update({
          where: { id: chosenOption.id },
          data: { voteCount: { increment: 1 } },
        });

        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: "poll_voted",
            sourceType: "poll",
            sourceId: poll.id,
            points: poll.pointsReward,
            description: `Voted on poll: ${poll.title}`,
            occurredAt: voteDate,
          },
        });

        console.log(`  ✅ Poll vote: ${user.email} → "${poll.title}"`);
      }

      // ── d. Bookmarks ──────────────────────────────────────────────────
      const articlesToBookmark = allArticles.slice(0, cfg.bookmarks);
      for (const article of articlesToBookmark) {
        const existingBookmark = await prisma.bookmark.findFirst({
          where: { userId: user.id, articleId: article.id, deletedAt: null },
        });
        if (existingBookmark) continue;

        const bookmarkDate = daysAgo(randInt(0, 6));
        await prisma.bookmark.create({
          data: {
            userId: user.id,
            articleId: article.id,
            firstBookmarkedAt: bookmarkDate,
            createdAt: bookmarkDate,
          },
        });

        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: "article_bookmarked",
            sourceType: "article",
            sourceId: article.id,
            points: 2,
            description: "Bookmarked an article",
            occurredAt: bookmarkDate,
          },
        });
      }
      console.log(
        `  ✅ Bookmarks: ${user.email} → ${articlesToBookmark.length} articles`,
      );

      // ── e. Extra point transactions (article reads, shares, etc.) ─────
      const extraActivities = [
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

      let remainingExtra = cfg.extraPoints;
      let actIdx = 0;
      while (remainingExtra > 0 && actIdx < 20) {
        const act = extraActivities[actIdx % extraActivities.length];
        const pts = Math.min(act.points, remainingExtra);
        const articleId = allArticles[actIdx % allArticles.length]?.id;
        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: act.activityType,
            sourceType: act.sourceType,
            sourceId: act.sourceType === "article" ? articleId : null,
            points: pts,
            description: act.description,
            occurredAt: daysAgo(randInt(0, 6)),
          },
        });
        remainingExtra -= pts;
        actIdx++;
      }
      console.log(
        `  ✅ Extra transactions: ${user.email} → ~${cfg.extraPoints} pts`,
      );
    }

    console.log("✅ All user activities seeded.");
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
