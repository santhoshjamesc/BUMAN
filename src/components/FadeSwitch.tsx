import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

interface FadeSwitchProps {
  /** When this changes, the old content fades out before the new content mounts and fades in. */
  transitionKey: string;
  children: React.ReactNode;
  duration?: number;
}

export function FadeSwitch({ transitionKey, children, duration = 420 }: FadeSwitchProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [shownKey, setShownKey] = useState(transitionKey);
  const shownChildren = useRef(children);

  // While the outgoing screen fades, keep rendering its last content.
  if (transitionKey === shownKey) shownChildren.current = children;

  useEffect(() => {
    if (transitionKey === shownKey) return;
    let cancelled = false;
    Animated.timing(opacity, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (!cancelled) setShownKey(transitionKey);
    });
    return () => {
      cancelled = true;
    };
  }, [transitionKey, shownKey, opacity, duration]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [shownKey, opacity, duration]);

  return (
    <Animated.View key={shownKey} style={[styles.fill, { opacity }]}>
      {shownChildren.current}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
