import pc from 'picocolors';
import type { SetupContext } from './types.js';

export async function createTestUsers(
  ctx: SetupContext,
  testUsers: any[]
): Promise<void> {
  const { kc, skipUsers } = ctx;

  if (skipUsers) {
    console.log(pc.blue('⏭️ Skipping test users creation'));
    return;
  }

  console.log(pc.blue('👤 Creating test users...'));
  for (const user of testUsers) {
    try {
      await kc.users.create({
        realm: user.realm,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: true,
        credentials: [{ type: 'password', value: user.password, temporary: false }]
      });
      console.log(pc.green(`✅ User ${user.username} created`));
    } catch (e: any) {
      if (e.response?.status === 409) {
        console.log(pc.blue(`ℹ️ User ${user.username} already exists`));
      } else throw e;
    }
  }
}
