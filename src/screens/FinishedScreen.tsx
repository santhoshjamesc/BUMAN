import { StyleSheet } from 'react-native';

import { AnimatedText } from '../components/AnimatedText';
import { Screen } from '../components/Screen';

interface FinishedScreenProps {
  name: string;
  /** Number of dares this user completed (all that suited them). */
  total: number;
}

/** Shown once every dare has been completed. */
export function FinishedScreen({ name, total }: FinishedScreenProps) {
  return (
    <Screen style={styles.center}>
      <AnimatedText variant="display" style={styles.text}>
        {`${total} dares, ${name}.`}
      </AnimatedText>
      <AnimatedText variant="body" muted delay={900} style={[styles.text, styles.spaced]}>
        Every single one. You kept showing up.
      </AnimatedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  text: { textAlign: 'center' },
  spaced: { marginTop: 24 },
});
