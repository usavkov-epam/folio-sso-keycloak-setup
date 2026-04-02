import pc from 'picocolors';
import type { SetupConfig } from './types.js';

/**
 * Sanitize and normalize input values
 */
function sanitizeInput(input: string, fieldName: string, isUrl: boolean = false): string {
  if (!input) return input;

  let sanitized = input.trim();

  if (isUrl) {
    // Remove trailing slashes for URLs
    sanitized = sanitized.replace(/\/+$/, '');
    // Ensure URL starts with http:// or https://
    if (!sanitized.match(/^https?:\/\//)) {
      console.warn(pc.yellow(`⚠️ Warning: ${fieldName} should start with http:// or https://`));
    }
  } else {
    // For realm names and usernames, remove leading/trailing slashes and special chars
    sanitized = sanitized.replace(/^\/+|\/+$/g, '');
  }

  return sanitized;
}

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
    keycloakUrl: sanitizeInput(keycloakUrl, 'Keycloak URL', true),
    idpRealm: sanitizeInput(idpRealm, 'IdP Realm'),
    spRealm: sanitizeInput(spRealm, 'SP Realm'),
    adminUsername: sanitizeInput(adminUsername, 'Admin Username'),
    adminPassword: adminPassword,  // Don't validate password content
    skipUsers: false,
  };
}
