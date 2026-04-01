import pc from 'picocolors';
import type { SetupContext, AuthenticationFlow, AuthenticationExecution } from './types.js';

export async function configureAuthFlow(
  ctx: SetupContext,
  authFlowConfig: AuthenticationFlow,
  authenticationExecutions?: AuthenticationExecution[]
): Promise<void> {
  const { kc, spRealm } = ctx;

  console.log(pc.blue('🔐 Configuring authorization flows...'));
  
  try {
    // Create flow
    await kc.authenticationManagement.createFlow({
      realm: spRealm,
      ...authFlowConfig,
    });
    console.log(pc.green(`✅ Authentication flow "${authFlowConfig.alias}" created`));
  } catch (e: any) {
    if (e.response?.status === 409) {
      console.log(pc.blue(`ℹ️ Flow "${authFlowConfig.alias}" already exists`));
    } else throw e;
  }

  // Add authentication executions if provided
  if (authenticationExecutions && authenticationExecutions.length > 0) {
    console.log(pc.blue(`📋 Adding ${authenticationExecutions.length} authentication execution(s)...`));
    
    for (const execution of authenticationExecutions) {
      try {
        // Add execution to flow
        const result = await kc.authenticationManagement.addExecutionToFlow({
          realm: spRealm,
          flow: authFlowConfig.alias,
          provider: execution.authenticator,
        });
        
        // Get the execution ID from the response or fetch executions
        if (result?.id) {
          // Update execution with requirements and config
          await kc.authenticationManagement.updateExecution(
            {
              realm: spRealm,
              flow: authFlowConfig.alias,
            },
            {
              id: result.id,
              requirement: execution.requirement,
            }
          );
        }
        
        console.log(pc.green(`✅ Added execution: ${execution.authenticator} (${execution.requirement})`));
      } catch (e: any) {
        if (e.response?.status === 409 || e.message?.includes('already exists')) {
          console.log(pc.blue(`ℹ️ Execution "${execution.authenticator}" already exists`));
        } else throw e;
      }
    }
  }
}
