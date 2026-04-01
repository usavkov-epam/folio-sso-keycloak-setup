# Manual Keycloak Setup via UI

Step-by-step guide for configuring SAML SSO in Keycloak using the admin console.

> **Recommended**: Use the automated script instead. This guide is for understanding what's being configured or for custom setups.

## Prerequisites

- Access to Keycloak admin console
- Admin credentials
- Understanding of SAML concepts

## Step 1: Create Identity Provider (IdP) Realm

1. Navigate to Keycloak admin console: `https://keycloak.example.com/admin`
2. Log in with admin credentials
3. From the top-left dropdown (currently showing "master"), click "Create Realm"
4. Enter realm name: `self-saml-idp-realm`
5. Click "Create"

## Step 2: Create SAML Client in IdP Realm

1. Make sure you're in the `self-saml-idp-realm` realm
2. Go to **Clients** → **Create client**
3. Enter client ID: `folio-sso-sp-client`
4. Choose protocol: **SAML**
5. Click **Next**
6. Configure settings:
   - **Root URL**: (leave empty)
   - **Valid Redirect URIs**: `*`
   - **Force POST Binding**: ON
   - **Force Artifact Binding**: OFF
   - **SAML Assertion Signature**: OFF
   - **SAML Server Signature**: OFF
   - **SAML Client Signature Required**: OFF
   - **SAML Single Logout Service**: Enable
   - **SAML IdP Initiated SSO**: Enable and set URL name to `self-sso-idp-alias`

7. Go to **Mappers** → **Create**
   - Name: `NameID = Username`
   - Mapper Type: `User Property`
   - Property: `username`
   - NameID Format: `persistent`
   - Save

## Step 3: Configure Authentication Flow in SP Realm

1. Switch to **consortium** realm
2. Go to **Authentication** → **Flows**
3. Click **Create flow**
   - Name: `Detect and set existing user`
   - Type: `Generic`
   - Click **Create**

4. Add authenticator to the flow:
   - Click your new flow
   - Add execution → Choose `Identity Provider Redirector`
   - Set as "Required"
   - Configure: Set `Alias` = `self-sso-idp-alias`

## Step 4: Set Up SAML Broker in Service Provider

1. Stay in **consortium** realm
2. Go to **Identity Providers** → **Create a new provider**
3. Select **SAML v2.0**
4. Configure:
   - **Alias**: `self-sso-idp-alias`
   - **Display name**: `Self SSO Login for FOLIO`
   - **Sync Mode**: `IMPORT`
   - **Trust Email**: OFF
   - **Store Tokens**: ON
   - **Add Extension to Token**: ON *(optional)*

5. Go to **SAML Configuration**:
   - **Service Provider Entity ID**: `https://keycloak.example.com/realms/consortium`
   - **Service Provider Assertion Consumer Service URL**: (will be auto-filled)
   - **Service Provider Logout Service URL**: (will be auto-filled)
   - **Signing Certificates**: (auto-generated)

6. Go to **Identity Provider Entity ID** (IdP Configuration)
   - You need the metadata from your IdP realm
   - Get metadata from IdP at: `https://keycloak.example.com/realms/self-saml-idp-realm/protocol/saml/descriptor`
   - Import or manually configure

## Step 5: Create Test Users (Optional)

### In IdP Realm (self-saml-idp-realm):

1. Click on your realm name (top-left) → select `self-saml-idp-realm`
2. Go to **Users** → **Create new user**
3. Username: `idp-user`
4. Email: `idp-user@example.com`
5. First Name: `IDP`
6. Last Name: `User`
7. Click **Create**
8. Go to **Credentials** tab
9. Set password: Click "Set Password"
   - Enter password: `password123`
   - Temporary: OFF
   - Click **Set Password**

### In SP Realm (consortium):

Repeat the same process but with username `sp-user`

## Step 6: Test the Setup

1. Go to SP realm's login page:
   ```
   https://keycloak.example.com/realms/consortium/account/
   ```

2. You should see a button "Self SSO Login for FOLIO"
3. Click the button
4. You'll be redirected to the IdP login page
5. Log in with IdP user credentials (e.g., `idp-user` / `password123`)
6. You should be logged in to the SP realm

## Step 7: Troubleshooting

### "Identity Provider Response Error"

- Check SAML metadata URL matches
- Verify Assertion Consumer Service URL
- Check certificate configuration

### "Invalid SAML Request"

- Verify client SAML settings
- Check binding settings (Force POST Binding should be ON)
- Inspect browser dev tools for error details

### "User Not Found in SP"

- Configure User Federation or Broker Link conditions
- Check role and group mappings
- Verify "Sync Mode" is set correctly

### "SAML Assertion Signature Invalid"

- Verify signatures are disabled for testing (Step 2)
- Or ensure proper certificate setup if signatures are enabled

## Verification Checklist

- [ ] IdP realm created
- [ ] SAML client created in IdP realm
- [ ] Authentication flow configured in SP realm
- [ ] SAML broker configured in SP realm
- [ ] SAML metadata properly linked
- [ ] Test users created in both realms
- [ ] Login flow works end-to-end

## Next Steps

- Review [Configuration Options](./configuration.md)
- Check [Troubleshooting Guide](./remote-setup.md#troubleshooting)
- Use the automated script for future setups

## Additional Resources

- [Keycloak SAML Adapter Documentation](https://www.keycloak.org/docs/latest/server_admin/index.html#_saml)
- [SAML 2.0 Specification](https://en.wikipedia.org/wiki/SAML_2.0)
- [Keycloak Identity Brokers](https://www.keycloak.org/docs/latest/server_admin/index.html#_identity_broker)
