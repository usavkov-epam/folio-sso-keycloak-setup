import pc from 'picocolors';
import type { SetupContext } from './types.js';

export async function createSamlClient(
  ctx: SetupContext,
  idpClientConfig: any
): Promise<void> {
  const { kc, idpRealm } = ctx;

  console.log(pc.blue('🔗 Setting up SAML Client in Identity Provider realm...'));
  try {
    await kc.clients.create({
      realm: idpRealm,
      ...idpClientConfig,
    });
    console.log(pc.green('✅ SAML Client created'));
  } catch (e: any) {
    if (e.response?.status === 409) {
      const existing = await kc.clients.find({
        realm: idpRealm,
        clientId: idpClientConfig.clientId,
      });
      if (existing[0]?.id) {
        await kc.clients.update({
          realm: idpRealm,
          id: existing[0].id,
        }, idpClientConfig);
        console.log(pc.green('✅ SAML Client updated'));
      }
    } else throw e;
  }
}
