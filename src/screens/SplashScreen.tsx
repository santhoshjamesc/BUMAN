import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { Screen } from '../components/Screen';
import { colors, typography, useScale } from '../theme';

interface SplashScreenProps {
  /** Called once the BEAUTIFUL HUMAN → BUMAN sequence has played. */
  onFinish: () => void;
}

/**
 * "BEAUTIFUL HUMAN" is split so the kept letters (B + UMAN) slide together
 * while the rest folds into the gap between them.
 */
const SEGMENTS = [
  { text: 'B', keep: true },
  { text: 'EAUTIFUL', keep: false },
  { text: ' ', keep: false },
  { text: 'H', keep: false },
  { text: 'UMAN', keep: true },
] as const;

type Frame = { x: number; width: number };

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { s } = useScale();
  const [frames, setFrames] = useState<(Frame | undefined)[]>([]);
  const measured = SEGMENTS.every((_, i) => frames[i]);

  const entrance = useRef(new Animated.Value(0)).current;
  const collapse = useRef(new Animated.Value(0)).current;
  const settle = useRef(new Animated.Value(0)).current;

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (!measured) return;
    const animation = Animated.sequence([
      Animated.timing(entrance, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(900),
      Animated.timing(collapse, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(settle, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(1000),
    ]);
    animation.start(({ finished }) => {
      if (finished) onFinishRef.current();
    });
    return () => animation.stop();
  }, [measured, entrance, collapse, settle]);

  const onSegmentLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setFrames((prev) => {
      const next = [...prev];
      next[index] = { x, width };
      return next;
    });
  };

  // Gap between the end of "B" and the start of "UMAN"; the word closes it from both sides.
  const first = frames[0];
  const last = frames[SEGMENTS.length - 1];
  const gap = first && last ? last.x - (first.x + first.width) : 0;
  const gapCenter = first ? first.x + first.width + gap / 2 : 0;

  const segmentStyle = (index: number) => {
    const frame = frames[index];
    if (!frame) return null;
    const { keep } = SEGMENTS[index];

    if (keep) {
      const shift = index === 0 ? gap / 2 : -gap / 2;
      return {
        transform: [
          { translateX: collapse.interpolate({ inputRange: [0, 1], outputRange: [0, shift] }) },
        ],
      };
    }

    // Folding letters drift into the gap's center and squeeze to nothing.
    const center = frame.x + frame.width / 2;
    return {
      opacity: collapse.interpolate({ inputRange: [0, 0.55], outputRange: [1, 0], extrapolate: 'clamp' }),
      transform: [
        {
          translateX: collapse.interpolate({ inputRange: [0, 1], outputRange: [0, gapCenter - center] }),
        },
        { scaleX: collapse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.01] }) },
      ],
    };
  };

  const letterSpacing = s(5);
  const textStyle = {
    ...typography.title,
    fontSize: s(26),
    lineHeight: s(34),
    letterSpacing,
    color: colors.text,
  };

  return (
    <Screen style={styles.center}>
      <Animated.View
        accessible
        accessibilityRole="header"
        accessibilityLabel="Buman. Beautiful human."
        style={{
          opacity: measured ? entrance : 0,
          transform: [
            { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
            { scale: settle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
          ],
        }}
      >
        {/* Leading padding balances the trailing letter-spacing so the word stays optically centered. */}
        <View style={[styles.row, { paddingLeft: letterSpacing }]}>
          {SEGMENTS.map((segment, index) => (
            <Animated.Text
              key={index}
              allowFontScaling={false}
              onLayout={onSegmentLayout(index)}
              style={[textStyle, segmentStyle(index)]}
            >
              {segment.text}
            </Animated.Text>
          ))}
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.hairline,
          {
            width: s(56),
            marginTop: s(28),
            opacity: settle,
            transform: [{ scaleX: settle }],
          },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  row: { flexDirection: 'row' },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline },
});
