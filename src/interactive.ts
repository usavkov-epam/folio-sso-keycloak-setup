import {
  input,
  password,
  confirm,
  select,
} from "@inquirer/prompts";

interface InteractiveConfig {
  keycloakUrl: string;
  username: string;
  password: string;
  idpRealm: string;
  spRealm: string;
  skipUsers: boolean;
  testUserName?: string;
}

interface InteractiveDefaults {
  keycloakUrl: string;
  idpRealm: string;
  spRealm: string;
  testUserName?: string;
  adminUsername?: string;
  adminPassword?: string;
  skipUsers?: boolean;
}

export async function collectConfigInteractive(defaults: InteractiveDefaults): Promise<InteractiveConfig> {
  console.log("\n🔐 FOLIO SSO Setup - Interactive Configuration");
  console.log("============================================\n");
  console.log(
    "Answer the following questions to configure Keycloak SSO setup.\n"
  );

  const keycloakUrlChoice = await select({
    message: "Choose Keycloak URL",
    choices: [
      {
        name: `${defaults.keycloakUrl} (from config)`,
        value: defaults.keycloakUrl,
      },
      { name: "Enter manually", value: "manual" },
    ],
  });

  const keycloakUrl =
    keycloakUrlChoice === "manual"
      ? await input({
          message: "Keycloak URL",
          validate: (value) => {
            if (!value) return "Keycloak URL is required";
            if (!value.startsWith("http://") && !value.startsWith("https://")) {
              return "URL must start with http:// or https://";
            }
            return true;
          },
        })
      : keycloakUrlChoice;

  console.log(
    "\n📝 Admin Credentials\nThese are used to authenticate with the Keycloak Admin API.\n"
  );

  const username =
    defaults.adminUsername ||
    (await input({
      message: "Admin username",
      default: "admin",
      validate: (value) => (value ? true : "Username is required"),
    }));

  const adminPassword =
    defaults.adminPassword ||
    (await password({
      message: "Admin password",
      mask: "*",
    }));

  console.log(
    "\n🏢 Realm Configuration\nRealms are isolated environments for managing users and applications.\n"
  );

  const idpRealmChoice = await select({
    message: "Choose IdP realm",
    choices: [
      { name: `${defaults.idpRealm} (from config)`, value: defaults.idpRealm },
      { name: "folio-identity-provider", value: "folio-identity-provider" },
      { name: "Enter manually", value: "manual" },
    ],
  });

  const idpRealm =
    idpRealmChoice === "manual"
      ? await input({
          message: "Identity Provider (IdP) realm name",
          validate: (value) => (value ? true : "IdP realm name is required"),
        })
      : idpRealmChoice;

  const spRealmChoice = await select({
    message: "Choose SP realm",
    choices: [
      { name: `${defaults.spRealm} (from config)`, value: defaults.spRealm },
      { name: "consortium", value: "consortium" },
      { name: "college", value: "college" },
      { name: "university", value: "university" },
      { name: "Enter manually", value: "manual" },
    ],
  });

  const spRealm =
    spRealmChoice === "manual"
      ? await input({
          message: "Service Provider (SP) realm name",
          validate: (value) => (value ? true : "SP realm name is required"),
        })
      : spRealmChoice;

  console.log(
    "\n👤 Test User Configuration\nTest users help verify that SSO integration is working correctly.\n"
  );

  const createTestUsers = await confirm({
    message: "Create test users for verification?",
    default: defaults.skipUsers === undefined ? true : !defaults.skipUsers,
  });

  let testUserName: string | undefined;
  if (createTestUsers) {
    const defaultTestUser = defaults.testUserName || "sso-sample-user";
    const testUserChoice = await select({
      message: "Choose test user name",
      choices: [
        { name: `${defaultTestUser} (from config)`, value: defaultTestUser },
        { name: "sso-sample-user", value: "sso-sample-user" },
        { name: "Enter manually", value: "manual" },
      ],
    });

    testUserName =
      testUserChoice === "manual"
        ? await input({
            message: "Test user name",
            validate: (value) => (value ? true : "Test user name is required"),
          })
        : testUserChoice;
  }

  return {
    keycloakUrl,
    username,
    password: adminPassword,
    idpRealm,
    spRealm,
    skipUsers: !createTestUsers,
    testUserName: testUserName && testUserName !== "sso-sample-user" ? testUserName : undefined,
  };
}
