import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BODY_BOTTOM, BODY_HEIGHT, BODY_PATH, BODY_TOP, BODY_WIDTH } from '../logic/bodyPath';
import { colors } from '../theme';

interface BodyFillProps {
  /** Rendered width; height follows the body's proportions. */
  width: number;
  /** Fill level (0–1) the liquid starts at. */
  from: number;
  /** Fill level (0–1) the liquid rises to. */
  to: number;
  /** Delay (ms) before the liquid starts rising. */
  delay?: number;
  duration?: number;
}

const WAVE_HEIGHT = 14;
const WAVE_AMPLITUDE = 4;
const WAVES_PER_WIDTH = 4;
/** How choppy the surface is while pouring vs. once it settles (scale of the wave height). */
const CHOPPY = 1;
/** Horizontal margin (body units) around the silhouette's widest point, the hands. */
const BODY_INSET = 24;
const CALM = 0.5;

/** Bubbles as [x in body units, size px, rise ms, start delay ms]; x values sit inside the torso and legs. */
const BUBBLES: readonly (readonly [number, number, number, number])[] = [
  [100, 4, 3400, 0],
  [121, 3, 2900, 900],
  [79, 3, 3100, 1500],
  [92, 2, 2600, 400],
  [110, 5, 3800, 2100],
  [124, 2, 2700, 2700],
  [76, 4, 3600, 600],
  [104, 2, 2400, 1800],
];

/** A repeating sine-like wave, two body-widths wide so it can scroll seamlessly. */
function wavePath(width: number) {
  const half = width / WAVES_PER_WIDTH / 2;
  const mid = WAVE_HEIGHT / 2;
  let d = `M0 ${mid} Q${half / 2} ${mid - WAVE_AMPLITUDE} ${half} ${mid}`;
  for (let x = half * 2; x <= width * 2 + 0.5; x += half) d += ` T${x} ${mid}`;
  return `${d} L${width * 2} ${WAVE_HEIGHT} L0 ${WAVE_HEIGHT} Z`;
}

const loop = (value: Animated.Value, duration: number) =>
  Animated.loop(
    Animated.timing(value, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  );

interface WaveProps {
  width: number;
  drift: Animated.Value;
  agitation: Animated.Value;
  /** Scroll right-to-left (true) or left-to-right. */
  leftward: boolean;
  opacity: number;
  /** Raise this wave above the base surface (px). */
  lift?: number;
}

function Wave({ width, drift, agitation, leftward, opacity, lift = 0 }: WaveProps) {
  // Scale the wave height around its flat bottom edge so it never detaches from the liquid.
  const scaleY = agitation.interpolate({
    inputRange: [0, 1],
    outputRange: [CALM, CHOPPY],
  });
  const settle = agitation.interpolate({
    inputRange: [0, 1],
    outputRange: [((1 - CALM) * WAVE_HEIGHT) / 2, ((1 - CHOPPY) * WAVE_HEIGHT) / 2],
  });
  return (
    <Animated.View
      style={[
        styles.wave,
        {
          width: width * 2,
          top: -lift,
          opacity,
          transform: [
            { translateY: settle },
            { scaleY },
            {
              translateX: drift.interpolate({
                inputRange: [0, 1],
                outputRange: leftward ? [0, -width] : [-width, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Svg width={width * 2} height={WAVE_HEIGHT}>
        <Path d={wavePath(width)} fill={colors.inverse.text} />
      </Svg>
    </Animated.View>
  );
}

interface BubbleProps {
  x: number;
  size: number;
  duration: number;
  delay: number;
  /** Distance (px) from the bottom of the body to just under the surface. */
  travel: number;
}

/** A small light bubble drifting up through the liquid, wobbling sideways and fading at the surface. */
function Bubble({ x, size, duration, delay, travel }: BubbleProps) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.timing(t, {
          toValue: 1,
          duration,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ),
    ]);
    animation.start();
    return () => animation.stop();
  }, [t, delay, duration]);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: x - size / 2,
          top: WAVE_HEIGHT + travel,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: t.interpolate({
            inputRange: [0, 0.15, 0.85, 1],
            outputRange: [0, 0.55, 0.55, 0],
          }),
          transform: [
            {
              translateY: t.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -travel],
              }),
            },
            {
              translateX: t.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0, 2, 0, -2, 0],
              }),
            },
          ],
        },
      ]}
    />
  );
}

/**
 * A human silhouette on white that fills with black liquid, bottom-up.
 * The liquid sits behind a white stencil with a body-shaped hole, so it is
 * only ever visible inside the body. The surface is choppy while pouring,
 * then calms to a gentle bob.
 */
export function BodyFill({ width, from, to, delay = 0, duration = 2400 }: BodyFillProps) {
  const height = (width * BODY_HEIGHT) / BODY_WIDTH;
  const scale = width / BODY_WIDTH;
  const level = useRef(new Animated.Value(from)).current;
  const front = useRef(new Animated.Value(0)).current;
  const back = useRef(new Animated.Value(0)).current;
  const agitation = useRef(new Animated.Value(CALM)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pour = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(level, {
          toValue: to,
          duration,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(agitation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(duration - 500, 0)),
          Animated.timing(agitation, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);
    const swell = (toValue: number) =>
      Animated.timing(bob, {
        toValue,
        duration: 1300,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      });
    const animations = [
      pour,
      loop(front, 2200),
      loop(back, 3400),
      Animated.loop(Animated.sequence([swell(1), swell(-1)])),
    ];
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [level, front, back, agitation, bob, to, delay, duration]);

  // 0 = surface just below the feet, 1 = waves fully above the head.
  const surfaceY = Animated.add(
    level.interpolate({
      inputRange: [0, 1],
      outputRange: [BODY_BOTTOM * scale, BODY_TOP * scale - WAVE_HEIGHT * 2],
      extrapolate: 'clamp',
    }),
    bob.interpolate({ inputRange: [-1, 1], outputRange: [-1.5, 1.5] }),
  );

  const toPx = (units: number) => units * scale;
  const travel = height - WAVE_HEIGHT;
  // The liquid is kept off the frame's edges, where the stencil can leave a hairline seam.
  const inset = toPx(BODY_INSET);

  return (
    <View style={[styles.frame, { width, height }]}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${BODY_WIDTH} ${BODY_HEIGHT}`}
        style={StyleSheet.absoluteFill}
      >
        <Path d={BODY_PATH} fill={colors.inverse.ghost} />
      </Svg>

      <View
        style={[
          styles.tank,
          {
            left: inset,
            right: inset,
            bottom: toPx(BODY_HEIGHT - BODY_BOTTOM),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.liquid,
            {
              height: height + WAVE_HEIGHT * 2,
              transform: [{ translateY: surfaceY }],
            },
          ]}
        >
          <Wave
            width={width}
            drift={back}
            agitation={agitation}
            leftward={false}
            opacity={0.3}
            lift={3}
          />
          <Wave width={width} drift={front} agitation={agitation} leftward opacity={1} />
          <View style={[styles.body, { top: WAVE_HEIGHT - 0.5 }]} />
          {BUBBLES.map(([x, size, rise, wait], i) => (
            <Bubble
              key={i}
              x={toPx(x) - inset}
              size={size}
              duration={rise}
              delay={wait}
              travel={travel}
            />
          ))}
        </Animated.View>
      </View>

      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${BODY_WIDTH} ${BODY_HEIGHT}`}
        style={StyleSheet.absoluteFill}
      >
        <Path
          d={`M-1 -1H${BODY_WIDTH + 1}V${BODY_HEIGHT + 1}H-1Z ${BODY_PATH}`}
          fill={colors.inverse.background}
          fillRule="evenodd"
        />
        <Path d={BODY_PATH} fill="none" stroke={colors.inverse.outline} strokeWidth={1} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: colors.inverse.background },
  tank: { position: 'absolute', top: 0, overflow: 'hidden' },
  liquid: { position: 'absolute', left: 0, top: 0, width: '100%' },
  wave: { position: 'absolute', left: 0, height: WAVE_HEIGHT },
  body: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.inverse.text,
  },
  bubble: { position: 'absolute', backgroundColor: colors.inverse.background },
});
