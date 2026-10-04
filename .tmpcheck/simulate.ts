import { ALL_DARES, DARES_BY_ID } from '../src/data/dares';
import {
  countEligible,
  isEligible,
  removeFromPools,
  selectNextDare,
} from '../src/logic/dareEngine';
import type { Gender, UserProfile } from '../src/storage/types';
import type { DarePools } from '../src/storage/types';

const ages = [15, 28, 55];
const genders: Gender[] = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];
let ok = true;

for (const age of ages) {
  for (const gender of genders) {
    const profile: UserProfile = { name: 'T', age, gender };
    const total = countEligible(profile);
    const completed: string[] = [];
    let pools: DarePools = {};
    let t = new Date('2026-10-04T08:00:00').getTime();
    for (;;) {
      const sel = selectNextDare(completed, pools, profile, t);
      if (!sel) break;
      const dare = DARES_BY_ID.get(sel.dareId)!;
      if (!isEligible(dare, profile)) { ok = false; console.log('INELIGIBLE', age, gender, dare.id); }
      if (completed.includes(sel.dareId)) { ok = false; console.log('REPEAT', age, gender, dare.id); }
      completed.push(sel.dareId);
      pools = removeFromPools(sel.pools, sel.dareId);
      t += 24 * 3600e3 + Math.floor(Math.random() * 10 * 3600e3);
    }
    const okCount = completed.length === total;
    if (!okCount) ok = false;
    console.log(`${String(age).padEnd(3)} ${gender.padEnd(18)} eligible=${total} completed=${completed.length} ${okCount ? 'ok' : 'MISMATCH'}`);
  }
}
console.log('total dares', ALL_DARES.length);
console.log(ok ? 'SIMULATION PASSED' : 'SIMULATION FAILED');
