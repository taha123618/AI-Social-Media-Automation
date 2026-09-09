import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Icons } from '@/components/icons';
import { Radii, Spacing } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function MenuScreen() {
  const theme = useTheme();
  const { open } = useSidebarStore();

  useEffect(() => {
    open();
  }, [open]);

  const handleOpen = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    open();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme.primary }]}
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Open Navigation Menu"
      >
        <Icons.Menu size={22} color="#FFFFFF" />
        <ThemedText style={styles.btnText}>Open Navigation Menu</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
