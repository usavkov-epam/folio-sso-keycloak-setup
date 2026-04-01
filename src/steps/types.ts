import KeycloakAdminClient from '@keycloak/keycloak-admin-client';

export interface SetupConfig {
  keycloakUrl: string;
  idpRealm: string;
  spRealm: string;
  adminUsername: string;
  adminPassword: string;
  skipUsers: boolean;
}

export interface SetupContext extends SetupConfig {
  kc: KeycloakAdminClient;
}
