const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  const [identifier, newPassword] = process.argv.slice(2);

  if (!identifier || !newPassword) {
    console.error("Usage: node scripts/reset-password.js <email-or-username> <new-password>");
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
    },
  });

  if (!user) {
    console.error(`No user found matching "${identifier}"`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  console.log(`Password updated for ${user.username} (${user.email}).`);
}

main()
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());