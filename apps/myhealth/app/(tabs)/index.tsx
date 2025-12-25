import { View } from 'react-native';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

export default function HomeScreen() {
  return (
    <View className="flex-1 p-4 bg-light dark:bg-dark">
          <ScreenHeader title="Home" />
    </View>
  );
}