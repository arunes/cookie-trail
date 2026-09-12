import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast, { type ToastConfig } from 'react-native-toast-message';

const toastConfig: ToastConfig = {
  event: ({ text1, text2 }) => (
    <View style={styles.container}>
      <Text style={styles.check}>✓</Text>

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
    backgroundColor: '#fffdfb',
    borderWidth: 1,
    borderColor: '#e8e2dc',
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
    color: '#6f9f78',
    fontSize: 15,
    fontWeight: '700',
  },

  primary: {
    color: '#211914',
    fontSize: 13,
    fontWeight: '600',
  },

  time: {
    color: '#9b948e',
    fontWeight: '500',
  },
});