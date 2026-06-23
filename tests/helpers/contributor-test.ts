import { createPrismaClient } from "../../prisma/create-client.js";
import { assertTestDatabase, loadTestEnv } from "../../scripts/load-test-env";
import { CLERK_TEST_ACCOUNTS } from "../fixtures/clerk-accounts";

/** Clears non-approved contributor applications for the Clerk USER test account. */
export async function resetClerkUserContributorApplications(
  email = CLERK_TEST_ACCOUNTS.USER.email,
): Promise<void> {
  loadTestEnv();
  assertTestDatabase();

  const prisma = createPrismaClient(process.env.DATABASE_URL);
  try {
    const user = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });
    if (!user) return;

    await prisma.contributorApplication.deleteMany({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "REJECTED"] },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
