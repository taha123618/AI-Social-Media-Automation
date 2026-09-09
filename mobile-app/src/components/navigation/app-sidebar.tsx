import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Spacing, Radii } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 340);

interface NavItem {
  name: string;
  route: string;
  icon: (props: any) => React.JSX.Element;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AppSidebar() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const { isOpen, close } = useSidebarStore();
  const { user, logout, themeMode, setThemeMode } = useAuthStore();
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, slideAnim, fadeAnim]);

  if (!isOpen && (slideAnim as any)._value === -SIDEBAR_WIDTH) {
    return null;
  }

  const handleNavigate = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    close();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your workspace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          close();
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const SECTIONS: NavSection[] = [
    {
      title: 'Core & Publishing',
      items: [
        { name: 'Executive Dashboard', route: '/(tabs)', icon: Icons.Dashboard },
        { name: 'Content Library & Queue', route: '/contents', icon: Icons.FileText },
        { name: 'AI Post Composer', route: '/(tabs)/composer', icon: Icons.Sparkles, badge: 'AI' },
        { name: 'Visual Schedule & Slots', route: '/(tabs)/calendar', icon: Icons.Calendar },
        { name: 'Social & DM Inbox', route: '/(tabs)/inbox', icon: Icons.Inbox },
        { name: 'Analytics & Attribution', route: '/(tabs)/analytics', icon: Icons.Analytics },
      ],
    },
    {
      title: 'AI Creative Studios',
      items: [
        { name: 'Image Diffusion Studio', route: '/image', icon: Icons.Image, badge: 'Pro' },
        { name: 'RAG Video Storyboard', route: '/videos', icon: Icons.Video, badge: 'Pro' },
        { name: 'Voice Narration & TTS', route: '/voice', icon: Icons.Mic },
        { name: 'Carousel Card Studio', route: '/carousels', icon: Icons.Layers },
      ],
    },
    {
      title: 'Growth & Intelligence Swarm',
      items: [
        { name: 'AI Blog & SEO Writer', route: '/blog', icon: Icons.FileText, badge: 'New' },
        { name: 'Ad Campaigns & ROAS', route: '/ad-campaigns', icon: Icons.CreditCard },
        { name: 'Competitor Intelligence', route: '/competitors', icon: Icons.Target },
        { name: 'AI Model Arena (LLMs)', route: '/arena', icon: Icons.Compass },
        { name: 'Viral Trends Radar', route: '/trends', icon: Icons.TrendingUp },
        { name: 'Social Listening & Mentions', route: '/listening', icon: Icons.Radio },
        { name: 'Review Booster & Rep', route: '/reviews', icon: Icons.Star },
        { name: 'Multi-Location Franchise', route: '/multi-location', icon: Icons.MapPin },
        { name: 'Smart DM Engagement', route: '/engagement', icon: Icons.MessageCircle },
      ],
    },
    {
      title: 'Assets & Operations',
      items: [
        { name: 'Cloud Media Gallery', route: '/gallery', icon: Icons.Folder },
        { name: 'Autonomous Workflows', route: '/workflows', icon: Icons.Zap },
        { name: 'Brand DNA & Knowledge', route: '/knowledge', icon: Icons.Bookmark },
      ],
    },
    {
      title: 'Settings & Workspace',
      items: [
        { name: 'Manage Workspaces', route: '/settings/workspaces', icon: Icons.Building },
        { name: 'Billing & Quotas', route: '/settings/billing', icon: Icons.CreditCard },
        { name: 'Team & Permissions', route: '/settings/team', icon: Icons.Users },
        { name: 'Social Channels', route: '/settings/social', icon: Icons.Share2 },
        { name: 'API Keys & Webhooks', route: '/settings/api-keys', icon: Icons.Key },
        { name: 'User Profile & Security', route: '/settings/profile', icon: Icons.User },
      ],
    },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Slide-over Drawer Container */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: SIDEBAR_WIDTH,
            backgroundColor: theme.backgroundElement,
            borderRightColor: theme.border,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left']}>
          {/* Header & User Card */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerTop}>
              <View style={styles.brandRow}>
                <View style={[styles.brandLogo, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.brandLogoText}>S</ThemedText>
                </View>
                <View>
                  <ThemedText type="subtitle" style={styles.brandTitle}>
                    SocialAI
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700', fontSize: 11 }}>
                    Enterprise Suite
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity
                onPress={close}
                style={[styles.closeBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                hitSlop={8}
              >
                <Icons.Close size={18} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* User Profile Card */}
            {user && (
              <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                  <ThemedText style={[styles.avatarText, { color: theme.primary }]}>
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </ThemedText>
                </View>
                <View style={styles.userInfo}>
                  <ThemedText type="caption" style={styles.userName} numberOfLines={1}>
                    {user.name || 'Workspace User'}
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.userEmail, { color: theme.textMuted }]} numberOfLines={1}>
                    {user.email}
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Workspace Selector Chip */}
            {activeWorkspace && (
              <TouchableOpacity
                onPress={() => handleNavigate('/settings/workspaces')}
                style={[styles.workspaceChip, { backgroundColor: theme.background, borderColor: theme.border }]}
              >
                <Icons.Building size={14} color={theme.primary} />
                <ThemedText type="caption" style={[styles.workspaceName, { color: theme.text }]} numberOfLines={1}>
                  {activeWorkspace.name}
                </ThemedText>
                <View style={[styles.tierBadge, { backgroundColor: theme.primaryLight }]}>
                  <ThemedText type="caption" style={[styles.tierText, { color: theme.primary }]}>
                    {activeWorkspace.planTier || 'PRO'}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Nav List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {SECTIONS.map((section, sIdx) => (
              <View key={sIdx} style={styles.sectionContainer}>
                <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textMuted }]}>
                  {section.title.toUpperCase()}
                </ThemedText>

                <View style={styles.itemsList}>
                  {section.items.map((item, iIdx) => {
                    const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
                    const IconComponent = item.icon;

                    return (
                      <TouchableOpacity
                        key={iIdx}
                        onPress={() => handleNavigate(item.route)}
                        style={[
                          styles.navItem,
                          isActive && [
                            styles.navItemActive,
                            {
                              backgroundColor: `${theme.primary}18`,
                              borderColor: `${theme.primary}40`,
                            },
                          ],
                        ]}
                      >
                        <View style={styles.navItemLeft}>
                          <IconComponent
                            size={18}
                            color={isActive ? theme.primary : theme.textMuted}
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                          <ThemedText
                            type="caption"
                            style={[
                              styles.navItemLabel,
                              {
                                color: isActive ? theme.text : theme.textSecondary,
                                fontWeight: isActive ? '700' : '500',
                              },
                            ]}
                          >
                            {item.name}
                          </ThemedText>
                        </View>

                        {item.badge && (
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor:
                                  item.badge === 'AI'
                                    ? `${theme.primary}20`
                                    : item.badge === 'Pro'
                                    ? `${theme.secondary}20`
                                    : `${theme.success}20`,
                              },
                            ]}
                          >
                            <ThemedText
                              type="caption"
                              style={[
                                styles.badgeText,
                                {
                                  color:
                                    item.badge === 'AI'
                                      ? theme.primary
                                      : item.badge === 'Pro'
                                      ? theme.secondary
                                      : theme.success,
                                },
                              ]}
                            >
                              {item.badge}
                            </ThemedText>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer & Controls */}
          <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.card }]}>
            {/* Theme Mode Toggle */}
            <View style={styles.themeRow}>
              <ThemedText type="caption" style={{ color: theme.textMuted, fontSize: 12 }}>
                Appearance
              </ThemedText>
              <View style={[styles.themePills, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                {(['system', 'light', 'dark'] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setThemeMode(mode)}
                    style={[
                      styles.themePill,
                      themeMode === mode && [styles.themePillActive, { backgroundColor: theme.card }],
                    ]}
                  >
                    {mode === 'light' ? (
                      <Icons.Sun size={14} color={themeMode === mode ? theme.primary : theme.textMuted} />
                    ) : mode === 'dark' ? (
                      <Icons.Moon size={14} color={themeMode === mode ? theme.primary : theme.textMuted} />
                    ) : (
                      <Icons.Sparkles size={14} color={themeMode === mode ? theme.primary : theme.textMuted} />
                    )}
                    <ThemedText
                      type="caption"
                      style={[
                        styles.themePillText,
                        {
                          color: themeMode === mode ? theme.text : theme.textMuted,
                          fontWeight: themeMode === mode ? '700' : '500',
                        },
                      ]}
                    >
                      {mode === 'system' ? 'Auto' : mode === 'light' ? 'Light' : 'Dark'}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Icons.LogOut size={16} color={theme.destructive} />
              <ThemedText type="caption" style={[styles.logoutText, { color: theme.destructive }]}>
                Sign Out
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  drawer: {
    height: '100%',
    borderRightWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: Spacing.four,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '700',
    fontSize: 13,
  },
  userEmail: {
    fontSize: 11,
  },
  workspaceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  workspaceName: {
    flex: 1,
    fontWeight: '600',
    fontSize: 12,
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.five,
  },
  sectionContainer: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.two,
  },
  itemsList: {
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navItemActive: {
    borderWidth: 1,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  navItemLabel: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    padding: Spacing.four,
    borderTopWidth: 1,
    gap: Spacing.three,
  },
  themeRow: {
    gap: Spacing.one,
  },
  themePills: {
    flexDirection: 'row',
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: 2,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: Radii.sm,
    gap: 4,
  },
  themePillActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themePillText: {
    fontSize: 11,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  logoutText: {
    fontWeight: '700',
    fontSize: 13,
  },
});
