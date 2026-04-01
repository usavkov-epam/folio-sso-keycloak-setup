# Local Installation & Setup

Clone the repository locally and run the setup script from your machine.

## Prerequisites

- Node.js 24+ installed
- npm 11+ installed
- Git installed
- Access to a running Keycloak instance
- Admin credentials for Keycloak

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/usavkov-epam/folio-sso-keycloak-setup.git
cd folio-sso-keycloak-setup
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages:
- `@keycloak/keycloak-admin-client` - Keycloak admin client
- `commander` - CLI argument parsing
- `dotenv` - Environment variables
- `picocolors` - Colored console output

## Usage

### Quick Start

```bash
npm run setup -- \
  -k https://keycloak.example.com \
  -u admin \
  -p your-password
```

### With Custom Realm Names

```bash
npm run setup -- \
  -k https://keycloak.example.com \
  -u admin \
  -p your-password \
  --idp-realm my-idp \
  --sp-realm my-sp
```

### Without Test Users

```bash
npm run setup -- \
  -k https://keycloak.example.com \
  -u admin \
  -p your-password \
  --skip-users
```

### Show Help

```bash
npm run setup -- --help
```

## Environment Variables Setup

Create a `.env` file in the project root:

```bash
cat > .env << EOF
KEYCLOAK_URL=https://keycloak.example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
IDENTITY_PROVIDER_REALM=self-saml-idp-realm
SERVICE_PROVIDER_REALM=consortium
EOF
```

Then run with minimal arguments:

```bash
npm run setup
```

Or with specific command line overrides:

```bash
npm run setup -- --username different-admin -p different-password
```

## Available Scripts

```bash
# Run the setup
npm run setup

# Run with arguments
npm run setup -- -k <url> -u <username> -p <password>

# Show help
npm run setup -- --help

# Build TypeScript (if needed)
npm run build

# Type checking
npm run type-check
```

## Directory Structure

```
.
├── src/
│   ├── setup-sso.ts                    # Main entry point
│   ├── steps/                          # Individual setup steps
│   │   ├── types.ts
│   │   ├── validateConfig.ts
│   │   ├── authenticate.ts
│   │   ├── createIdpRealm.ts
│   │   ├── createSamlClient.ts
│   │   ├── configureAuthFlow.ts
│   │   ├── createSamlBroker.ts
│   │   ├── createTestUsers.ts
│   │   ├── printSummary.ts
│   │   └── index.ts
│   └── setup-sso.ts
├── foliosso.config.ts                  # Configuration file
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration File

Edit `foliosso.config.ts` to customize:

- SAML client settings
- Authentication flow configuration
- Test user credentials
- Broker settings

## Troubleshooting

### "npm: command not found"

Install Node.js and npm from [nodejs.org](https://nodejs.org/)

### Dependency Issues

Clear npm cache and reinstall:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

If you're running a local Keycloak:

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>
```

### CORS Issues

Make sure your Keycloak instance allows CORS from your machine. Check Keycloak admin console:
- Realm Settings → Web Origins
- Add your machine's IP or domain

## Development

### Running in Development Mode

```bash
FILE_WATCH=true npm run setup
```

### TypeScript Compilation

```bash
npx tsc src/setup-sso.ts
```

### Running Specific Type Checks

```bash
npx tsc --noEmit
```

## Next Steps

- [Manual Keycloak Configuration](./manual-setup.md) - For UI-based setup
- [Configuration Options](./configuration.md) - Customize your deployment
