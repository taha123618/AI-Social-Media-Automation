import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Radii } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export function SidebarTrigger({ style }: { style?: ViewStyle }) {
  const theme = useTheme();
  const { open } = useSidebarStore();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    open();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.trigger,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        style,
      ]}
      hitSlop={8}
      accessibilityLabel="Open Navigation Sidebar"
      accessibilityRole="button"
    >
      <Icons.Menu size={20} color={theme.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 38,
    height: 38,
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
