import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useUITheme } from '@mycsuite/ui';

interface BodyWeightChartProps {
  data: { value: number; label: string; date: string }[];
}

export function BodyWeightChart({ data }: BodyWeightChartProps) {
  const theme = useUITheme();
  
  if (!data || data.length === 0) {
    return null;
  }

  // Reverse data to show oldest to newest if needed, but assuming data comes sorted or we sort it here.
  // Ideally, we want chronological order (left to right).
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Format for gifted-charts
  const chartData = sortedData.map(item => ({
    value: item.value,
    label: item.label,
    dataPointText: '', // Hide value on point to avoid clutter
  }));

  const screenWidth = Dimensions.get('window').width;

  return (
    <View className="py-4 -ml-4">
      <LineChart
        data={chartData}
        color={theme.primary || '#3b82f6'}
        thickness={3}
        startFillColor={theme.primary || '#3b82f6'}
        endFillColor={theme.primary || '#3b82f6'}
        startOpacity={0.2}
        endOpacity={0.0}
        areaChart
        yAxisThickness={0}
        xAxisThickness={0}
        xAxisLabelTextStyle={{ color: theme.placeholder, fontSize: 10 }}
        yAxisTextStyle={{ color: theme.placeholder, fontSize: 10 }}
        hideRules
        hideDataPoints={false}
        dataPointsColor={theme.primary || '#3b82f6'}
        dataPointsRadius={4}
        width={screenWidth - 80} // Adjust for padding
        height={150}
        spacing={40}
        initialSpacing={10}
        endSpacing={10}
        curved
      />
    </View>
  );
}
