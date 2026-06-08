require("dotenv/config");
const { INFO_PAGES_DATA } = require("./seeder/data/info-pages.js");
const { createPrismaClient } = require("./create-client.js");

const prisma = createPrismaClient();

async function main() {
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
  console.log(`Info pages seeded (${INFO_PAGES_DATA.length}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
