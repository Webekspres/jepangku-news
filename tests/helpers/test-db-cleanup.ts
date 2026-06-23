import { createPrismaClient } from "../../prisma/create-client.js";
import { assertTestDatabase, loadTestEnv } from "../../scripts/load-test-env";

export type TestDbCleanupReport = {
  articles: number;
  quizzes: number;
  polls: number;
  videos: number;
  adSlots: number;
  categories: number;
  tags: number;
  newsletterSubscriptions: number;
  comments: number;
  contributorApplications: number;
};

function articleTitleOr(): Array<{ title: { startsWith: string } }> {
  return [
    "Integration Draft",
    "Invalid Status",
    "Gate pass",
    "E2E Workflow",
    "E2E Autosave",
    "E2E Preview",
    "§3 Draft",
    "§3 Admin CRUD",
    "§3 Delete Me",
    "E2E Guest Draft",
  ].map((prefix) => ({ title: { startsWith: prefix } }));
}

/** Remove ephemeral rows created by integration/E2E tests. Seed data is kept. */
export async function cleanupTestDatabase(): Promise<TestDbCleanupReport> {
  loadTestEnv();
  assertTestDatabase();

  const prisma = createPrismaClient(process.env.DATABASE_URL);
  const report: TestDbCleanupReport = {
    articles: 0,
    quizzes: 0,
    polls: 0,
    videos: 0,
    adSlots: 0,
    categories: 0,
    tags: 0,
    newsletterSubscriptions: 0,
    comments: 0,
    contributorApplications: 0,
  };

  try {
    const articles = await prisma.article.deleteMany({
      where: {
        OR: [
          ...articleTitleOr(),
          { title: { equals: "E2E smoke" } },
        ],
      },
    });
    report.articles = articles.count;

    const quizzes = await prisma.quiz.deleteMany({
      where: {
        OR: [
          { title: { startsWith: "Integration Quiz" } },
          { title: { startsWith: "CRUD Quiz" } },
        ],
      },
    });
    report.quizzes = quizzes.count;

    const polls = await prisma.poll.deleteMany({
      where: {
        OR: [
          { title: { startsWith: "Integration Poll" } },
          { title: { startsWith: "CRUD Poll" } },
        ],
      },
    });
    report.polls = polls.count;

    const videos = await prisma.video.deleteMany({
      where: {
        OR: [
          { title: { startsWith: "Integration Video" } },
          { title: { startsWith: "E2E Video" } },
        ],
      },
    });
    report.videos = videos.count;

    const adSlots = await prisma.adSlot.deleteMany({
      where: { title: { startsWith: "§14 Test Banner" } },
    });
    report.adSlots = adSlots.count;

    const categories = await prisma.category.deleteMany({
      where: { name: { startsWith: "Test Kategori " } },
    });
    report.categories = categories.count;

    const tags = await prisma.tag.deleteMany({
      where: {
        OR: [
          { name: { startsWith: "Test Tag " } },
          { name: { startsWith: "Dup Tag " } },
        ],
      },
    });
    report.tags = tags.count;

    const newsletterSubscriptions = await prisma.newsletterSubscription.deleteMany({
      where: {
        OR: [
          { email: { contains: "newsletter+" } },
          { email: { startsWith: "e2e" } },
          { email: { contains: "+dup+" } },
          { email: { startsWith: "dup+" } },
          { email: { contains: "MixedCase" } },
        ],
      },
    });
    report.newsletterSubscriptions = newsletterSubscriptions.count;

    const comments = await prisma.comment.deleteMany({
      where: {
        OR: [
          { content: { startsWith: "Integration comment" } },
          { content: { startsWith: "Nested reply test" } },
          { content: { startsWith: "Points check" } },
          { content: { startsWith: "Parent for notif" } },
          { content: { equals: "E2E guest comment" } },
        ],
      },
    });
    report.comments = comments.count;

    const contributorApplications = await prisma.contributorApplication.deleteMany({
      where: { motivation: { contains: "E2E guest apply" } },
    });
    report.contributorApplications = contributorApplications.count;
  } finally {
    await prisma.$disconnect();
  }

  return report;
}
