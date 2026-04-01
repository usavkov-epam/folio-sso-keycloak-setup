import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { Command } from 'commander';
import dotenv from 'dotenv';
import pc from 'picocolors';

import config from '../foliosso.config.js';

const program = new Command();

program
  .name('folio-sso')
  .description('Folio SSO Setup Tool - creates service provider and broker in consortium')
  .version('1.0.0')
  .option('-e, --env <path>', 'path to .env file', '.env')
  .option('--skip-users', 'skip creating test users', false)
  .parse(process.argv);

const options = program.opts();

async function main() {
  console.log(pc.bold(pc.cyan('🚀 Folio SSO Setup Tool v1.0.0')));

  if (options.env !== '.env') {
    dotenv.config({ path: options.env });
  }

  const idpClientConfig = config.idp.client;

  const kc = new KeycloakAdminClient({
    baseUrl: config.baseUrl,
    realmName: config.masterRealm,
  });

  console.log(pc.blue('🔑 Authenticating to Keycloak...'));
  await kc.auth({
    username: process.env.ADMIN_USERNAME!,
    password: process.env.ADMIN_PASSWORD!,
    grantType: 'password',
    clientId: 'admin-cli',
  });
  console.log(pc.green('✅ Authenticated'));

  // 1. Create IdP Realm
  console.log(pc.blue(`🌍 Processing IdP Realm: ${config.idpRealm}`));
  try {
    await kc.realms.create({
      realm: config.idpRealm,
      enabled: true,
    });
    console.log(pc.green(`✅ Realm ${config.idpRealm} created`));
  } catch (e: any) {
    if (e.response?.status === 409) {
      console.log(pc.blue(`ℹ️ Realm ${config.idpRealm} already exists`));
    } else throw e;
  }

  // 2. SAML Client
  console.log(pc.blue('🔗 Setting up SAML Client in Service Provider realm...'));
  try {
    await kc.clients.create({
      realm: config.idpRealm,
      ...idpClientConfig,
    });
    console.log(pc.green('✅ SAML Client created'));
  } catch (e: any) {
    if (e.response?.status === 409) {
      const existing = await kc.clients.find({
        realm: config.idpRealm,
        clientId: idpClientConfig.clientId,
      });
      if (existing[0]?.id) {
        await kc.clients.update({
          realm: config.idpRealm,
          id: existing[0].id,
        }, idpClientConfig);
        console.log(pc.green('✅ SAML Client updated'));
      }
    }
  }

  // 3. Authorization flows
  console.log(pc.blue('🔐 Configuring authorization flows...'));
  const authFlowConfig = config.authFlow.flow;

  try {
    await kc.authenticationManagement.createFlow({
      realm: config.spRealm,
      ...authFlowConfig,
    });
    console.log(pc.green(`✅ Authentication flow "${authFlowConfig.alias}" created`));
  } catch (e: any) {
    if (e.response?.status === 409) {
      const existingFlows = await kc.authenticationManagement.getFlows({ realm: config.spRealm });
      const existing = existingFlows.find(f => f.alias === authFlowConfig.alias);

      if (existing?.id) {
        await kc.authenticationManagement.updateFlow({
          realm: config.spRealm,
          flowId: existing.id,
        }, authFlowConfig);
        console.log(pc.green(`✅ Authentication flow "${authFlowConfig.alias}" updated`));
      }
    }
  }

  // 4. SAML Broker
  console.log(pc.blue('🔗 Setting up SAML Broker...'));
  const brokerPayload = config.sp.idp;

  try {
    await kc.identityProviders.create({
      realm: config.spRealm,
      ...brokerPayload,
    });
    console.log(pc.green('✅ SAML Broker created'));
  } catch (e: any) {
    if (e.response?.status === 409) {
      await kc.identityProviders.update({
        realm: config.spRealm,
        alias: config.sp.idp.alias,
      }, brokerPayload);
      console.log(pc.green('✅ SAML Broker updated'));
    }
  }

  // 5. Test Users
  if (!options.skipUsers) {
    console.log(pc.blue('👤 Creating test users...'));
    for (const user of config.testUsers) {
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
        }
      }
    }
  }

  console.log('\n' + pc.bold(pc.green('🎉 === SETUP COMPLETED SUCCESSFULLY ===')));
  console.log(pc.cyan(`   IdP Realm     → ${config.idpRealm}`));
  console.log(pc.cyan(`   SP Realm      → ${config.spRealm}`));
  console.log(pc.cyan(`   Broker Alias  → ${config.sp.idp.alias}`));
  console.log(pc.cyan(`   Auth Flow     → ${config.authFlow.flow.alias}`));
  console.log(pc.cyan(`   Test Users     → ${config.testUsers[0].username} (IdP), ${config.testUsers[1].username} (SP)`));
  console.log(pc.green('\n   Ready to test "Self SSO Login" button.\n'));
}

main().catch((err) => {
  console.error(pc.red('\n💥 Critical error:'));
  console.error(err);
  process.exit(1);
});
