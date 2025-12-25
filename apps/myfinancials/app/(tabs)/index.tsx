import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { SharedButton } from '@mysuite/ui';

export default function HomeScreen() {
  return (
    <View className="bg-light dark:bg-dark" style={styles.container}>
      <ThemedText type="title">Tab One</ThemedText>
      <SharedButton title="This is a v4 NativeWind button!" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
