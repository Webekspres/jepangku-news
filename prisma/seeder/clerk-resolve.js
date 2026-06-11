const { createClerkClient } = require("@clerk/backend");

/** @returns {Promise<Map<string, string>>} email (lower) -> Clerk user id */
async function fetchClerkUsersByEmail() {
  const secret = process.env.CLERK_SECRET_KEY;
  const map = new Map();
  if (!secret) {
    console.warn("⚠️  CLERK_SECRET_KEY not set — only seed_* portal users will be created");
    return map;
  }

  const clerk = createClerkClient({ secretKey: secret });
  let offset = 0;

  while (true) {
    const page = await clerk.users.getUserList({ limit: 100, offset });
    for (const user of page.data) {
      const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
      const email = (primary ?? user.emailAddresses[0])?.emailAddress?.toLowerCase();
      if (email) map.set(email, user.id);
    }
    if (page.data.length < 100) break;
    offset += 100;
  }

  console.log(`✅ Resolved ${map.size} Clerk user(s) for seeding`);
  return map;
}

function resolvePortalUserId(userData, clerkByEmail) {
  const clerkId = clerkByEmail.get(userData.email.toLowerCase());
  if (clerkId) return clerkId;
  if (userData.id) return userData.id;
  return `seed_${userData.username}`;
}

module.exports = { fetchClerkUsersByEmail, resolvePortalUserId };
