# Getting Started

Welcome to **Folio SSO Keycloak Setup**! This guide helps you set up SAML SSO for FOLIO using Keycloak.

## 🚀 Quick Start

Choose your preferred setup method:

### Option 1: Remote Setup (Recommended for One-Time Setup)

Run the script directly without installation:

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \
  -u admin \
  -p your-password
```

**Pros**: No installation, always latest version  
**Cons**: Requires Node.js, slightly slower to run

👉 [Read Full Guide: Remote Setup](./remote-setup.md)

---

### Option 2: Local Installation (Recommended for Development)

Clone and run locally:

```bash
git clone https://github.com/usavkov-epam/folio-sso-keycloak-setup.git
cd folio-sso-keycloak-setup
npm install
npm run setup -- -k https://keycloak.example.com -u admin -p your-password
```

**Pros**: Fast execution, reusable, easy to customize  
**Cons**: Requires local clone and npm install

👉 [Read Full Guide: Local Setup](./local-setup.md)

---

### Option 3: Manual Configuration via UI

Use Keycloak admin console to configure everything manually:

1. Create Identity Provider Realm
2. Configure SAML Client
3. Set up Authentication Flow
4. Create SAML Broker
5. Create test users

**Pros**: Learn how everything works  
**Cons**: Time-consuming, error-prone

👉 [Read Full Guide: Manual Setup](./manual-setup.md)

---

## 📋 Prerequisites

All setup methods require:

- **Node.js 24+** (for automated setups)
- **Running Keycloak instance** (with admin access)
- **Admin credentials** (username and password)

## ⚙️ Configuration

### Minimal Setup

Requires only 3 parameters:

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \     # Keycloak URL
  -u admin \                             # Admin username
  -p SecretPassword                      # Admin password
```

### Full Configuration

```bash
npx usavkov-epam/folio-sso-keycloak-setup \
  -k https://keycloak.example.com \     # Keycloak URL
  -u admin \                             # Admin username
  -p SecretPassword \                    # Admin password
  --idp-realm my-idp \                   # IdP realm name (default: self-saml-idp-realm)
  --sp-realm my-sp \                     # SP realm name (default: consortium)
  --skip-users                           # Skip test user creation
  -e ./custom.env                        # Custom .env file path
```

## 📊 What Gets Set Up

The automated scripts configure:

1. **Identity Provider Realm**
   - SAML-enabled realm for identity provider

2. **SAML Client**
   - Configured for FOLIO Service Provider
   - Set to use POST binding
   - NameID mapper configured

3. **Authentication Flow**
   - "Detect and set existing user" flow
   - Identity Provider Redirector configured

4. **SAML Broker**
   - Links Service Provider to Identity Provider
   - Configured for SAML v2.0
   - Token sync enabled

5. **Test Users** (optional)
   - IdP test user
   - SP test user
   - Pre-configured passwords

## 🔍 Verification

After setup completes, verify configuration:

```bash
curl https://keycloak.example.com/realms/self-saml-idp-realm/protocol/saml/descriptor
```

Check in Keycloak admin console:
- [ ] IdP realm exists
- [ ] SAML client exists in IdP realm
- [ ] Authentication flow exists in SP realm
- [ ] Identity brokers configured in SP realm
- [ ] Test users created (if not skipped)

## 📚 Command Reference

### Help

```bash
npx usavkov-epam/folio-sso-keycloak-setup --help
npm run setup -- --help  # (local installation)
```

### Using Environment Variables

```bash
export KEYCLOAK_URL=https://keycloak.example.com
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=SecretPassword
export IDENTITY_PROVIDER_REALM=my-idp
export SERVICE_PROVIDER_REALM=my-sp

npx usavkov-epam/folio-sso-keycloak-setup
```

### Dry Run (Manual Setup First)

Follow the [Manual Setup Guide](./manual-setup.md) to understand flow before automation.

## 🐛 Troubleshooting

### Setup Fails with "Connection refused"

Keycloak is not running or URL is invalid:

```bash
curl https://keycloak.example.com/health
```

### Setup Fails with "Invalid credentials"

Verify admin credentials:

```bash
# Test credentials with curl
curl -X POST https://keycloak.example.com/auth/realms/master/protocol/openid-connect/token \
  -d "username=admin&password=your-password&grant_type=password&client_id=admin-cli"
```

### "Realm already exists" Warning

This is normal! Run setup again to update existing configuration.

### CORS Errors

Configure CORS in Keycloak:
1. Realm Settings → Web Origins
2. Add your origin (e.g., `*` for testing)

## 🔗 Next Steps

1. **Choose setup method** above
2. **Configure credentials** for your Keycloak instance
3. **Run setup** script or follow manual steps
4. **Verify** configuration in admin console
5. **Test** SAML flow

## 💡 Tips

- **Save credentials** in `.env` file for repeated runs
- **Use `--skip-users`** if you manage users differently
- **Keep logs** from setup runs for troubleshooting
- **Test login flow** after setup completes

## 📖 Additional Resources

- [Remote Setup Guide](./remote-setup.md)
- [Local Setup Guide](./local-setup.md)
- [Manual Setup Guide](./manual-setup.md)
- [Keycloak Documentation](https://www.keycloak.org/documentation.html)
- [SAML 2.0 Overview](https://en.wikipedia.org/wiki/SAML_2.0)

## ❓ Questions?

Check the documentation in `/docs` or review setup logs for error details.

---

**Happy SSO setup! 🎉**
