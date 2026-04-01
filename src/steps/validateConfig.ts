import pc from 'picocolors';
import type { SetupConfig } from './types.js';

export function validateConfig(
  keycloakUrl: string | undefined,
  idpRealm: string | undefined,
  spRealm: string | undefined,
  adminUsername: string | undefined,
  adminPassword: string | undefined
): SetupConfig {
  if (!keycloakUrl) {
    console.error(pc.red('❌ Error: Keycloak URL is required'));
    console.error(pc.yellow('Provide it via:'));
    console.error(pc.yellow('  -k, --keycloak-url <url>'));
    console.error(pc.yellow('Or set KEYCLOAK_URL environment variable'));
    process.exit(1);
  }

  if (!idpRealm || !spRealm) {
    console.error(pc.red('❌ Error: IdP and SP realm names are required'));
    console.error(pc.yellow('Provide them via:'));
    console.error(pc.yellow('  --idp-realm <realm>'));
    console.error(pc.yellow('  --sp-realm <realm>'));
    console.error(pc.yellow('Or set IDENTITY_PROVIDER_REALM and SERVICE_PROVIDER_REALM environment variables'));
    process.exit(1);
  }

  if (!adminUsername || !adminPassword) {
    console.error(pc.red('❌ Error: Admin username and password are required'));
    console.error(pc.yellow('Provide them via:'));
    console.error(pc.yellow('  -u, --username <username>'));
    console.error(pc.yellow('  -p, --password <password>'));
    console.error(pc.yellow('Or set ADMIN_USERNAME and ADMIN_PASSWORD environment variables'));
    process.exit(1);
  }

  return {
    keycloakUrl,
    idpRealm,
    spRealm,
    adminUsername,
    adminPassword,
    skipUsers: false,
  };
}
