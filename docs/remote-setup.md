# Remote Setup via npx

Run the Folio SSO setup script directly from GitHub without local installation.

## Prerequisites

- Node.js 24+ installed
- Access to a running Keycloak instance
- Admin credentials for Keycloak

## Usage

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  --keycloak-url https://keycloak.example.com \
  --username admin \
  --password your-password \
  --idp-realm idp \
  --sp-realm consortium
```

Or with short flags:

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p your-password \
  --idp-realm idp \
  --sp-realm sp
```

## Available Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--keycloak-url` | `-k` | Keycloak base URL | Required |
| `--username` | `-u` | Admin username | Required |
| `--password` | `-p` | Admin password | Required |
| `--idp-realm` | - | IdP realm name | `self-saml-idp-realm` |
| `--sp-realm` | - | SP realm name | `consortium` |
| `--test-user` | - | SP test user to mirror in IdP | (optional) |
| `--test-user-field` | - | Field to use for IdP user (username or email) | `username` |
| `--skip-users` | - | Skip test users creation | false |
| `--env` | `-e` | Path to .env file | `.env` |
| `--help` | `-h` | Show help message | - |

## Environment Variables

Instead of passing credentials via command line, you can use environment variables:

```bash
export KEYCLOAK_URL=https://keycloak.example.com
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=your-password
export IDENTITY_PROVIDER_REALM=idp
export SERVICE_PROVIDER_REALM=consortium

# Optional: specify test user from SP to mirror in IdP
export TEST_USER=john

npx usavkov-epam/folio-sso-keycloak-setup
```

## Examples

### Basic Setup
```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p SecretPassword
```

### Without Test Users
```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p SecretPassword \
  --skip-users
```

### With Test User Mirror (from existing SP user)
```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p SecretPassword \
  --test-user john
```

**Note:** The mirror user will be created in the IdP realm with:
- Username: `john` (from the SP user)
- Password: `john` (automatically set to the username)
- Email: taken from the SP user (or defaults to username@example.com)

### Using Email as IdP User Identifier
```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p SecretPassword \
  --test-user john.doe \
  --test-user-field email
```

## What Gets Set Up

The script automatically:

1. ✅ Creates Identity Provider (IdP) Realm
2. ✅ Creates SAML Client in IdP realm
3. ✅ Configures Authentication Flow
4. ✅ Sets up SAML Broker in Service Provider
5. ✅ Creates test user in IdP (mirrors from SP user, password = username)

## Troubleshooting

### "Module not found" Error
Ensure Node.js 24+ is installed:
```bash
node --version
```

### "Connection refused" Error
Check that Keycloak is running and the URL is accessible:
```bash
curl https://keycloak.example.com/health
```

### "Invalid credentials" Error
Verify your username and password are correct. You can test them:
```bash
curl -X POST https://keycloak.example.com/auth/realms/master/protocol/openid-connect/token \
  -d "username=admin&password=your-password&grant_type=password&client_id=admin-cli"
```

### "Realm already exists" Warning
This is normal if you run the setup multiple times. The script updates existing resources.
