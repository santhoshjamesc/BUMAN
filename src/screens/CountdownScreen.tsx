import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { AnimatedText } from '../components/AnimatedText';
import { Screen } from '../components/Screen';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown } from '../logic/time';

interface CountdownScreenProps {
  nextDareAvailableAt: number;
  onUnlock: () => void;
}

export function CountdownScreen({ nextDareAvailableAt, onUnlock }: CountdownScreenProps) {
  const remaining = useCountdown(nextDareAvailableAt);
  const unlocked = useRef(false);

  useEffect(() => {
    if (remaining <= 0 && !unlocked.current) {
      unlocked.current = true;
      onUnlock();
    }
  }, [remaining, onUnlock]);

  return (
    <Screen style={styles.center}>
      <AnimatedText variant="body" muted style={styles.text}>
        You already showed up today.
      </AnimatedText>

      <AnimatedText variant="label" muted wiggle={false} delay={500} style={styles.label}>
        NEXT DARE IN
      </AnimatedText>

      <AnimatedText variant="timer" delay={800} intensity={0.5} style={styles.timer}>
        {formatCountdown(remaining)}
      </AnimatedText>

      <AnimatedText variant="body" muted delay={1400} style={[styles.text, styles.footer]}>
        Take your time.
      </AnimatedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  text: { textAlign: 'center' },
  label: { marginTop: 48, marginBottom: 12, textAlign: 'center' },
  timer: { textAlign: 'center', fontVariant: ['tabular-nums'] },
  footer: { marginTop: 40 },
});
