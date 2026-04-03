import { Command } from 'commander';
import dotenv from 'dotenv';

dotenv.config();

const {
  IDENTITY_PROVIDER_ALIAS = 'self-sso-idp-alias',
  IDENTITY_PROVIDER_REALM = 'self-saml-idp-realm',
  KEYCLOAK_URL = 'https://folio-edev-thunderjet-keycloak.ci.folio.org',
  MASTER_REALM = 'master',
  SERVICE_PROVIDER_AUTH_FLOW_ALIAS = 'Detect and set existing user',
  SERVICE_PROVIDER_CLIENT_ID = 'folio-sso-sp-client',
  SERVICE_PROVIDER_REALM = 'consortium',
} = process.env;

// Static config
const defaultConfig = {
  baseUrl: KEYCLOAK_URL,
  masterRealm: MASTER_REALM,
  idpRealm: IDENTITY_PROVIDER_REALM,
  spRealm: SERVICE_PROVIDER_REALM,
  idp: {
    client: {
      clientId: SERVICE_PROVIDER_CLIENT_ID,
      name: "Self SAML IDP as SP for FOLIO IdP Broker",
      description: "",
      rootUrl: "",
      adminUrl: "",
      baseUrl: "",
      surrogateAuthRequired: false,
      enabled: true,
      alwaysDisplayInConsole: false,
      clientAuthenticatorType: "client-secret",
      redirectUris: [
        "*"
      ],
      webOrigins: [
        KEYCLOAK_URL
      ],
      notBefore: 0,
      bearerOnly: false,
      consentRequired: false,
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: false,
      serviceAccountsEnabled: false,
      publicClient: false,
      frontchannelLogout: false,
      protocol: "saml",
      attributes: {
        'saml.assertion.signature': "false",
        'saml_force_post_binding': "true",
        'saml.force.post.binding': "true",
        'saml_idp_initiated_sso_url_name': IDENTITY_PROVIDER_ALIAS,
        'saml.server.signature': "false",
        'saml.server.signature.keyinfo.ext': "false",
        realm_client: "false",
        'saml.artifact.binding': "false",
        'saml.signature.algorithm': "RSA_SHA256",
        saml_force_name_id_format: "false",
        'saml.client.signature': "false",
        'saml.authnstatement': "true",
        'display.on.consent.screen': "false",
        saml_name_id_format: "username",
        "saml.allow.ecp.flow": "false",
        saml_client_signature_required: "false",
        "saml.onetimeuse.condition": "false"
      },
      authenticationFlowBindingOverrides: {},
      fullScopeAllowed: true,
      nodeReRegistrationTimeout: -1,
      protocolMappers: [
        {
          name: "NameID = Username",
          protocol: "saml",
          protocolMapper: "saml-user-attribute-nameid-mapper",
          consentRequired: false,
          config: {
            'mapper.nameid.format': "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
            'user.attribute': "username"
          }
        }
      ],
      defaultClientScopes: [
        "saml_organization",
        "role_list"
      ],
      optionalClientScopes: [],
      access: {
        view: true,
        configure: true,
        manage: true
      }
    }
  },
  sp: {
    idp: {
      alias: IDENTITY_PROVIDER_ALIAS,
      displayName: "Self SSO Login for FOLIO",
      providerId: "saml",
      enabled: true,
      trustEmail: false,
      storeToken: false,
      addReadTokenRoleOnCreate: false,
      linkOnly: false,
      hideOnLogin: false,
      firstBrokerLoginFlowAlias: SERVICE_PROVIDER_AUTH_FLOW_ALIAS,
      config: {
        postBindingLogout: "false",
        postBindingResponse: "true",
        showInAccountConsole: "ALWAYS",
        backchannelSupported: "false",
        caseSensitiveOriginalUsername: "false",
        loginHint: "false",
        allowCreate: "false",
        syncMode: "IMPORT",
        authnContextComparisonType: "exact",
        singleSignOnServiceUrl: `${KEYCLOAK_URL}/realms/${IDENTITY_PROVIDER_REALM}/protocol/saml`,
        wantAuthnRequestsSigned: "false",
        allowedClockSkew: "0",
        artifactBindingResponse: "false",
        validateSignature: "false",
        nameIDPolicyFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
        entityId: SERVICE_PROVIDER_CLIENT_ID,
        signSpMetadata: "false",
        wantAssertionsEncrypted: "false",
        sendClientIdOnLogout: "false",
        wantAssertionsSigned: "false",
        sendIdTokenOnLogout: "true",
        postBindingAuthnRequest: "true",
        forceAuthn: "false",
        attributeConsumingServiceIndex: "0",
        principalType: "SUBJECT"
      },
      types: [
        "USER_AUTHENTICATION"
      ]
    },
  },
  authFlow: {
    flow: {
      alias: SERVICE_PROVIDER_AUTH_FLOW_ALIAS,
      description: "Flow intended to be used for SAML SSO.  Detects and sets the existing user",
      providerId: "basic-flow",
      topLevel: true,
      builtIn: false,
    },
    authenticationExecutions: [
      {
        authenticator: "idp-detect-existing-broker-user",
        authenticatorFlow: false,
        requirement: "REQUIRED",
        priority: 2,
        autheticatorFlow: false,
        userSetupAllowed: false
      },
      {
        authenticatorConfig: "set_existing",
        authenticator: "idp-auto-link",
        authenticatorFlow: false,
        requirement: "REQUIRED",
        priority: 3,
        autheticatorFlow: false,
        userSetupAllowed: false
      }
    ]
  },
};

/**
 * Build final setup configuration from CLI arguments and environment variables
 */
function buildConfig() {
  const program = new Command();

  program
    .name('folio-sso')
    .description('Folio SSO Setup Tool - creates service provider and broker in consortium')
    .version('1.0.0')
    .option('-e, --env <path>', 'path to .env file (default: .env)', '.env')
    .option('-k, --keycloak-url <url>', 'Keycloak base URL (or use KEYCLOAK_URL env var)')
    .option('--idp-realm <realm>', 'Identity Provider realm name (or use IDENTITY_PROVIDER_REALM env var)')
    .option('--sp-realm <realm>', 'Service Provider realm name (or use SERVICE_PROVIDER_REALM env var)')
    .option('--ci', 'skip interactive mode and require all values from CLI or env vars', false)
    .option('--skip-users', 'skip creating test users', false)
    .option('-u, --username <username>', 'Keycloak admin username (or use ADMIN_USERNAME env var)')
    .option('-p, --password <password>', 'Keycloak admin password (or use ADMIN_PASSWORD env var)')
    .option('--test-user <username>', 'SP test user to mirror in IdP (or use TEST_USER env var)')
    .option('--test-user-field <field>', 'Field to use for IdP user creation (default: username)', 'username')
    .addHelpText('after', `
Examples:
  $ folio-sso -k https://keycloak.example.com -u admin -p password --test-user john
  $ folio-sso -k https://keycloak.example.com -u admin -p password --test-user john.doe --test-user-field email
  $ folio-sso --keycloak-url https://keycloak.example.com --username admin --password password --skip-users
  $ TEST_USER=john folio-sso -k https://keycloak.example.com -u admin -p password
  
Environment Variables:
  KEYCLOAK_URL                    Keycloak base URL
  IDENTITY_PROVIDER_REALM         IdP realm name (default: self-saml-idp-realm)
  SERVICE_PROVIDER_REALM          SP realm name (default: consortium)
  ADMIN_USERNAME                  Admin username for authentication
  ADMIN_PASSWORD                  Admin password for authentication
  TEST_USER                       SP test user to mirror in IdP
`)
    .parse(process.argv);

  const options = program.opts();

  // Load custom environment file if specified
  if (options.env !== '.env') {
    dotenv.config({ path: options.env });
  }

  // Merge CLI options with environment variables and defaults (no duplication)
  const finalConfig = {
    ...defaultConfig,
    baseUrl: options.keycloakUrl || defaultConfig.baseUrl,
    idpRealm: options.idpRealm || defaultConfig.idpRealm,
    spRealm: options.spRealm || defaultConfig.spRealm,
    adminUsername: options.username || process.env.ADMIN_USERNAME,
    adminPassword: options.password || process.env.ADMIN_PASSWORD,
    testUserName: options.testUser || process.env.TEST_USER,
    testUserField: options.testUserField,
    skipUsers: options.skipUsers,
    ci: options.ci,
  };

  // Update dynamic values that depend on CLI-overridable parameters
  // Sanitize URL: remove trailing slashes to avoid //
  const finalKeycloakUrl = finalConfig.baseUrl.replace(/\/+$/, '');
  const finalIdpRealm = finalConfig.idpRealm;

  finalConfig.baseUrl = finalKeycloakUrl;
  finalConfig.idp.client.webOrigins = [finalKeycloakUrl];
  finalConfig.sp.idp.config.singleSignOnServiceUrl = `${finalKeycloakUrl}/realms/${finalIdpRealm}/protocol/saml`;

  return finalConfig;
}

export default buildConfig();
