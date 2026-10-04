import { StyleSheet } from 'react-native';

import { AnimatedText } from '../components/AnimatedText';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import type { Dare } from '../data/dares';
import { getGreeting } from '../logic/time';

interface DareScreenProps {
  dare: Dare;
  name: string;
  onComplete: () => void;
}

export function DareScreen({ dare, name, onComplete }: DareScreenProps) {
  return (
    <Screen footer={<PrimaryButton label="I DID IT" onPress={onComplete} delay={2200} />}>
      <AnimatedText variant="body" muted>
        {getGreeting(name)}
      </AnimatedText>

      <AnimatedText variant="label" muted wiggle={false} delay={500} style={styles.label}>
        YOUR DARE
      </AnimatedText>

      <AnimatedText variant="display" delay={900} intensity={0.7}>
        {dare.text}
      </AnimatedText>

      <AnimatedText variant="body" muted delay={1600} style={styles.encouragement}>
        You've got this.
      </AnimatedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 48, marginBottom: 16 },
  encouragement: { marginTop: 32 },
});
