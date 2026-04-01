import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import pc from 'picocolors';
import type { SetupContext } from './types.js';

export async function authenticateKeycloak(
  keycloakUrl: string,
  adminUsername: string,
  adminPassword: string,
  masterRealm: string
): Promise<SetupContext['kc']> {
  const kc = new KeycloakAdminClient({
    baseUrl: keycloakUrl,
    realmName: masterRealm,
  });

  console.log(pc.blue('🔑 Authenticating to Keycloak...'));
  await kc.auth({
    username: adminUsername,
    password: adminPassword,
    grantType: 'password',
    clientId: 'admin-cli',
  });
  console.log(pc.green('✅ Authenticated'));

  return kc;
}
