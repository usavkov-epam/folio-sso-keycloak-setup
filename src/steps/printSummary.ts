import pc from 'picocolors';
import type { SetupContext } from './types.js';

export function printSummary(
  ctx: SetupContext,
  brokerAlias: string,
  authFlowAlias: string,
  testUsers: any[]
): void {
  const { idpRealm, spRealm } = ctx;

  console.log('\n' + pc.bold(pc.green('🎉 === SETUP COMPLETED SUCCESSFULLY ===')));
  console.log(pc.cyan(`   IdP Realm     → ${idpRealm}`));
  console.log(pc.cyan(`   SP Realm      → ${spRealm}`));
  console.log(pc.cyan(`   Broker Alias  → ${brokerAlias}`));
  console.log(pc.cyan(`   Auth Flow     → ${authFlowAlias}`));
  console.log(pc.cyan(`   Test Users    → ${testUsers[0].username} (IdP), ${testUsers[1].username} (SP)`));
  console.log(pc.green('\n   Ready to test "Self SSO Login" button.\n'));
}
