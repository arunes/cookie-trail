import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast, { type ToastConfig } from 'react-native-toast-message';

import { colors } from '@/theme/tokens';

const toastConfig: ToastConfig = {
  event: ({ text1, text2, props, hide }) => (
    <View style={styles.container}>
      <Text style={styles.check}>✓</Text>

      <Text style={styles.primary}>
        {text1}
        {text2 ? <Text style={styles.time}>{` · ${text2}`}</Text> : null}
      </Text>

      {typeof props?.onUndo === 'function' && (
        <Pressable
          style={styles.undo}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Undo recorded event"
          onPress={() => {
            hide();
            props.onUndo();
          }}>
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
      )}
    </View>
  ),

  status: ({ text1, text2 }) => (
    <View style={styles.container}>
      <Text style={styles.primary}>
        {text1}
        {text2 ? <Text style={styles.time}>{` · ${text2}`}</Text> : null}
      </Text>
    </View>
  ),
};

export function ToastHost() {
  const insets = useSafeAreaInsets();

  return (
    <Toast
      config={toastConfig}
      position="bottom"
      bottomOffset={insets.bottom + 24}
      visibilityTime={2000}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-raised'],
    borderWidth: 1,
    borderColor: colors['border-strong'],
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,

    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  check: {
    marginRight: 8,
    color: colors.success,
    fontSize: 15,
    fontWeight: '700',
  },

  primary: {
    flexShrink: 1,
    color: colors.foreground,
    fontSize: 13,
    fontWeight: '600',
  },

  time: {
    color: colors['foreground-secondary'],
    fontWeight: '500',
  },

  undo: {
    marginLeft: 10,
  },

  undoText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
});
