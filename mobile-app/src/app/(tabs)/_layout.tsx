import React from 'react';
import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export default function TabLayout() {
  const theme = useTheme();
  const { open } = useSidebarStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Icons.Dashboard size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="composer"
        options={{
          title: 'Composer',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeGlow : null}>
              <Icons.Sparkles size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <Icons.Calendar size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <Icons.Inbox size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <Icons.Analytics size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <Icons.Menu size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                open();
              }}
              accessibilityLabel="Open all pages navigation menu"
              accessibilityRole="button"
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            open();
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeGlow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
});
