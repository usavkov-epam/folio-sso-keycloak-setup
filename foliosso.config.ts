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

export default {
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
    }
  },
  testUsers: [
    {
      realm: IDENTITY_PROVIDER_REALM,
      username: "thunderjet",
      email: "thunderjet@example.com",
      firstName: "Test",
      lastName: "User",
      password: "thunderjet"
    },
    {
      realm: SERVICE_PROVIDER_REALM,
      username: "thunderjet",
      email: "thunderjet@example.com",
      firstName: "Test",
      lastName: "User",
      password: "thunderjet"
    }
  ],
};
