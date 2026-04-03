import pc from 'picocolors';

import config from '../foliosso.config.js';
import { collectConfigInteractive } from './interactive.js';
import {
  validateConfig,
  authenticateKeycloak,
  createIdpRealm,
  createSamlClient,
  configureAuthFlow,
  createSamlBroker,
  createTestUsers,
  printSummary,
  type SetupContext,
} from './steps/index.js';

async function main() {
  console.log(pc.bold(pc.cyan('🚀 Folio SSO Setup Tool v1.0.0')));

  // Configuration is built in foliosso.config.ts from CLI args, env vars, and defaults
  let keycloakUrl = config.baseUrl;
  let idpRealm = config.idpRealm;
  let spRealm = config.spRealm;
  let adminUsername = config.adminUsername;
  let adminPassword = config.adminPassword;
  let testUserName = config.testUserName;
  let testUserField = config.testUserField;
  let skipUsers = config.skipUsers;
  const ciMode = Boolean(config.ci);

  if (ciMode) {
    if (!adminUsername || !adminPassword) {
      throw new Error('CI mode enabled (--ci) requires admin credentials. Set ADMIN_USERNAME/ADMIN_PASSWORD/env or use -u/-p.');
    }
  } else {
    console.log(pc.yellow('\n⚡ Starting interactive setup (non-CI mode)...\n'));
    const interactiveConfig = await collectConfigInteractive({
      keycloakUrl: config.baseUrl,
      idpRealm: config.idpRealm,
      spRealm: config.spRealm,
      testUserName: config.testUserName,
      skipUsers: config.skipUsers,
      adminUsername,
      adminPassword,
    });

    keycloakUrl = interactiveConfig.keycloakUrl;
    idpRealm = interactiveConfig.idpRealm;
    spRealm = interactiveConfig.spRealm;
    skipUsers = interactiveConfig.skipUsers;
    testUserName = interactiveConfig.testUserName;

    if (!adminUsername) {
      adminUsername = interactiveConfig.username;
    }
    if (!adminPassword) {
      adminPassword = interactiveConfig.password;
    }
  }

  // Ensure testUserField has a default
  const testUserFieldValue = testUserField || 'username';

  const idpClientConfig = config.idp.client;

  // Step 1: Validate configuration
  console.log(pc.gray('\n📋 Step 1/7: Validating configuration...'));
  const validatedConfig = validateConfig(keycloakUrl, idpRealm, spRealm, adminUsername, adminPassword);
  validatedConfig.skipUsers = skipUsers;

  // Step 2: Authenticate to Keycloak
  console.log(pc.gray('\n🔐 Step 2/7: Authenticating to Keycloak...'));
  const kc = await authenticateKeycloak(keycloakUrl, adminUsername, adminPassword, config.masterRealm);

  const ctx: SetupContext = {
    ...validatedConfig,
    kc,
  };

  // Step 3: Create IdP Realm
  console.log(pc.gray('\n🌍 Step 3/7: Creating IdP Realm...'));
  await createIdpRealm(ctx);

  // Step 4: Create SAML Client
  console.log(pc.gray('\n🔗 Step 4/7: Creating SAML Client...'));
  await createSamlClient(ctx, idpClientConfig);

  // Step 5: Configure Authorization Flow
  console.log(pc.gray('\n🔐 Step 5/7: Configuring Authorization Flow...'));
  await configureAuthFlow(ctx, config.authFlow.flow, config.authFlow.authenticationExecutions);

  // Step 6: Create SAML Broker
  console.log(pc.gray('\n🔗 Step 6/7: Creating SAML Broker...'));
  await createSamlBroker(ctx, config.sp.idp);

  // Step 7: Create Test Users
  console.log(pc.gray('\n👤 Step 7/7: Managing Test Users...'));
  if (skipUsers) {
    console.log(pc.blue('⏭️ Skipping test users creation'));
  } else {
    // Creates test user with provided name or default 'sso-sample-user'
    await createTestUsers(ctx, spRealm, testUserName, testUserFieldValue);
  }

  // Print Summary
  printSummary(ctx, config.sp.idp.alias, config.authFlow.flow.alias, testUserName || 'sso-sample-user');
}

main().catch((err) => {
  console.error(pc.red('\n💥 Critical error:'));
  console.error(err);
  process.exit(1);
});
