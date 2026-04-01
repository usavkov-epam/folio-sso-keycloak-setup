import { Command } from 'commander';
import dotenv from 'dotenv';
import pc from 'picocolors';

import config from '../foliosso.config.js';
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

const program = new Command();

program
  .name('folio-sso')
  .description('Folio SSO Setup Tool - creates service provider and broker in consortium')
  .version('1.0.0')
  .option('-e, --env <path>', 'path to .env file (default: .env)', '.env')
  .option('-k, --keycloak-url <url>', 'Keycloak base URL (or use KEYCLOAK_URL env var)')
  .option('--idp-realm <realm>', 'Identity Provider realm name (or use IDENTITY_PROVIDER_REALM env var)')
  .option('--sp-realm <realm>', 'Service Provider realm name (or use SERVICE_PROVIDER_REALM env var)')
  .option('--skip-users', 'skip creating test users', false)
  .option('-u, --username <username>', 'Keycloak admin username (or use ADMIN_USERNAME env var)')
  .option('-p, --password <password>', 'Keycloak admin password (or use ADMIN_PASSWORD env var)')
  .addHelpText('after', `
Examples:
  $ folio-sso -k https://keycloak.example.com -u admin -p password --idp-realm idp --sp-realm sp
  $ folio-sso --keycloak-url https://keycloak.example.com --username admin --password password --skip-users
  $ KEYCLOAK_URL=https://keycloak.example.com ADMIN_USERNAME=admin ADMIN_PASSWORD=password folio-sso
  
Environment Variables:
  KEYCLOAK_URL                    Keycloak base URL
  IDENTITY_PROVIDER_REALM         IdP realm name (default: self-saml-idp-realm)
  SERVICE_PROVIDER_REALM          SP realm name (default: consortium)
  ADMIN_USERNAME                  Admin username for authentication
  ADMIN_PASSWORD                  Admin password for authentication
`)
  .parse(process.argv);

const options = program.opts();

async function main() {
  console.log(pc.bold(pc.cyan('🚀 Folio SSO Setup Tool v1.0.0')));

  // Load environment file
  if (options.env !== '.env') {
    dotenv.config({ path: options.env });
  }

  // Prepare configuration
  const idpClientConfig = config.idp.client;
  const keycloakUrl = options.keycloakUrl || process.env.KEYCLOAK_URL || config.baseUrl;
  const idpRealm = options.idpRealm || process.env.IDENTITY_PROVIDER_REALM || config.idpRealm;
  const spRealm = options.spRealm || process.env.SERVICE_PROVIDER_REALM || config.spRealm;
  const adminUsername = options.username || process.env.ADMIN_USERNAME;
  const adminPassword = options.password || process.env.ADMIN_PASSWORD;

  // Step 1: Validate configuration
  console.log(pc.gray('\n📋 Step 1/7: Validating configuration...'));
  const setupConfig = validateConfig(keycloakUrl, idpRealm, spRealm, adminUsername, adminPassword);
  setupConfig.skipUsers = options.skipUsers;

  // Update client config with the provided keycloak URL
  idpClientConfig.webOrigins = [keycloakUrl];

  // Step 2: Authenticate to Keycloak
  console.log(pc.gray('\n🔐 Step 2/7: Authenticating to Keycloak...'));
  const kc = await authenticateKeycloak(keycloakUrl, adminUsername, adminPassword, config.masterRealm);

  const ctx: SetupContext = {
    ...setupConfig,
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
  await configureAuthFlow(ctx, config.authFlow.flow);

  // Step 6: Create SAML Broker
  console.log(pc.gray('\n🔗 Step 6/7: Creating SAML Broker...'));
  await createSamlBroker(ctx, config.sp.idp);

  // Step 7: Create Test Users
  console.log(pc.gray('\n👤 Step 7/7: Managing Test Users...'));
  await createTestUsers(ctx, config.testUsers);

  // Print Summary
  printSummary(ctx, config.sp.idp.alias, config.authFlow.flow.alias, config.testUsers);
}

main().catch((err) => {
  console.error(pc.red('\n💥 Critical error:'));
  console.error(err);
  process.exit(1);
});
