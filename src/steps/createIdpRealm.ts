import pc from 'picocolors';
import type { SetupContext } from './types.js';

export async function createIdpRealm(ctx: SetupContext): Promise<void> {
  const { kc, idpRealm } = ctx;

  console.log(pc.blue(`🌍 Processing IdP Realm: ${idpRealm}`));
  try {
    await kc.realms.create({
      realm: idpRealm,
      enabled: true,
    });
    console.log(pc.green(`✅ Realm ${idpRealm} created`));
  } catch (e: any) {
    if (e.response?.status === 409) {
      console.log(pc.blue(`ℹ️ Realm ${idpRealm} already exists`));
    } else throw e;
  }
}
