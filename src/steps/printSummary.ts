import pc from 'picocolors';
import type { SetupContext } from './types.js';

export function printSummary(
  ctx: SetupContext,
  brokerAlias: string,
  authFlowAlias: string,
  testUserName?: string
): void {
  const { idpRealm, spRealm } = ctx;

  console.log('\n' + pc.bold(pc.green('🎉 === SETUP COMPLETED SUCCESSFULLY ===')));
  console.log(pc.cyan(`   IdP Realm     → ${idpRealm}`));
  console.log(pc.cyan(`   SP Realm      → ${spRealm}`));
  console.log(pc.cyan(`   Broker Alias  → ${brokerAlias}`));
  console.log(pc.cyan(`   Auth Flow     → ${authFlowAlias}`));
  
  if (testUserName) {
    console.log(pc.cyan(`   Test User     → "${testUserName}" (mirrored in IdP)`));
  }
  
  console.log(pc.green('\n   Ready to test "Self SSO Login" button.\n'));
}
