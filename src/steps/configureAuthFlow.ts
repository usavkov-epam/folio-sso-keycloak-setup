import pc from 'picocolors';
import type { SetupContext } from './types.js';

export async function configureAuthFlow(
  ctx: SetupContext,
  authFlowConfig: any
): Promise<void> {
  const { kc, spRealm } = ctx;

  console.log(pc.blue('🔐 Configuring authorization flows...'));
  try {
    await kc.authenticationManagement.createFlow({
      realm: spRealm,
      ...authFlowConfig,
    });
    console.log(pc.green(`✅ Authentication flow "${authFlowConfig.alias}" created`));
  } catch (e: any) {
    if (e.response?.status === 409) {
      const existingFlows = await kc.authenticationManagement.getFlows({ realm: spRealm });
      const existing = existingFlows.find(f => f.alias === authFlowConfig.alias);

      if (existing?.id) {
        await kc.authenticationManagement.updateFlow({
          realm: spRealm,
          flowId: existing.id,
        }, authFlowConfig);
        console.log(pc.green(`✅ Authentication flow "${authFlowConfig.alias}" updated`));
      }
    } else throw e;
  }
}
