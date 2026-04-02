import pc from 'picocolors';
import type { SetupContext } from './types.js';

/**
 * Sanitize username: remove leading/trailing slashes and spaces
 */
function sanitizeUsername(username: string): string {
  return username.trim().replace(/^\/+|\/+$/g, '');
}

export async function createTestUsers(
  ctx: SetupContext,
  spRealm: string,
  testUserName?: string,
  testUserField: string = 'username'
): Promise<void> {
  const { kc, idpRealm, skipUsers } = ctx;

  if (skipUsers) {
    console.log(pc.blue('⏭️ Skipping test users creation'));
    return;
  }

  // Use default username if not provided
  const userName = sanitizeUsername(testUserName || 'sso-sample-user');

  console.log(pc.blue('👤 Managing test user...'));

  // Try to get the user from SP realm
  let spUser: any;
  try {
    const users = await kc.users.find({
      realm: spRealm,
      username: userName,
    });

    if (users && users.length > 0) {
      spUser = users[0];
      console.log(pc.green(`✅ Found existing user: ${spUser.username}`));
    } else {
      // User doesn't exist, create it in SP realm
      console.log(pc.blue(`📝 Creating test user "${userName}" in SP realm "${spRealm}"...`));
      
      await kc.users.create({
        realm: spRealm,
        username: userName,
        email: `${userName}@example.com`,
        firstName: 'SSO',
        lastName: 'User',
        enabled: true,
        credentials: [{ type: 'password', value: userName, temporary: false }]
      });
      
      console.log(pc.green(`✅ Test user "${userName}" created in SP realm`));
      
      // Fetch the created user
      const createdUsers = await kc.users.find({
        realm: spRealm,
        username: userName,
      });
      
      if (createdUsers && createdUsers.length > 0) {
        spUser = createdUsers[0];
      } else {
        throw new Error(`Failed to fetch newly created user ${userName}`);
      }
    }
  } catch (e: any) {
    if (e.response?.status === 409) {
      console.log(pc.blue(`ℹ️ User "${userName}" already exists in SP realm`));
      const users = await kc.users.find({
        realm: spRealm,
        username: userName,
      });
      if (users && users.length > 0) {
        spUser = users[0];
      }
    } else {
      console.error(pc.red(`❌ Failed to manage test user: ${e.message}`));
      throw e;
    }
  }

  if (!spUser) {
    throw new Error(`Failed to get test user ${userName}`);
  }

  // Mirror user in IdP realm
  console.log(pc.blue(`🔄 Creating mirror user in IdP realm "${idpRealm}"...`));

  const testUserValue = sanitizeUsername(
    testUserField === 'email' ? (spUser.email || `${spUser.username}@example.com`) : spUser.username
  );

  try {
    await kc.users.create({
      realm: idpRealm,
      username: testUserValue,
      email: spUser.email || `${testUserValue}@example.com`,
      firstName: spUser.firstName || 'SSO',
      lastName: spUser.lastName || 'User',
      enabled: true,
      credentials: [{ type: 'password', value: testUserValue, temporary: false }]
    });
    console.log(pc.green(`✅ Mirror user "${testUserValue}" created in IdP realm`));
  } catch (e: any) {
    if (e.response?.status === 409) {
      console.log(pc.blue(`ℹ️ Mirror user "${testUserValue}" already exists in IdP realm`));
    } else {
      console.error(pc.red(`❌ Failed to create mirror user: ${e.message}`));
      throw e;
    }
  }
}
