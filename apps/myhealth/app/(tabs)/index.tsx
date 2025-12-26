import { View, ScrollView } from 'react-native';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { QuickStartAction } from '../../components/dashboard/QuickStartAction';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-light dark:bg-dark">
          <ScreenHeader title="Home" />
          <ScrollView className='mt-4'>
             <QuickStartAction />
          </ScrollView>
    </View>
  );
}