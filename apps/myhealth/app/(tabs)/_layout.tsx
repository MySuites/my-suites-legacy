import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { BottomTabBar, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

import { useNavigationSettings } from '../../providers/NavigationSettingsProvider';
import { IconSymbol } from "@mysuite/ui";
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/ui/use-color-scheme';

// import { ActiveWorkoutHeader } from '../../components/workouts/ActiveWorkoutHeader';
import { ActiveWorkoutOverlay } from '../../components/workouts/ActiveWorkoutOverlay';
// import { GlobalOverlay } from '../../components/ui/GlobalOverlay';
// import { QuickNavigationButton } from '../../components/ui/QuickNavigationMenu';
// import { QuickUtilityButton } from '../../components/ui/QuickUtilityMenu';

function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isFabEnabled } = useNavigationSettings();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        backBehavior="history"
        tabBar={(props) => {
            if (isFabEnabled) {
                return null;
            }
            return <BottomTabBar {...props} />;
        }}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        {/* <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        /> */}
        <Tabs.Screen
          name='workout'
          options={{
            title: 'Workout',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="dumbbell.fill" color={color} />,
          }}
        />

      </Tabs>
      <ActiveWorkoutOverlay />
      {/* <GlobalOverlay>
        <QuickNavigationButton />
        <QuickUtilityButton />
      </GlobalOverlay> */}
    </View>
  );
}
