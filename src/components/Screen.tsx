import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, useScale } from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Content pinned to the bottom (e.g. the main button). */
  footer?: React.ReactNode;
  style?: ViewStyle;
  /** White canvas instead of black. */
  inverted?: boolean;
}

/** Full-bleed black canvas with generous, responsive margins. */
export function Screen({ children, footer, style, inverted = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { gutter, height } = useScale();
  const vertical = Math.round(height * 0.06);

  return (
    <View
      style={[
        styles.root,
        inverted && styles.inverted,
        {
          paddingTop: insets.top + vertical,
          paddingBottom: insets.bottom + vertical,
          paddingHorizontal: gutter,
        },
      ]}
    >
      <View style={[styles.content, style]}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  inverted: { backgroundColor: colors.inverse.background },
  content: { flex: 1, justifyContent: 'center' },
  footer: { alignItems: 'center' },
});
