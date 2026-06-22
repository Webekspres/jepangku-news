require("dotenv/config");
const { createPrismaClient } = require("./create-client.js");
const {
  fetchClerkUsersByEmail,
  resolvePortalUserId,
} = require("./seeder/clerk-resolve.js");

const prisma = createPrismaClient();

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
const { COMMENTS_DATA } = require("./seeder/data/comments.js");
const { REACTIONS_DATA } = require("./seeder/data/reactions.js");
const {
  ARTICLE_VIEWS_CONFIG,
  buildViewsForArticle,
} = require("./seeder/data/article-views.js");
const { ARTICLE_SHARES_DATA } = require("./seeder/data/article-shares.js");
const { ARTICLE_REVISIONS_DATA } = require("./seeder/data/article-revisions.js");
const { FILES_DATA } = require("./seeder/data/files.js");
const {
  USER_ACTIVITY_CONFIG,
  EXTRA_POINT_ACTIVITIES,
} = require("./seeder/data/user-activities.js");
const { INFO_PAGES_DATA } = require("./seeder/data/info-pages.js");
const { VIDEOS_DATA } = require("./seeder/data/videos.js");
const { ADS_DATA } = require("./seeder/data/ads.js");
const {
  CLERK_TEST_ADMIN_EMAIL,
  CLERK_TEST_CONTRIBUTOR_EMAIL,
  LEGACY_EMAIL_MIGRATIONS,
} = require("./seeder/data/clerk-test-emails.js");

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

function daysAgo(n, extraHours = 0) {
  return new Date(
    Date.now() - n * 24 * 60 * 60 * 1000 - extraHours * 60 * 60 * 1000,
  );
}

async function resolveUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Starting seed...");

  for (const { from, to } of LEGACY_EMAIL_MIGRATIONS) {
    const legacyUser = await prisma.user.findUnique({ where: { email: from } });
    if (!legacyUser) continue;

    const targetTaken = await prisma.user.findUnique({ where: { email: to } });
    if (targetTaken && targetTaken.id !== legacyUser.id) {
      console.warn(`⚠️  Skip email migration ${from} → ${to}: target already exists`);
      continue;
    }

    await prisma.user.update({
      where: { id: legacyUser.id },
      data: { email: to },
    });
    console.log(`✅ Migrated user email: ${from} → ${to}`);
  }

  const clerkByEmail = await fetchClerkUsersByEmail();

  // ── 1. Admin user (portal profile; Clerk ID = users.id) ───────────────
  const adminEmail = process.env.ADMIN_EMAIL || CLERK_TEST_ADMIN_EMAIL;
  const adminId =
    clerkByEmail.get(adminEmail.toLowerCase()) || "seed_admin_jepangku";

  let admin =
    (await prisma.user.findUnique({ where: { id: adminId } })) ||
    (await prisma.user.findUnique({ where: { email: adminEmail } })) ||
    (await prisma.user.findUnique({ where: { username: "admin" } }));
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        id: adminId,
        email: adminEmail,
        username: "admin",
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
    console.log(`✅ Created admin: ${adminEmail} (${adminId})`);
  } else {
    console.log(`⏭  Admin already exists: ${adminEmail} (${admin.id})`);
  }

  // ── 1b. Contributor test user (Clerk + portal role CONTRIBUTOR) ───────
  const contributorEmail =
    process.env.CONTRIBUTOR_TEST_EMAIL || CLERK_TEST_CONTRIBUTOR_EMAIL;
  const contributorId =
    clerkByEmail.get(contributorEmail.toLowerCase()) ||
    "seed_contributor_jepangku";

  let contributor =
    (await prisma.user.findUnique({ where: { id: contributorId } })) ||
    (await prisma.user.findUnique({ where: { email: contributorEmail } })) ||
    (await prisma.user.findUnique({ where: { username: "kontributor" } }));
  if (!contributor) {
    contributor = await prisma.user.create({
      data: {
        id: contributorId,
        email: contributorEmail,
        username: "kontributor",
        name: "Kontributor Uji",
        role: "CONTRIBUTOR",
        status: "active",
        profile: {
          create: {
            displayName: "Kontributor Uji",
            bio: "Akun uji kontributor untuk QA otomatis.",
          },
        },
      },
    });
    console.log(`✅ Created contributor: ${contributorEmail} (${contributorId})`);
  } else if (contributor.role !== "CONTRIBUTOR") {
    await prisma.user.update({
      where: { id: contributor.id },
      data: { role: "CONTRIBUTOR", email: contributorEmail },
    });
    console.log(`✅ Updated contributor role: ${contributorEmail}`);
  } else {
    console.log(`⏭  Contributor already exists: ${contributorEmail} (${contributor.id})`);
  }

  // ── 2. Sample users (Clerk ID or seed_* for dev content) ─────────────
  for (const userData of SAMPLE_USERS) {
    const userId = resolvePortalUserId(userData, clerkByEmail);
    const existing =
      (await prisma.user.findUnique({ where: { id: userId } })) ||
      (await prisma.user.findUnique({ where: { email: userData.email } })) ||
      (await prisma.user.findUnique({ where: { username: userData.username } }));
    if (existing) {
      console.log(`⏭  User exists: ${userData.email}`);
      continue;
    }
    await prisma.user.create({
      data: {
        id: userId,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        role: "USER",
        status: "active",
        profile: {
          create: {
            displayName: userData.displayName,
            bio: userData.bio,
          },
        },
      },
    });
    console.log(`✅ Created user: ${userData.email} (${userId})`);
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
          showInNavbar: i < 9,
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

  // ── 6. Article Reviews (approve/reject history) ────────────────────────
  // Seed review records untuk artikel yang statusnya PUBLISHED atau REJECTED
  // agar tombol "History" muncul di halaman /my-articles.
  const articlesNeedingReviews = await prisma.article.findMany({
    where: { status: { in: ["PUBLISHED", "REJECTED"] }, authorId: { not: admin.id } },
    select: { id: true, title: true, status: true, authorId: true },
    take: 40,
  });

  for (let i = 0; i < articlesNeedingReviews.length; i++) {
    const art = articlesNeedingReviews[i];

    // Skip jika sudah ada review untuk artikel ini
    const existingReview = await prisma.articleReview.findFirst({
      where: { articleId: art.id },
    });
    if (existingReview) continue;

    const baseDate = new Date(Date.now() - i * 18 * 60 * 60 * 1000);

    if (art.status === "PUBLISHED") {
      // ~30% artikel PUBLISHED pernah di-reject dulu sebelum akhirnya di-approve
      const hadPriorReject = i % 3 === 0;

      if (hadPriorReject) {
        // Review 1 — Reject pertama
        const rejectDate = new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000);
        const rejectNotes = [
          "Konten terlalu singkat, mohon tambahkan minimal 500 kata lagi beserta referensi yang valid.",
          "Judul kurang sesuai dengan isi artikel. Tolong sesuaikan dan perbaiki struktur paragraf.",
          "Artikel mengandung informasi yang belum terverifikasi. Mohon sertakan sumber yang kredibel.",
          "Format penulisan belum sesuai standar. Gunakan heading yang tepat dan tambahkan kesimpulan.",
        ];
        await prisma.articleReview.create({
          data: {
            articleId: art.id,
            reviewerId: admin.id,
            previousStatus: "PENDING_REVIEW",
            newStatus: "REJECTED",
            note: rejectNotes[i % rejectNotes.length],
            reviewedAt: rejectDate,
            createdAt: rejectDate,
          },
        });

        // Review 2 — Resubmit lalu di-approve
        const approveDate = new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000);
        await prisma.articleReview.create({
          data: {
            articleId: art.id,
            reviewerId: admin.id,
            previousStatus: "PENDING_REVIEW",
            newStatus: "PUBLISHED",
            note: "Revisi sudah bagus. Artikel layak tayang.",
            reviewedAt: approveDate,
            createdAt: approveDate,
          },
        });
      } else {
        // Langsung approve
        await prisma.articleReview.create({
          data: {
            articleId: art.id,
            reviewerId: admin.id,
            previousStatus: "PENDING_REVIEW",
            newStatus: "PUBLISHED",
            note: "Approved",
            reviewedAt: baseDate,
            createdAt: baseDate,
          },
        });
      }
    } else if (art.status === "REJECTED") {
      // ~40% artikel REJECTED pernah di-reject lebih dari sekali
      const multiReject = i % 5 === 0;

      const firstRejectNotes = [
        "Artikel terlalu pendek dan tidak memiliki kedalaman informasi yang cukup.",
        "Topik sudah pernah dibahas sebelumnya di portal ini. Mohon cari angle yang berbeda.",
        "Banyak typo dan kesalahan tata bahasa. Mohon proofread terlebih dahulu.",
        "Konten tidak relevan dengan tema portal Jepangku. Pastikan artikel membahas topik Jepang.",
        "Artikel tidak memiliki struktur yang jelas. Tambahkan intro, isi, dan kesimpulan.",
      ];

      const firstRejectDate = new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000);
      await prisma.articleReview.create({
        data: {
          articleId: art.id,
          reviewerId: admin.id,
          previousStatus: "PENDING_REVIEW",
          newStatus: "REJECTED",
          note: firstRejectNotes[i % firstRejectNotes.length],
          reviewedAt: firstRejectDate,
          createdAt: firstRejectDate,
        },
      });

      if (multiReject) {
        // User resubmit → di-reject lagi
        const secondRejectDate = new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000);
        await prisma.articleReview.create({
          data: {
            articleId: art.id,
            reviewerId: admin.id,
            previousStatus: "PENDING_REVIEW",
            newStatus: "REJECTED",
            note: "Revisi masih belum memenuhi standar. Konten perlu diperdalam dan sumber harus lebih kredibel.",
            reviewedAt: secondRejectDate,
            createdAt: secondRejectDate,
          },
        });
      }
    }

    console.log(`  ✅ ArticleReview seeded: "${art.title}" (${art.status})`);
  }
  console.log("✅ Article reviews seeded.");

  // ── 7. Quizzes ─────────────────────────────────────────────────────────
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

  // ── 8. Polls ───────────────────────────────────────────────────────────
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
        thumbnailUrl: pollData.thumbnailUrl || null,
        pollType: pollData.pollType,
        status: "ACTIVE",
        pointsReward: pollData.pointsReward,
        allowGuestVote: false,
        showResultBeforeVote: false,
        createdBy: admin.id,
      },
    });

    for (let qi = 0; qi < pollData.questions.length; qi++) {
      const qd = pollData.questions[qi];
      const question = await prisma.pollQuestion.create({
        data: {
          pollId: poll.id,
          questionText: qd.questionText,
          imageUrl: qd.imageUrl || null,
          sortOrder: qi,
        },
      });

      for (let oi = 0; oi < qd.options.length; oi++) {
        const opt = qd.options[oi];
        await prisma.pollOption.create({
          data: {
            questionId: question.id,
            optionText: opt.optionText,
            imageUrl: opt.imageUrl || null,
            voteCount: 0,
            sortOrder: oi,
          },
        });
      }
    }

    const totalOpts = pollData.questions.reduce((s, q) => s + q.options.length, 0);
    console.log(
      `✅ Created poll: "${pollData.title}" (${pollData.questions.length} questions, ${totalOpts} options)`,
    );
  }

  // ── 9. User Activities (for leaderboard) ──────────────────────────────
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
      select: { id: true, title: true, pointsReward: true },
    });
    const allArticles = await prisma.article.findMany({
      select: { id: true },
    });

    // Helper: random int between min and max inclusive
    const randInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    for (let uIdx = 0; uIdx < allUsers.length; uIdx++) {
      const user = allUsers[uIdx];
      const cfg =
        USER_ACTIVITY_CONFIG[uIdx] ||
        USER_ACTIVITY_CONFIG[USER_ACTIVITY_CONFIG.length - 1];

      // ── a. Quiz Attempts ──────────────────────────────────────────────
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

        console.log(
          `  ✅ Quiz attempt: ${user.email} → "${quiz.title}" (${correctCount}/${questions.length})`,
        );
      }

      // ── c. Poll Votes ─────────────────────────────────────────────────
      const pollsToVote = allPolls.slice(0, cfg.polls);
      for (const poll of pollsToVote) {
        // Ambil pertanyaan + opsi
        const pollWithQuestions = await prisma.poll.findUnique({
          where: { id: poll.id },
          include: { questions: { include: { options: true } } },
        });
        if (!pollWithQuestions || pollWithQuestions.questions.length === 0) continue;

        // Vote pada pertanyaan pertama saja (idempotent)
        const firstQuestion = pollWithQuestions.questions[0];
        const existingVote = await prisma.pollVote.findFirst({
          where: { userId: user.id, pollId: poll.id, questionId: firstQuestion.id },
        });
        if (existingVote) continue;

        if (firstQuestion.options.length === 0) continue;
        const chosenOption = firstQuestion.options[randInt(0, firstQuestion.options.length - 1)];
        const voteDate = daysAgo(randInt(0, 6));

        await prisma.pollVote.create({
          data: {
            pollId: poll.id,
            questionId: firstQuestion.id,
            optionId: chosenOption.id,
            userId: user.id,
            pointsAwarded: poll.pointsReward,
            isPointAwarded: true,
            votedAt: voteDate,
            createdAt: voteDate,
          },
        });

        await prisma.pollOption.update({
          where: { id: chosenOption.id },
          data: { voteCount: { increment: 1 } },
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

      }
      console.log(
        `  ✅ Bookmarks: ${user.email} → ${articlesToBookmark.length} articles`,
      );

      // ── e. Article shares (tanpa ledger poin lokal — XP di Core) ─────
      let remainingExtra = cfg.extraPoints;
      let actIdx = 0;
      while (remainingExtra > 0 && actIdx < 20) {
        const act = EXTRA_POINT_ACTIVITIES[actIdx % EXTRA_POINT_ACTIVITIES.length];
        const pts = Math.min(act.points, remainingExtra);
        const articleId = allArticles[actIdx % allArticles.length]?.id;
        const occurredAt = daysAgo(randInt(0, 6));

        if (act.activityType === "article_shared" && articleId) {
          const existingShare = await prisma.articleShare.findUnique({
            where: { userId_articleId: { userId: user.id, articleId } },
          });
          if (!existingShare) {
            await prisma.articleShare.create({
              data: {
                userId: user.id,
                articleId,
                shareMethod: "copy-link",
                pointsAwarded: pts,
                isPointAwarded: true,
                sharedAt: occurredAt,
                createdAt: occurredAt,
              },
            });
          }
        }

        remainingExtra -= pts;
        actIdx++;
      }
      console.log(`  ✅ Extra shares: ${user.email}`);
    }

    console.log("✅ All user activities seeded.");
  }

  // ── 10. Article Shares (dedicated seed data) ───────────────────────────
  const publishedArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true },
    take: 40,
  });

  for (const shareSpec of ARTICLE_SHARES_DATA) {
    const user = await resolveUserByEmail(shareSpec.author_email);
    const article = publishedArticles[shareSpec.article_index];
    if (!user || !article) continue;

    const existing = await prisma.articleShare.findUnique({
      where: { userId_articleId: { userId: user.id, articleId: article.id } },
    });
    if (existing) continue;

    const sharedAt = daysAgo(shareSpec.days_ago);
    await prisma.articleShare.create({
      data: {
        userId: user.id,
        articleId: article.id,
        shareMethod: shareSpec.share_method,
        pointsAwarded: shareSpec.points_awarded,
        isPointAwarded: shareSpec.is_point_awarded,
        sharedAt,
        createdAt: sharedAt,
      },
    });
  }
  console.log("✅ Article shares seeded.");

  // ── 11. Article Views (analytics time series) ──────────────────────────
  const viewsArticleSlice = publishedArticles.slice(
    0,
    ARTICLE_VIEWS_CONFIG.articleCount,
  );
  const allUsersForViews = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true },
    take: 8,
  });

  let totalViewsSeeded = 0;
  for (let aIdx = 0; aIdx < viewsArticleSlice.length; aIdx++) {
    const article = viewsArticleSlice[aIdx];
    const existingViewCount = await prisma.articleView.count({
      where: { articleId: article.id },
    });
    if (existingViewCount > 0) continue;

    const viewSpecs = buildViewsForArticle(aIdx, article.id);
    for (const v of viewSpecs) {
      const viewedAt = daysAgo(v.days_ago, v.hours_ago);
      const userId =
        v.user_slot !== null ? allUsersForViews[v.user_slot]?.id ?? null : null;

      await prisma.articleView.create({
        data: {
          articleId: article.id,
          userId,
          visitorKey: v.visitor_key,
          viewedAt,
          createdAt: viewedAt,
        },
      });
      totalViewsSeeded++;
    }
  }
  console.log(`✅ Article views seeded (${totalViewsSeeded} records).`);

  // ── 12. Article Revisions ──────────────────────────────────────────────
  const userArticles = await prisma.article.findMany({
    where: { author: { role: "USER" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      categoryId: true,
      status: true,
    },
    take: 30,
  });

  for (const revSpec of ARTICLE_REVISIONS_DATA) {
    const article = userArticles[revSpec.target_index];
    if (!article) continue;

    const editor = await resolveUserByEmail(revSpec.editor_email);
    if (!editor) continue;

    const existing = await prisma.articleRevision.findUnique({
      where: {
        articleId_revisionNumber: {
          articleId: article.id,
          revisionNumber: revSpec.revision_number,
        },
      },
    });
    if (existing) continue;

    const createdAt = daysAgo(revSpec.days_ago);
    await prisma.articleRevision.create({
      data: {
        articleId: article.id,
        revisionNumber: revSpec.revision_number,
        editorId: editor.id,
        changeNote: revSpec.change_note,
        title: article.title + revSpec.title_suffix,
        excerpt: article.excerpt,
        content: article.content,
        coverImageUrl: article.coverImageUrl,
        categoryId: article.categoryId,
        status: article.status,
        createdAt,
      },
    });
  }
  console.log("✅ Article revisions seeded.");

  // ── 13. Files ──────────────────────────────────────────────────────────
  for (const fileSpec of FILES_DATA) {
    const email =
      fileSpec.user_email === CLERK_TEST_ADMIN_EMAIL
        ? adminEmail
        : fileSpec.user_email;
    const user = await resolveUserByEmail(email);
    if (!user) continue;

    const existing = await prisma.file.findFirst({
      where: { storagePath: fileSpec.storage_path },
    });
    if (existing) continue;

    await prisma.file.create({
      data: {
        storagePath: fileSpec.storage_path,
        originalFilename: fileSpec.original_filename,
        contentType: fileSpec.content_type,
        size: fileSpec.size,
        userId: user.id,
        isDeleted: fileSpec.is_deleted || false,
      },
    });
  }
  console.log("✅ Files seeded.");

  // ── 14. Comments ───────────────────────────────────────────────────────
  const activePolls = await prisma.poll.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const activeQuizzes = await prisma.quiz.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const commentKeyToId = {};
  const visibleCommentIds = [];

  for (const cSpec of COMMENTS_DATA) {
    const user = await resolveUserByEmail(cSpec.author_email);
    if (!user) continue;

    let targetId = null;
    if (cSpec.target_type === "ARTICLE") {
      targetId = publishedArticles[cSpec.target_index]?.id;
    } else if (cSpec.target_type === "POLL") {
      targetId = activePolls[cSpec.target_index]?.id;
    } else if (cSpec.target_type === "QUIZ") {
      targetId = activeQuizzes[cSpec.target_index]?.id;
    }
    if (!targetId) continue;

    const existing = await prisma.comment.findFirst({
      where: {
        userId: user.id,
        targetType: cSpec.target_type,
        targetId,
        content: cSpec.content,
      },
    });
    if (existing) {
      commentKeyToId[cSpec.key] = existing.id;
      if (existing.status === "VISIBLE" && !existing.deletedAt) {
        visibleCommentIds.push(existing.id);
      }
      continue;
    }

    const parentId = cSpec.parent_key
      ? commentKeyToId[cSpec.parent_key] || null
      : null;
    const createdAt = daysAgo(cSpec.days_ago);

    const created = await prisma.comment.create({
      data: {
        targetType: cSpec.target_type,
        targetId,
        userId: user.id,
        parentId,
        content: cSpec.content,
        status: cSpec.status,
        deletedAt: cSpec.deleted ? createdAt : null,
        createdAt,
        updatedAt: createdAt,
      },
    });

    commentKeyToId[cSpec.key] = created.id;
    if (created.status === "VISIBLE" && !created.deletedAt) {
      visibleCommentIds.push(created.id);
    }
  }
  console.log(`✅ Comments seeded (${Object.keys(commentKeyToId).length}).`);

  // ── 15. Reactions ──────────────────────────────────────────────────────
  let reactionsSeeded = 0;
  for (const rSpec of REACTIONS_DATA) {
    const user = await resolveUserByEmail(rSpec.author_email);
    if (!user) continue;

    let targetId = null;
    if (rSpec.target_type === "ARTICLE") {
      targetId = publishedArticles[rSpec.target_index]?.id;
    } else if (rSpec.target_type === "POLL") {
      targetId = activePolls[rSpec.target_index]?.id;
    } else if (rSpec.target_type === "QUIZ") {
      targetId = activeQuizzes[rSpec.target_index]?.id;
    } else if (rSpec.target_type === "COMMENT") {
      targetId = visibleCommentIds[rSpec.target_index];
    }
    if (!targetId) continue;

    const existing = await prisma.reaction.findUnique({
      where: {
        targetType_targetId_userId: {
          targetType: rSpec.target_type,
          targetId,
          userId: user.id,
        },
      },
    });
    if (existing) continue;

    const createdAt = daysAgo(rSpec.days_ago);
    await prisma.reaction.create({
      data: {
        targetType: rSpec.target_type,
        targetId,
        userId: user.id,
        type: rSpec.type,
        createdAt,
        updatedAt: createdAt,
      },
    });
    reactionsSeeded++;
  }
  console.log(`✅ Reactions seeded (${reactionsSeeded}).`);

  // ── 16. Jepangku TV videos ─────────────────────────────────────────────
  console.log("📺 Seeding videos...");
  let videosSeeded = 0;
  for (const video of VIDEOS_DATA) {
    const publishedAt =
      video.status === "PUBLISHED"
        ? daysAgo(video.daysAgo ?? 0)
        : null;
    const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

    await prisma.video.upsert({
      where: { slug: video.slug },
      update: {
        title: video.title,
        description: video.description,
        youtubeId: video.youtubeId,
        thumbnailUrl,
        status: video.status,
        isFeatured: video.isFeatured,
        viewCount: video.viewCount,
        publishedAt,
      },
      create: {
        title: video.title,
        slug: video.slug,
        description: video.description,
        youtubeId: video.youtubeId,
        thumbnailUrl,
        status: video.status,
        isFeatured: video.isFeatured,
        viewCount: video.viewCount,
        publishedAt,
        createdBy: admin.id,
      },
    });
    videosSeeded++;
  }
  console.log(`✅ Videos seeded (${videosSeeded}).`);

  // ── 17. Ad slots ───────────────────────────────────────────────────────
  console.log("📢 Seeding ad slots...");
  let adsSeeded = 0;
  for (const ad of ADS_DATA) {
    const existing = await prisma.adSlot.findFirst({
      where: { position: ad.position, title: ad.title },
    });

    if (existing) {
      await prisma.adSlot.update({
        where: { id: existing.id },
        data: {
          imageUrl: ad.imageUrl,
          linkUrl: ad.linkUrl,
          altText: ad.altText,
          isActive: ad.isActive,
          sortOrder: ad.sortOrder,
        },
      });
    } else {
      await prisma.adSlot.create({
        data: {
          position: ad.position,
          title: ad.title,
          imageUrl: ad.imageUrl,
          linkUrl: ad.linkUrl,
          altText: ad.altText,
          isActive: ad.isActive,
          sortOrder: ad.sortOrder,
          createdBy: admin.id,
        },
      });
    }
    adsSeeded++;
  }
  console.log(`✅ Ad slots seeded (${adsSeeded}).`);

  // ── 18. Info pages ─────────────────────────────────────────────────────
  console.log("📄 Seeding info pages...");
  for (const page of INFO_PAGES_DATA) {
    await prisma.infoPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        slug: page.slug,
        title: page.title,
        subtitle: page.subtitle,
        content: page.content,
        sortOrder: page.sortOrder,
        isPublished: true,
      },
    });
  }
  console.log(`✅ Info pages seeded (${INFO_PAGES_DATA.length}).`);

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
