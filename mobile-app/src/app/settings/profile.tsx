import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth.store';
import { Spacing, Radii } from '@/constants/theme';

export default function ProfileSettingsScreen() {
  const theme = useTheme();
  const { user, logout, themeMode, setThemeMode, workspaces, activeWorkspaceId } = useAuthStore();

  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [dmAlerts, setDmAlerts] = useState(true);

  const handleToggleBiometrics = async (enabled: boolean) => {
    if (!enabled) {
      setBiometricsEnabled(false);
      return;
    }
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        Alert.alert(
          'Biometrics Not Available',
          'Your device does not have biometric hardware or enrolled Face ID / Fingerprint credentials.'
        );
        setBiometricsEnabled(false);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric unlock',
        fallbackLabel: 'Cancel',
      });
      if (result.success) {
        setBiometricsEnabled(true);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        setBiometricsEnabled(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to authenticate biometrics.');
      setBiometricsEnabled(false);
    }
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const roleDisplay = activeWorkspace?.role
    ? activeWorkspace.role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : 'Member';
  const planDisplay = activeWorkspace?.planTier
    ? activeWorkspace.planTier.charAt(0).toUpperCase() + activeWorkspace.planTier.slice(1).toLowerCase()
    : 'Pro';

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out from SocialAI?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleThemeChange = async (mode: 'system' | 'light' | 'dark') => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    await setThemeMode(mode);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
          ]}
          hitSlop={12}
        >
          <Icons.ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Workspace Command Hub
        </ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </ThemedText>
            </View>
            <View style={styles.profileDetails}>
              <ThemedText type="subtitle" style={{ fontWeight: '800' }}>
                {user?.name || 'User'}
              </ThemedText>
              {user?.email ? (
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {user.email}
                </ThemedText>
              ) : null}
              <View style={styles.roleBadges}>
                <Badge label={roleDisplay} variant="platform" size="sm" style={{ backgroundColor: theme.backgroundElement }} />
                <Badge label={planDisplay} variant="status" status="PUBLISHED" size="sm" />
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Workspace Quick Link */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          CURRENT WORKSPACE
        </ThemedText>
        <GlassCard style={styles.cardSection}>
          <Pressable
            onPress={() => router.push('/settings/workspaces')}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Building size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  {activeWorkspace?.name || 'My Workspace'}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Role: {activeWorkspace?.role || 'MEMBER'} • Tap to switch
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>
        </GlassCard>

        {/* Autonomous AI Specialist Modules */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.five }]}>
          AI AGENT & MARKETING MODULES
        </ThemedText>
        <GlassCard style={styles.cardSection}>
          <Pressable
            onPress={() => router.push('/arena' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Sparkles size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  AI Model Arena
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Multi-LLM side-by-side benchmark & comparison
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/competitors' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.ShieldCheck size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Competitor Intelligence
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Autonomous SWOT analysis & keyword radar
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/blog' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.MessageCircle size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  AI Blog Writer & SEO Articles
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Programmatic long-form content generation
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/ad-campaigns' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.TrendingUp size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Paid Ad Campaigns
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Multi-variant copy and budget telemetry
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/listening' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Radio size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Social Listening Radar
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Real-time cross-network brand sentiment
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/reviews' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Star size={20} color={theme.warning} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Review Booster
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Smart QR invites & automated AI replies
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/multi-location' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Building size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Multi-Location Brand Sync
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Regional branches and localized queues
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/knowledge' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Bookmark size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Brand DNA & Knowledge Base
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Vectorized context grounding documents
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/trends' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Zap size={20} color={theme.warning} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Viral Trends & Events
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  High-velocity timely news and hook generator
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>
        </GlassCard>

        {/* Studio & Developer Tools */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.five }]}>
          CREATIVE STUDIOS & INTEGRATIONS
        </ThemedText>
        <GlassCard style={styles.cardSection}>
          <Pressable
            onPress={() => router.push('/studio/image-generator' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Sparkles size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  AI Image Generator Studio
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Multi-aspect diffusion visual synthesizer
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/studio/video-generator' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Video size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  RAG Video Storyboard Studio
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Multi-scene scripts and cinematic B-roll director
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/studio/carousel-preview')}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Layers size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  AI Carousel Deck Studio
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  LinkedIn PDF & Instagram swipe viewer
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/studio/voice-narrator')}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Mic size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  AI Voice Narrator Studio
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Voice cloning and reactive waveform player
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/settings/social-accounts' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Share2 size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Connected Social Accounts
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  LinkedIn, X, Instagram, TikTok, Facebook, YouTube
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/settings/team' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Users size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Team Members & RBAC
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Manage workspace collaborators and invites
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/settings/billing' as any)}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.CreditCard size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  Subscription & Quotas
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Plan tiers, AI token quotas, and invoices
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/settings/api-keys')}
            style={({ pressed }) => [styles.navRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Key size={20} color={theme.primary} />
              </View>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                  API Keys & Webhooks
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Production tokens and HMAC secrets
                </ThemedText>
              </View>
            </View>
            <Icons.ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>
        </GlassCard>

        {/* Appearance / Theme Switcher */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.five }]}>
          APPEARANCE
        </ThemedText>
        <GlassCard style={styles.cardSection}>
          <View style={styles.themeSelector}>
            {(
              [
                { mode: 'system', label: 'System', icon: Icons.Refresh },
                { mode: 'light', label: 'Light', icon: Icons.Sun },
                { mode: 'dark', label: 'Dark', icon: Icons.Moon },
              ] as const
            ).map((item) => {
              const isSelected = themeMode === item.mode;
              const IconComp = item.icon;
              return (
                <Pressable
                  key={item.mode}
                  onPress={() => handleThemeChange(item.mode)}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <IconComp
                    size={18}
                    color={isSelected ? '#FFFFFF' : theme.textSecondary}
                  />
                  <ThemedText
                    type="caption"
                    style={{
                      color: isSelected ? '#FFFFFF' : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                      marginTop: 4,
                    }}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        {/* Security & Preferences */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.five }]}>
          SECURITY & NOTIFICATIONS
        </ThemedText>
        <GlassCard style={styles.cardSection}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                Biometric Unlock
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                FaceID / Fingerprint session authentication
              </ThemedText>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                Push Notifications
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Real-time queue execution and viral alerts
              </ThemedText>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                Instant DM Alerts
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Priority notifications for Pricing and Lead intents
              </ThemedText>
            </View>
            <Switch
              value={dmAlerts}
              onValueChange={setDmAlerts}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </GlassCard>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          variant="destructive"
          icon={<Icons.LogOut size={18} color="#FFFFFF" />}
          onPress={handleSignOut}
          style={{ marginTop: Spacing.six }}
        />

        <View style={styles.footerVersion}>
          <ThemedText type="mono" style={{ fontSize: 11, color: theme.textMuted }}>
            SocialAI Mobile Companion v1.0.0 (Expo SDK 57)
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: 60,
  },
  profileCard: {
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  roleBadges: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  sectionLabel: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  cardSection: {
    padding: Spacing.three,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themeOption: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  switchLabelContainer: {
    flex: 1,
    paddingRight: Spacing.three,
  },
  footerVersion: {
    alignItems: 'center',
    marginTop: Spacing.six,
  },
});
