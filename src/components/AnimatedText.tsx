import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, type StyleProp, type TextStyle } from 'react-native';

import { colors, typography, useScale, type TypographyVariant } from '../theme';

interface AnimatedTextProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  /** Use dimmed secondary color. */
  muted?: boolean;
  /** Black text for the inverted (white) screen. */
  inverted?: boolean;
  /** Delay (ms) before the fade/slide entrance. */
  delay?: number;
  /** Subtle, organic wiggle while visible. */
  wiggle?: boolean;
  /** Multiplier for wiggle amplitude (1 = ±1°). */
  intensity?: number;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

const ENTRANCE_MS = 900;

/**
 * Text that fades and slides in, then gently wiggles (0° → -1° → 1° → 0°)
 * with a tiny breath of scale. Each instance gets randomized timing so
 * multiple lines never move in lockstep.
 */
export function AnimatedText({
  children,
  variant = 'body',
  muted = false,
  inverted = false,
  delay = 0,
  wiggle = true,
  intensity = 1,
  style,
  numberOfLines,
}: AnimatedTextProps) {
  const { s } = useScale();
  const entrance = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  // Randomized once per mount so motion feels organic rather than mechanical.
  const timing = useMemo(
    () => ({
      cycle: 3200 + Math.random() * 1800,
      rest: 1400 + Math.random() * 2200,
      start: Math.random() * 1200,
    }),
    [],
  );

  useEffect(() => {
    const enter = Animated.timing(entrance, {
      toValue: 1,
      duration: ENTRANCE_MS,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const step = (toValue: number, fraction: number) =>
      Animated.timing(sway, {
        toValue,
        duration: timing.cycle * fraction,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      });

    const wiggleLoop = Animated.loop(
      Animated.sequence([
        step(-1, 0.3),
        step(1, 0.4),
        step(0, 0.3),
        Animated.delay(timing.rest),
      ]),
    );

    const animation = wiggle
      ? Animated.sequence([enter, Animated.delay(timing.start), wiggleLoop])
      : enter;
    animation.start();
    return () => animation.stop();
  }, [delay, wiggle, entrance, sway, timing]);

  const amplitude = intensity;
  const base = typography[variant];

  const animatedStyle = {
    opacity: entrance,
    transform: [
      { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
      {
        rotate: sway.interpolate({
          inputRange: [-1, 1],
          outputRange: [`${-amplitude}deg`, `${amplitude}deg`],
        }),
      },
      {
        scale: sway.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [1 + 0.008 * amplitude, 1, 1 + 0.012 * amplitude],
        }),
      },
      {
        translateX: sway.interpolate({
          inputRange: [-1, 1],
          outputRange: [-0.6 * amplitude, 0.6 * amplitude],
        }),
      },
    ],
  };

  return (
    <Animated.Text
      numberOfLines={numberOfLines}
      allowFontScaling
      maxFontSizeMultiplier={1.3}
      style={[
        {
          ...base,
          fontSize: s(base.fontSize),
          lineHeight: s(base.lineHeight),
          color: inverted
            ? muted
              ? colors.inverse.textSecondary
              : colors.inverse.text
            : muted
              ? colors.textSecondary
              : colors.text,
        },
        style,
        animatedStyle,
      ]}
    >
      {children}
    </Animated.Text>
  );
}
