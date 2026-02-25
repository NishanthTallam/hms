import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { hashPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { accounts: true } });
  for (const user of users) {
    if (user.accounts.length === 0) {
      console.log('Fixing user:', user.email);
      const hashedPassword = await hashPassword('Admin@123');
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashedPassword, emailVerified: true } });
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: user.id,
          providerId: 'credential',
          userId: user.id,
          password: hashedPassword,
        }
      });
    }
  }
  console.log('Repair complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());