import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import { ThemedText } from './themed-text';
import { Icons } from './icons';
import { Spacing } from '@/constants/theme';

export function OfflineBanner() {
  const networkState = Network.useNetworkState();
  const insets = useSafeAreaInsets();

  const isOffline =
    networkState.isConnected === false ||
    (networkState.isInternetReachable === false && networkState.isConnected !== undefined);

  if (!isOffline) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        {
          paddingTop: Math.max(insets.top, 8),
        },
      ]}
    >
      <View style={styles.content}>
        <Icons.WifiOff size={16} color="#FFFFFF" />
        <ThemedText style={styles.text}>
          Offline mode — displaying cached data
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#DC2626',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    width: '100%',
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
