import pc from 'picocolors';
import type { SetupContext, AuthenticationFlow, AuthenticationExecution } from './types.js';

export async function configureAuthFlow(
  ctx: SetupContext,
  authFlowConfig: AuthenticationFlow,
  authenticationExecutions?: AuthenticationExecution[]
): Promise<void> {
  const { kc, spRealm } = ctx;

  console.log(pc.blue('🔐 Configuring authorization flows...'));
  
  let flowAlreadyExists = false;

  try {
    // Create flow
    await kc.authenticationManagement.createFlow({
      realm: spRealm,
      ...authFlowConfig,
    });
    console.log(pc.green(`✅ Authentication flow "${authFlowConfig.alias}" created`));
  } catch (e: any) {
    if (e.response?.status === 409) {
      flowAlreadyExists = true;
      console.log(pc.blue(`ℹ️ Flow "${authFlowConfig.alias}" already exists`));
    } else throw e;
  }

  // Only add executions if flow was newly created (not if it already existed)
  if (!flowAlreadyExists && authenticationExecutions && authenticationExecutions.length > 0) {
    console.log(pc.blue(`📋 Adding ${authenticationExecutions.length} authentication execution(s)...`));
    
    for (const execution of authenticationExecutions) {
      try {
        await kc.authenticationManagement.addExecutionToFlow({
          realm: spRealm,
          flow: authFlowConfig.alias,
          provider: execution.authenticator,
        });
        console.log(pc.green(`✅ Added execution: ${execution.authenticator}`));
      } catch (e: any) {
        console.error(pc.red(`❌ Failed to add execution: ${e.message}`));
        throw e;
      }
    }
  } else if (flowAlreadyExists && authenticationExecutions && authenticationExecutions.length > 0) {
    console.log(pc.blue(`ℹ️ Flow already exists, skipping execution configuration`));
    console.log(pc.blue(`💡 To update executions, delete the flow first and re-run setup`));
  }
}
