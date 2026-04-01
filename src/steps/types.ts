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

export interface AuthenticationFlow {
  alias: string;
  description: string;
  providerId: string;
  topLevel: boolean;
  builtIn: boolean;
}

export interface AuthenticationExecution {
  authenticator: string;
  authenticatorFlow: boolean;
  requirement: string;
  priority: number;
  userSetupAllowed: boolean;
  authenticatorConfig?: string;
}
