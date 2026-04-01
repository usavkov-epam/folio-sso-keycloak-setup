import pc from 'picocolors';
import type { SetupContext } from './types.js';

export async function createSamlBroker(
  ctx: SetupContext,
  brokerPayload: any
): Promise<void> {
  const { kc, spRealm } = ctx;

  console.log(pc.blue('🔗 Setting up SAML Broker...'));
  try {
    await kc.identityProviders.create({
      realm: spRealm,
      ...brokerPayload,
    });
    console.log(pc.green('✅ SAML Broker created'));
  } catch (e: any) {
    if (e.response?.status === 409) {
      await kc.identityProviders.update({
        realm: spRealm,
        alias: brokerPayload.alias,
      }, brokerPayload);
      console.log(pc.green('✅ SAML Broker updated'));
    } else throw e;
  }
}
