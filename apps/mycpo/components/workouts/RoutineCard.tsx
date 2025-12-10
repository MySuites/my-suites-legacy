import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUITheme } from '@mycsuite/ui';

interface RoutineCardProps {
  routine: {
    id: string;
    name: string;
    sequence: any[];
    createdAt: string;
  };
  onPress: () => void;
  onLongPress?: () => void;
}

export function RoutineCard({ routine, onPress, onLongPress }: RoutineCardProps) {
  const theme = useUITheme();
  const styles = makeStyles(theme);

  const workoutCount = routine.sequence.filter((s) => s.type === 'workout').length;
  const totalDays = routine.sequence.length;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {routine.name}
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.stats}>
          {totalDays} Days • {workoutCount} Workouts
        </Text>
        {/* Preview of first few days could go here if we had space */}
      </View>

      <View style={styles.footer}>
        <Text style={styles.actionText}>Set Routine</Text>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      width: 200,
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.options?.borderColor || 'rgba(150,150,150,0.1)',
      justifyContent: 'space-between',
      minHeight: 120, // ensure consistent height
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      marginBottom: 8,
    },
    name: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
    },
    content: {
      flex: 1,
    },
    stats: {
      fontSize: 14,
      color: theme.icon,
      marginBottom: 4,
    },
    footer: {
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    actionText: {
      color: theme.primary,
      fontWeight: '600',
      fontSize: 14,
    },
  });
