import pc from 'picocolors';
import type { SetupContext } from './types.js';

export async function createTestUsers(
  ctx: SetupContext,
  spRealm: string,
  testUserName: string,
  testUserField: string = 'username'
): Promise<void> {
  const { kc, idpRealm, skipUsers } = ctx;

  if (skipUsers) {
    console.log(pc.blue('⏭️ Skipping test users creation'));
    return;
  }

  console.log(pc.blue('👤 Fetching test user from SP realm...'));

  // Get the user from SP realm
  let spUser: any;
  try {
    const users = await kc.users.find({
      realm: spRealm,
      username: testUserName,
    });

    if (!users || users.length === 0) {
      console.error(pc.red(`❌ User "${testUserName}" not found in SP realm "${spRealm}"`));
      throw new Error(`User ${testUserName} not found in SP realm`);
    }

    spUser = users[0];
    console.log(pc.green(`✅ Found user: ${spUser.username}`));
  } catch (e: any) {
    console.error(pc.red(`❌ Failed to fetch user from SP realm: ${e.message}`));
    throw e;
  }

  // Create mirror user in IdP realm
  console.log(pc.blue(`🔄 Creating mirror user in IdP realm "${idpRealm}"...`));

  const testUserValue = testUserField === 'email' ? spUser.email : spUser.username;

  if (!testUserValue) {
    console.error(pc.red(`❌ User field "${testUserField}" not found in user data`));
    throw new Error(`Field "${testUserField}" not found for user ${testUserName}`);
  }

  try {
    await kc.users.create({
      realm: idpRealm,
      username: testUserValue,
      email: spUser.email || `${testUserValue}@example.com`,
      firstName: spUser.firstName || 'Test',
      lastName: spUser.lastName || 'User',
      enabled: true,
      credentials: [{ type: 'password', value: testUserValue, temporary: false }]
    });
    console.log(pc.green(`✅ Mirror user "${testUserValue}" created in IdP realm with password`));
  } catch (e: any) {
    if (e.response?.status === 409) {
      console.log(pc.blue(`ℹ️ Mirror user "${testUserValue}" already exists in IdP realm`));
    } else {
      console.error(pc.red(`❌ Failed to create mirror user: ${e.message}`));
      throw e;
    }
  }
}
