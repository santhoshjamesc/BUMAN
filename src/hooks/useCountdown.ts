import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { SECOND_MS } from '../logic/time';

/**
 * Live remaining time until `target` (epoch ms), always derived from
 * `target - Date.now()` so it stays correct across restarts and backgrounding.
 * Ticks are aligned to whole-second boundaries of the target.
 */
export function useCountdown(target: number): number {
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const ms = target - Date.now();
      setRemaining(ms);
      if (ms <= 0) return;
      // Wake just after the next displayed second flips.
      const untilNextSecond = ms % SECOND_MS || SECOND_MS;
      timer = setTimeout(tick, untilNextSecond + 10);
    };

    tick();

    // Timers pause in the background; recompute the moment we return.
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        clearTimeout(timer);
        tick();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [target]);

  return remaining;
}
