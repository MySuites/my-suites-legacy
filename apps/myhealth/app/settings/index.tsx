import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { useAuth, supabase } from '@mysuite/auth';
import { useUITheme, RaisedButton, ThemeToggle, IconSymbol } from '@mysuite/ui';
import { useThemePreference } from '../../providers/AppThemeProvider';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BackButton } from '../../components/ui/BackButton';
import { ProfileButton } from '../../components/ui/ProfileButton';

export default function SettingsScreen() {
  const { user } = useAuth();
  const theme = useUITheme();
  const { preference, setPreference } = useThemePreference();
  const [username, setUsername] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [tempUsername, setTempUsername] = React.useState('');
  const [tempFullName, setTempFullName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
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
    } else {
      // Router will handle redirect based on auth state change in _layout
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
            // Placeholder for delete logic
            Alert.alert('Not Implemented', 'Account deletion logic to be implemented.');
          } 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-light dark:bg-dark">
      <ScreenHeader 
        title="Settings" 
        leftAction={<BackButton />} 
        rightAction={<ProfileButton />}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 140 }}>
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase">Appearance</Text>
          <ThemeToggle preference={preference} setPreference={setPreference} />
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-gray-500 uppercase">Account</Text>
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
          
          <View className="flex-row items-center justify-between py-2 border-b border-light dark:border-white/5">
            <Text className="text-sm text-gray-500 font-medium">Email</Text>
            <Text className="text-base text-light dark:text-dark">{user?.email}</Text>
          </View>
          
          <View className="flex-row items-center justify-between py-2 border-b border-light dark:border-white/5">
            <Text className="text-sm text-gray-500 font-medium">Username</Text>
            {isEditing ? (
              <View 
                className="h-8 bg-black/5 dark:bg-white/5 rounded-lg border border-light dark:border-white/5 min-w-[150px] justify-center pr-1"
              >
                <TextInput
                  className="text-base text-light dark:text-dark text-right leading-none"
                  style={{ paddingTop: 8 }}
                  value={tempUsername}
                  onChangeText={setTempUsername}
                  placeholder="Username"
                  placeholderTextColor={theme.placeholder}
                  autoCapitalize="none"
                />
              </View>
            ) : (
              <Text className="h-8 text-base text-light dark:text-dark pr-1 pt-1">{username || 'Not set'}</Text>
            )}
          </View>

          <View className="flex-row items-center justify-between py-2 border-b border-light dark:border-white/5">
            <Text className="text-sm text-gray-500 font-medium">Full Name</Text>
            {isEditing ? (
              <View 
                className="h-8 bg-black/5 dark:bg-white/5 rounded-lg border border-light dark:border-white/5 min-w-[150px] justify-center pr-1"
              >
                <TextInput
                  className="text-base text-light dark:text-dark text-right leading-none"
                  style={{ paddingTop: 8 }}
                  value={tempFullName}
                  onChangeText={setTempFullName}
                  placeholder="Full Name"
                  placeholderTextColor={theme.placeholder}
                />
              </View>
            ) : (
              <Text className="h-8 text-base text-light dark:text-dark pr-1 pt-1">{fullName || 'Not set'}</Text>
            )}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase">Legal</Text>
          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-light dark:border-dark" onPress={() => Alert.alert('Privacy Policy', 'Link to Privacy Policy')}>
            <Text className="text-base text-light dark:text-dark">Privacy Policy</Text>
            <IconSymbol name="chevron.right" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-light dark:border-dark" onPress={() => Alert.alert('Terms of Service', 'Link to Terms of Service')}>
            <Text className="text-base text-light dark:text-dark">Terms of Service</Text>
            <IconSymbol name="chevron.right" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View>
          <RaisedButton 
            title="Sign Out" 
            onPress={handleSignOut} 
            className="mb-4 h-12"
          />
          
          <RaisedButton 
            title="Delete Account" 
            onPress={handleDeleteAccount} 
            className="h-12"
            textClassName="text-red-500 font-bold text-lg"
          />
        </View>
        
        <Text className="text-center text-xs text-gray-500 mt-6">Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}
