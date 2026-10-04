import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AnimatedText } from '../components/AnimatedText';
import { Screen } from '../components/Screen';

const AUTO_ADVANCE_MS = 5000;

interface ComplimentScreenProps {
  compliment: string;
  onDone: () => void;
}

/** Shown right after completion. Tap anywhere, or wait, to move on to the countdown. */
export function ComplimentScreen({ compliment, onDone }: ComplimentScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <Pressable style={styles.fill} onPress={onDone} accessibilityHint="Continue">
      <Screen style={styles.center}>
        <AnimatedText variant="display" delay={200} style={styles.text}>
          {compliment}
        </AnimatedText>
      </Screen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center' },
  text: { textAlign: 'center' },
});
