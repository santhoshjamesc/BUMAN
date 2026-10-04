import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FadeSwitch } from './src/components/FadeSwitch';
import { useBuman } from './src/hooks/useBuman';
import { ComplimentScreen } from './src/screens/ComplimentScreen';
import { CountdownScreen } from './src/screens/CountdownScreen';
import { DareScreen } from './src/screens/DareScreen';
import { FinishedScreen } from './src/screens/FinishedScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { colors } from './src/theme';

function Root() {
  const {
    phase,
    completeOnboarding,
    completeDare,
    dismissCompliment,
    dismissProgress,
    unlockNextDare,
  } = useBuman();
  const [splashDone, setSplashDone] = useState(false);

  // The splash plays in full, and keeps showing until saved state has loaded.
  const showSplash = !splashDone || phase.name === 'loading';

  // Keyed per dare so a newly unlocked dare re-runs its entrance animation.
  const key = showSplash ? 'splash' : phase.name === 'dare' ? `dare:${phase.dare.id}` : phase.name;

  return (
    <FadeSwitch transitionKey={key}>
      {showSplash ? (
        <SplashScreen onFinish={() => setSplashDone(true)} />
      ) : (
        <>
          {phase.name === 'onboarding' && <OnboardingScreen onComplete={completeOnboarding} />}
          {phase.name === 'dare' && (
            <DareScreen dare={phase.dare} name={phase.profile.name} onComplete={completeDare} />
          )}
          {phase.name === 'compliment' && (
            <ComplimentScreen compliment={phase.compliment} onDone={dismissCompliment} />
          )}
          {phase.name === 'progress' && (
            <ProgressScreen completed={phase.completed} from={phase.from} onDone={dismissProgress} />
          )}
          {phase.name === 'countdown' && (
            <CountdownScreen
              nextDareAvailableAt={phase.nextDareAvailableAt}
              onUnlock={unlockNextDare}
            />
          )}
          {phase.name === 'finished' && (
            <FinishedScreen name={phase.profile.name} total={phase.total} />
          )}
        </>
      )}
    </FadeSwitch>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <Root />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
