import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth, supabase } from '@mycsuite/auth';
import { SharedButton, useUITheme, ThemedText, ThemedView } from '@mycsuite/ui';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { BodyWeightCard } from '../../components/profile/BodyWeightCard';
import { WeightLogModal } from '../../components/profile/WeightLogModal';

import { ScreenHeader } from '../../components/ui/ScreenHeader';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [weightHistory, setWeightHistory] = useState<{ value: number; label: string; date: string }[]>([]);
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const theme = useUITheme();
  
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) console.log('Error fetching profile:', error);
          if (data) {
            setUsername(data.username);
            setFullName(data.full_name);
          }
        });
    }
  }, [user]);

  const fetchLatestWeight = useCallback(async () => {
    if (!user) return;
    
    // Fetch the most recent weight entry
    const { data: latestData, error: latestError } = await supabase
      .from('body_measurements')
      .select('weight')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
        console.log('Error fetching weight:', latestError);
    } else if (latestData) {
        setLatestWeight(latestData.weight);
    }
    
    // Fetch history
    const { data: historyData, error: historyError } = await supabase
      .from('body_measurements')
      .select('weight, date')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .limit(20); 
      
    if (historyError) {
        console.log('Error fetching weight history:', historyError);
    } else if (historyData) {
        // Format for chart
        const formattedHistory = historyData.map(item => ({
            value: item.weight,
            label: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            date: item.date
        }));
        setWeightHistory(formattedHistory);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
        fetchLatestWeight();
    }
  }, [user, fetchLatestWeight]);

  const handleSaveWeight = async (weight: number, date: Date) => {
    if (!user) return;

    const { error } = await supabase
        .from('body_measurements')
        .insert({
            user_id: user.id,
            weight: weight,
            date: date.toISOString().split('T')[0], // format as YYYY-MM-DD
        });

    if (error) {
        console.log('Error saving weight:', error);
        // You might want to show an alert here
    } else {
        fetchLatestWeight(); // Refresh display
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();

  };
  
  return (
    <ThemedView className="flex-1 p-4">
      <ScreenHeader 
        title="Profile" 
        rightAction={
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <IconSymbol name="gearshape.fill" size={24} color={theme.text} />
            </TouchableOpacity>
        } 
      />
      
      <View className="mb-6">
        <View className="mb-4">
            <Text className="text-sm mb-1 text-gray-500">Username</Text>
            <ThemedText className="text-lg font-medium">{username || 'Not set'}</ThemedText>
        </View>
        <View className="mb-4">
            <Text className="text-sm mb-1 text-gray-500">Full Name</Text>
            <ThemedText className="text-lg font-medium">{fullName || 'Not set'}</ThemedText>
        </View>
      </View>

      <BodyWeightCard 
        weight={latestWeight} 
        history={weightHistory}
        onLogWeight={() => setIsWeightModalVisible(true)} 
      />

      <WeightLogModal
        visible={isWeightModalVisible}
        onClose={() => setIsWeightModalVisible(false)}
        onSave={handleSaveWeight}
      />

      <SharedButton title="Sign Out" onPress={handleSignOut} />
    </ThemedView>
  );
}