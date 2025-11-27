import { View, Text, StyleSheet } from 'react-native';
import { useUITheme } from '../theme';

type ThemedCardProps = {
  title: string;
  subtitle?: string;
};

export const ThemedCard = ({ title, subtitle }: ThemedCardProps) => {
  const theme = useUITheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.surface,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
      marginVertical: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.icon,
    },
  });

export default ThemedCard;
