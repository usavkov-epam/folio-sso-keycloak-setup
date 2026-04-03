# README

> **Folio SSO Keycloak Setup** - Automated SAML SSO configuration for FOLIO using Keycloak

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-%3E%3D11.0.0-blue)](https://www.npmjs.com/)

## Overview

This tool automates the setup of SAML Single Sign-On (SSO) between a FOLIO Service Provider and a Keycloak Identity Provider. It eliminates manual configuration steps in the Keycloak admin console and ensures consistent deployment.

### What It Sets Up

✅ **Identity Provider Realm** - SAML-enabled realm  
✅ **SAML Client** - Configured for FOLIO Service Provider  
✅ **Authentication Flow** - User detection and routing  
✅ **SAML Broker** - Identity Provider linkage  
✅ **Test Users** - Pre-configured for testing (optional)  

## 🚀 Quick Start

### Remote Execution (No Installation)

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p your-password
```

### Local Installation

```bash
git clone https://github.com/usavkov-epam/folio-sso-keycloak-setup.git
cd folio-sso-keycloak-setup
npm install
npm run setup -- -k https://keycloak.example.com -u admin -p your-password
```

### Manual UI Setup

Follow step-by-step instructions in the [Manual Setup Guide](./docs/manual-setup.md)

---

## 📖 Documentation

- **[Getting Started](docs/getting-started.md)** - Choose your setup method
- **[Remote Setup](docs/remote-setup.md)** - Run via npx without installation
- **[Local Setup](docs/local-setup.md)** - Clone and run locally
- **[Manual Setup](docs/manual-setup.md)** - Configure via Keycloak UI

## ⚡ Features

- **Automated** - No manual Keycloak console configuration needed
- **Idempotent** - Safe to run multiple times
- **Flexible** - Command line args, env vars, or .env file
- **Modular** - Clean, tested code organized by setup steps
- **Colored Output** - Clear, easy-to-follow progress
- **Error Handling** - Validates configuration before proceeding

## 📋 Prerequisites

- **Node.js** 24+
- **npm** 11+ (or yarn)
- **Keycloak** instance with admin access
- **Admin credentials** (username + password)

## 🎯 Usage

### Minimal

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p password
```

### With Custom Realm Names

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p password \
  --idp-realm my-idp-realm \
  --sp-realm my-sp-realm
```

### With Test User Mirror (from existing SP user)

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p password \
  --test-user john
```

**Note:** The mirror user will be created in the IdP realm with:
- Username: `john` (from the SP user)
- Password: `john` (automatically set to the username)
- Email: taken from the SP user (or defaults to username@example.com)

### Skip Test User Creation

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p password \
  --skip-users
```

### Using Environment Variables

```bash
export KEYCLOAK_URL=https://keycloak.example.com
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=password

npx usavkov-epam/folio-sso-keycloak-setup
```

### Show Help

```bash
npx usavkov-epam/folio-sso-keycloak-setup --help
```

### Non-CI interactive mode

When you run without `--ci`, setup starts in interactive mode and asks for:
- Keycloak URL (pre-populated with current config/env value)
- IdP realm (pre-populated with current config/env value)
- SP realm (pre-populated with current config/env value)
- Test user (pre-populated with existing test user or `sso-sample-user`)

If admin user/password are already provided via CLI or env, these are used and not asked again.

## 🔧 Configuration Options

| Flag | Env Var | Description | Required | Default |
|------|---------|-------------|----------|---------|
| `-k, --keycloak-url` | `KEYCLOAK_URL` | Keycloak base URL | ✅ | - |
| `-u, --username` | `ADMIN_USERNAME` | Admin username | ✅ | - |
| `-p, --password` | `ADMIN_PASSWORD` | Admin password | ✅ | - |
| `--idp-realm` | `IDENTITY_PROVIDER_REALM` | IdP realm name | - | `self-saml-idp-realm` |
| `--sp-realm` | `SERVICE_PROVIDER_REALM` | SP realm name | - | `consortium` |
| `--test-user` | `TEST_USER` | Test user to mirror from SP (username or email) | - | - |
| `--test-user-field` | - | Field to query user by: `username` or `email` | - | `username` |
| `--skip-users` | - | Skip test user creation | - | false |
| `-e, --env` | - | Path to .env file | - | `.env` |
| `--ci` | - | Non-interactive mode, requires admin credentials | - | false |
| `-h, --help` | - | Show help message | - | - |

## 📂 Project Structure

```
folio-sso-keycloak-setup/
├── bin/
│   └── setup.js                        # Entry point for npm run setup
├── src/
│   ├── setup-sso.ts                    # Main orchestrator
│   ├── steps/                          # Individual setup steps
│   │   ├── index.ts                    # Exports all steps
│   │   ├── types.ts                    # TypeScript interfaces
│   │   ├── validateConfig.ts           # Config validation
│   │   ├── authenticate.ts             # Keycloak auth
│   │   ├── createIdpRealm.ts           # IdP realm creation
│   │   ├── createSamlClient.ts         # SAML client setup
│   │   ├── configureAuthFlow.ts        # Auth flow config
│   │   ├── createSamlBroker.ts         # Broker creation
│   │   ├── createTestUsers.ts          # Test user creation
│   │   └── printSummary.ts             # Summary output
│   └── setup-sso.ts                    # Implementation
├── docs/
│   ├── getting-started.md              # Start here
│   ├── remote-setup.md                 # npx setup
│   ├── local-setup.md                  # Local installation
│   └── manual-setup.md                 # UI configuration
├── foliosso.config.ts                  # Configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Setup Steps

The script performs 7 sequential steps:

1. **Validation** - Check all required parameters
2. **Authentication** - Connect to Keycloak with admin credentials
3. **IdP Realm Creation** - Create Identity Provider realm
4. **SAML Client Setup** - Configure SAML client in IdP
5. **Auth Flow Configuration** - Set up authentication flow in SP
6. **SAML Broker Creation** - Link SP to IdP
7. **Test User Creation** - Create sample users (optional)

Each step includes error handling and idempotent operations.

## ✅ Verification

After setup, verify configuration:

```bash
# Check IdP metadata
curl https://keycloak.example.com/realms/self-saml-idp-realm/protocol/saml/descriptor

# Test login - Open in browser
https://keycloak.example.com/realms/consortium/account/
```

## 🐛 Troubleshooting

### Connection Refused
```bash
# Verify Keycloak is running
curl https://keycloak.example.com/health
```

### Invalid Credentials
```bash
# Test credentials
curl -X POST https://keycloak.example.com/auth/realms/master/protocol/openid-connect/token \
  -d "username=admin&password=password&grant_type=password&client_id=admin-cli"
```

### CORS Issues
Configure Keycloak CORS:
1. Realm Settings → Web Origins
2. Add your domain

See [Troubleshooting Guide](docs/remote-setup.md#troubleshooting) for more issues.

## 🎓 Learning Resources

- [Getting Started Guide](docs/getting-started.md) - Overview of all methods
- [Manual Setup Guide](docs/manual-setup.md) - Learn how SAML SSO works
- [Keycloak Documentation](https://www.keycloak.org/docs)
- [SAML 2.0 Specification](https://en.wikipedia.org/wiki/SAML_2.0)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check [documentation](docs/getting-started.md)
- Review [troubleshooting](docs/remote-setup.md#troubleshooting)
- Open an issue on GitHub

## 🎯 Use Cases

- ✅ Setting up FOLIO consortia SSO
- ✅ Test environment provisioning
- ✅ CI/CD pipeline integration
- ✅ Multi-realm SAML deployments
- ✅ Learning SAML SSO concepts

## 📝 Example Workflows

### One-Time Setup

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.prod.example.com \
  -u production-admin \
  -p production-password
```

### Development Environment

```bash
git clone https://github.com/usavkov-epam/folio-sso-keycloak-setup.git
cd folio-sso-keycloak-setup
echo "KEYCLOAK_URL=http://localhost:8080" > .env
echo "ADMIN_USERNAME=admin" >> .env
echo "ADMIN_PASSWORD=admin" >> .env
npm install && npm run setup
```

### CI/CD Integration

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k $KEYCLOAK_URL \
  -u $KEYCLOAK_USER \
  -p $KEYCLOAK_PASSWORD
```

---

**Ready to get started?** → [Read Getting Started Guide](docs/getting-started.md)
