import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';

import { colors, typography, useScale } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Delay (ms) before the button fades in. */
  delay?: number;
}

/** Minimal hairline pill with a soft press-in scale. */
export function PrimaryButton({ label, onPress, disabled = false, delay = 0 }: PrimaryButtonProps) {
  const { s } = useScale();
  const appear = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 900,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear, delay]);

  const animatePress = (toValue: number) =>
    Animated.spring(press, { toValue, speed: 40, bounciness: 4, useNativeDriver: true }).start();

  return (
    <Animated.View
      style={{
        opacity: Animated.multiply(appear, disabled ? 0.35 : 1),
        transform: [
          { scale: press },
          { translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
        ],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animatePress(0.96)}
        onPressOut={() => animatePress(1)}
        hitSlop={12}
        style={[styles.button, { paddingVertical: s(18), paddingHorizontal: s(44) }]}
      >
        <Animated.Text style={[styles.label, { fontSize: s(typography.label.fontSize + 1) }]}>
          {label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.hairline,
  },
  label: {
    ...typography.label,
    color: colors.text,
    textAlign: 'center',
  },
});
