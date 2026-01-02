import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, TextInput, Alert } from 'react-native';
import { useAuth, supabase } from '@mysuite/auth';
import { useUITheme, useToast, RaisedButton, IconSymbol } from '@mysuite/ui';
import { BodyWeightCard } from '../../components/profile/BodyWeightCard';
import { WeightLogModal } from '../../components/profile/WeightLogModal';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BackButton } from '../../components/ui/BackButton';

type DateRange = 'Week' | 'Month' | '6Month' | 'Year';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [tempFullName, setTempFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [weightHistory, setWeightHistory] = useState<{ value: number; label: string; date: string }[]>([]);
  const [rangeAverage, setRangeAverage] = useState<number | null>(null);
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<DateRange>('Week');
  const { showToast } = useToast();
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
            setUsername(data.username || '');
            setFullName(data.full_name || '');
            setTempUsername(data.username || '');
            setTempFullName(data.full_name || '');
          }
        });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: tempUsername,
      full_name: tempFullName,
      updated_at: new Date().toISOString(),
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setUsername(tempUsername);
      setFullName(tempFullName);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }
  };

  const handleCancelEdit = () => {
    setTempUsername(username);
    setTempFullName(fullName);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            Alert.alert('Not Implemented', 'Account deletion logic to be implemented.');
          } 
        }
      ]
    );
  };

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
  }, [user]);


  // Helper to format date label
  const formatDateLabel = (dateStr: string, range: DateRange) => {
      // Use UTC to prevent off-by-one errors when formatting labels
      // toLocaleDateString uses local timezone of device.
      // If dateStr="2025-12-24" (UTC), and we are EST. date Obj is Dec 23 19:00.
      // label becomes Dec 23. This IS confusing.
      // We want label "Dec 24".
      
      const d = new Date(dateStr);
      const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      
      if (range === 'Week' || range === 'Month' || range === '6Month') return utcDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (range === 'Year') return utcDate.toLocaleDateString(undefined, { month: 'short' });
      return utcDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const fetchWeightHistory = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    // 1. Generate Spine (Target Dates)
    let spine: string[] = [];
    const now = new Date();
    // Get "Today" as YYYY-MM-DD string (Local)
    const todayY = now.getFullYear();
    const todayM = String(now.getMonth() + 1).padStart(2, '0');
    const todayD = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayY}-${todayM}-${todayD}`;

    if (selectedRange === 'Week') {
        // Last 7 days
        const d = new Date(todayStr); // UTC Mid
        for (let i = 6; i >= 0; i--) {
            const temp = new Date(d);
            temp.setUTCDate(d.getUTCDate() - i);
            spine.push(temp.toISOString().split('T')[0]);
        }
    } else if (selectedRange === 'Month') {
        // Last 30 days
        const d = new Date(todayStr);
        for (let i = 29; i >= 0; i--) {
            const temp = new Date(d);
            temp.setUTCDate(d.getUTCDate() - i);
            spine.push(temp.toISOString().split('T')[0]);
        }
    } else if (selectedRange === '6Month') {
        // Last 26 weeks (6 months)
        // A "week" here ends on today. So the start of the current week is today - 6 days.
        const lastWeekStart = new Date(todayStr);
        lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 6);
        
        for (let i = 25; i >= 0; i--) {
             const temp = new Date(lastWeekStart);
             temp.setUTCDate(lastWeekStart.getUTCDate() - (i * 7));
             spine.push(temp.toISOString().split('T')[0]); 
        }
    } else if (selectedRange === 'Year') {
        // Last 12 months
        const currentMonthStartStr = `${todayY}-${todayM}-01`;
        const d = new Date(currentMonthStartStr);
        for (let i = 11; i >= 0; i--) {
             const temp = new Date(d);
             temp.setUTCMonth(d.getUTCMonth() - i);
             spine.push(temp.toISOString().split('T')[0].substring(0, 7) + '-01'); 
        }
    }

    // 2. Fetch Data
    const { data: rawData, error } = await supabase
      .from('body_measurements')
      .select('weight, date')
      .eq('user_id', user.id)
      .gte('date', spine[0])
      .order('date', { ascending: true });
      
    if (error) {
        console.log('Error fetching weight history:', error);
        showToast({ message: "Failed to load weight history", type: 'error' });
        setIsLoading(false);
        return;
    }

    if (!rawData || rawData.length === 0) {
        setWeightHistory([]);
        setRangeAverage(null);
        return;
    }

    // Calculate true overall average from all individual logs in the range
    const totalSum = rawData.reduce((sum, item) => sum + parseFloat(item.weight.toString()), 0);
    setRangeAverage(Math.round((totalSum / rawData.length) * 10) / 10);

    // 3. Process Data (Aggregation)
    const groups: Record<string, { total: number, count: number }> = {};
    rawData.forEach(item => {
        let key = '';
        if (selectedRange === 'Week' || selectedRange === 'Month') {
            key = item.date;
        } else if (selectedRange === '6Month') {
            // Find the closest preceding spine date
            const itemDate = new Date(item.date).getTime();
            for (let i = spine.length - 1; i >= 0; i--) {
                const spineDate = new Date(spine[i]).getTime();
                if (itemDate >= spineDate) {
                    key = spine[i];
                    break;
                }
            }
        } else if (selectedRange === 'Year') {
            key = item.date.substring(0, 7) + '-01';
        }

        if (key && spine.includes(key)) {
            if (!groups[key]) groups[key] = { total: 0, count: 0 };
            // Calculate arithmetic mean for the bucket
            groups[key].total += parseFloat(item.weight.toString());
            groups[key].count += 1;
        }
    });
    
    // 4. Map existing data to their positions in the spine.
    const result: { value: number; label: string; date: string; spineIndex: number }[] = [];
    
    spine.forEach((date, index) => {
        if (groups[date]) {
             // 5. Label Logic (Divide into 4 sections)
             let label = '';
             const len = spine.length;
             const indices = [
                0,
                Math.floor((len - 1) * 0.25),
                Math.floor((len - 1) * 0.5),
                Math.floor((len - 1) * 0.75),
                len - 1
             ];
             
             if (indices.includes(index)) {
                 label = formatDateLabel(date, selectedRange);
             }

             result.push({
                 value: parseFloat((groups[date].total / groups[date].count).toFixed(2)),
                 label: label,
                 date: date,
                 spineIndex: index
             });
        }
    });

    setWeightHistory(result);
    setIsLoading(false);
  }, [user, selectedRange, showToast]);

  useEffect(() => {
    if (user) {
        fetchLatestWeight();
    }
  }, [user, fetchLatestWeight]);

  useEffect(() => {
      if (user) {
          fetchWeightHistory().catch(err => console.error(err));
      }
  }, [user, fetchWeightHistory]);

  const handleSaveWeight = async (weight: number, date: Date) => {
    if (!user) return;

    const dateStr = date.toISOString().split('T')[0];

    // Check if entry exists for this date
    const { data: existingData, error: fetchError } = await supabase
        .from('body_measurements')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .maybeSingle();

    if (fetchError) {
        console.log('Error checking existing weight:', fetchError);
        return;
    }

    let error;

    if (existingData) {
        // Update existing
        const { error: updateError } = await supabase
            .from('body_measurements')
            .update({ weight: weight })
            .eq('id', existingData.id);
        error = updateError;
    } else {
        // Insert new
        const { error: insertError } = await supabase
            .from('body_measurements')
            .insert({
                user_id: user.id,
                weight: weight,
                date: dateStr,
            });
        error = insertError;
    }

    if (error) {
        console.log('Error saving weight:', error);
    } else {
        fetchLatestWeight(); // Refresh display
        fetchWeightHistory(); // Refresh chart
    }
  };
  
  return (
    <View className="flex-1 bg-light dark:bg-dark">
      <ScreenHeader 
        title={username || 'Profile'} 
        leftAction={<BackButton />}
      />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mt-28 px-4 mb-6">
            <BodyWeightCard 
            weight={latestWeight} 
            history={weightHistory}
            rangeAverage={rangeAverage}
            onLogWeight={() => setIsWeightModalVisible(true)} 
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            primaryColor={theme.primary}
            textColor={theme.textMuted}
            isLoading={isLoading}
            />
        </View> 

        <View className="px-4 mb-6">
            <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-light dark:text-dark">Account</Text>
            {isEditing ? (
                <View className="flex-row gap-2">
                <RaisedButton 
                    onPress={handleCancelEdit} 
                    disabled={loading}
                    borderRadius={20}
                    className="w-10 h-10 p-0 my-0 rounded-full items-center justify-center bg-gray-200 dark:bg-white/10"
                >
                    <IconSymbol name="xmark" size={18} color={theme.danger} />
                </RaisedButton>
                <RaisedButton 
                    onPress={handleUpdateProfile} 
                    disabled={loading}
                    borderRadius={20}
                    className="w-10 h-10 p-0 my-0 rounded-full items-center justify-center"
                >
                    <IconSymbol name="checkmark" size={18} color={theme.primary} />
                </RaisedButton>
                </View>
            ) : (
                <RaisedButton 
                onPress={() => setIsEditing(true)}
                borderRadius={20}
                className="w-10 h-10 p-0 my-0 rounded-full items-center justify-center"
                >
                <IconSymbol name="pencil" size={18} color={theme.primary} />
                </RaisedButton>
            )}
            </View>
            
            <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden p-4">
                <View className="flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
                    <Text className="text-sm text-gray-500 font-medium">Email</Text>
                    <Text className="text-base text-gray-900 dark:text-white">{user?.email}</Text>
                </View>
                
                <View className="flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
                    <Text className="text-sm text-gray-500 font-medium">Username</Text>
                    {isEditing ? (
                        <View 
                        className="h-8 bg-black/5 dark:bg-white/5 rounded-lg border border-transparent min-w-[150px] justify-center pr-1"
                        >
                        <TextInput
                            className="text-base text-gray-900 dark:text-white text-right leading-none"
                            style={{ paddingTop: 0, paddingBottom: 0, height: '100%' }}
                            value={tempUsername}
                            onChangeText={setTempUsername}
                            placeholder="Username"
                            placeholderTextColor={theme.placeholder}
                            autoCapitalize="none"
                        />
                        </View>
                    ) : (
                        <Text className="h-8 text-base text-gray-900 dark:text-white pr-1 pt-1">{username || 'Not set'}</Text>
                    )}
                </View>

                <View className="flex-row items-center justify-between py-2">
                    <Text className="text-sm text-gray-500 font-medium">Full Name</Text>
                    {isEditing ? (
                        <View 
                        className="h-8 bg-black/5 dark:bg-white/5 rounded-lg border border-transparent min-w-[150px] justify-center pr-1"
                        >
                        <TextInput
                            className="text-base text-gray-900 dark:text-white text-right leading-none"
                            style={{ paddingTop: 0, paddingBottom: 0, height: '100%' }}
                            value={tempFullName}
                            onChangeText={setTempFullName}
                            placeholder="Full Name"
                            placeholderTextColor={theme.placeholder}
                        />
                        </View>
                    ) : (
                        <Text className="h-8 text-base text-gray-900 dark:text-white pr-1 pt-1">{fullName || 'Not set'}</Text>
                    )}
                </View>
            </View>
        </View>

        <View className="px-4">
            <RaisedButton 
            title="Sign Out" 
            onPress={handleSignOut} 
            className="mb-4 h-12 w-full"
            />
            
            <RaisedButton 
            title="Delete Account" 
            onPress={handleDeleteAccount} 
            className="h-12 w-full"
            textClassName="text-red-500 font-bold text-lg"
            />
        </View>
      </ScrollView>

      <WeightLogModal
        visible={isWeightModalVisible}
        onClose={() => setIsWeightModalVisible(false)}
        onSave={handleSaveWeight}
      />
    </View>
  );
}