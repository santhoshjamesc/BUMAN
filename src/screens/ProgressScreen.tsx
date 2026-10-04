import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AnimatedText } from '../components/AnimatedText';
import { BodyFill } from '../components/BodyFill';
import { Screen } from '../components/Screen';
import { BUMAN_GOAL } from '../logic/progress';
import { useScale } from '../theme';

const FILL_DELAY_MS = 700;
const FILL_MS = 2600;
const AUTO_ADVANCE_MS = 6500;

interface ProgressScreenProps {
  /** Dares completed so far. */
  completed: number;
  /** Count the liquid rises from (the previous total right after a dare, otherwise 0). */
  from: number;
  onDone: () => void;
}

/**
 * Black-on-white interlude before the timer: a body filling with black
 * liquid, one dare at a time, until it is full and the user is BUMAN.
 */
export function ProgressScreen({ completed, from, onDone }: ProgressScreenProps) {
  const { width, height, s } = useScale();
  const isBuman = completed >= BUMAN_GOAL;
  const toLevel = Math.min(completed / BUMAN_GOAL, 1);
  const fromLevel = Math.min(Math.max(from, 0) / BUMAN_GOAL, toLevel);
  // Fit the figure to whichever dimension is tighter.
  const bodyWidth = Math.min(width * 0.42, height * 0.2, s(190));

  useEffect(() => {
    const timer = setTimeout(onDone, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <Pressable style={styles.fill} onPress={onDone} accessibilityHint="Continue">
      <StatusBar style="dark" />
      <Screen inverted style={styles.center}>
        <AnimatedText inverted variant="label" muted wiggle={false} style={styles.text}>
          {isBuman ? 'YOU ARE' : 'BECOMING BUMAN'}
        </AnimatedText>

        <BodyFill
          width={bodyWidth}
          from={fromLevel}
          to={toLevel}
          delay={FILL_DELAY_MS}
          duration={FILL_MS}
        />

        <AnimatedText
          inverted
          variant="timer"
          delay={FILL_DELAY_MS + FILL_MS - 400}
          intensity={0.5}
          style={[styles.text, styles.count]}
        >
          {isBuman ? 'BUMAN' : `${completed} / ${BUMAN_GOAL}`}
        </AnimatedText>
      </Screen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', gap: 28 },
  text: { textAlign: 'center' },
  count: { fontVariant: ['tabular-nums'] },
});
