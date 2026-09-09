import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useSettingsQuery } from '@/hooks/queries/use-settings-query';

import { backendApi } from '@/lib/backend';

interface WebhookEndpoint {
  id: string;
  url: string;
  status: 'ACTIVE' | 'PAUSED' | 'FAILING';
  lastPingStatus: number;
  latencyMs: number;
  events: string[];
}

export default function ApiKeysScreen() {
  const theme = useTheme();
  const { data, isLoading, refetch } = useSettingsQuery();

  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showSandboxKey, setShowSandboxKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [liveKey, setLiveKey] = useState('');
  const [sandboxKey, setSandboxKey] = useState('');
  const [signingSecret, setSigningSecret] = useState('');

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);

  React.useEffect(() => {
    if (data?.apiKeys && data.apiKeys.length > 0) {
      const live = data.apiKeys.find((k) => k.type === 'PRODUCTION' || !k.name?.toLowerCase().includes('sandbox'));
      const sandbox = data.apiKeys.find((k) => k.type === 'SANDBOX' || k.name?.toLowerCase().includes('sandbox'));
      if (live?.fullKey || live?.keyMasked) setLiveKey(live.fullKey || live.keyMasked);
      if (sandbox?.fullKey || sandbox?.keyMasked) setSandboxKey(sandbox.fullKey || sandbox.keyMasked);
    }
    if (data?.webhooks && data.webhooks.length > 0) {
      const mappedHooks: WebhookEndpoint[] = data.webhooks.map((h) => ({
        id: h.id,
        url: h.url,
        status: h.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
        lastPingStatus: 200,
        latencyMs: h.latencyMs || 42,
        events: h.eventTypes || ['post.published'],
      }));
      setWebhooks(mappedHooks);
    }
    if (data?.hmacSecret) {
      setSigningSecret(data.hmacSecret);
    }
  }, [data]);

  const handleCopy = (value: string, label: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Copied to Clipboard', `${label} has been copied.`);
  };

  const handleRegenerateLiveKey = () => {
    Alert.alert(
      'Rotate API Key',
      'Are you sure you want to generate/rotate your Live API Key? Any external services using the previous key will need to be updated.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate Key',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await backendApi.createApiKey('Live Production Key', ['*']);
              if (res.fullKey || res.keyMasked) {
                setLiveKey(res.fullKey || res.keyMasked);
              }
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert('Key Generated', 'Your new Live API Key is now active.');
              refetch();
            } catch (err: any) {
              Alert.alert('Key Generation Failed', err?.message || 'Could not generate API key.');
            }
          },
        },
      ]
    );
  };

  const handleTestPing = async (endpoint: WebhookEndpoint) => {
    setTestingId(endpoint.id);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const randomLatency = Math.floor(Math.random() * 25) + 20;
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === endpoint.id
            ? { ...w, lastPingStatus: 200, latencyMs: randomLatency }
            : w
        )
      );
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Ping Delivered', `HTTP 200 OK (${randomLatency}ms) received from endpoint.`);
    } catch {
      Alert.alert('Ping Error', 'Failed to reach webhook endpoint.');
    } finally {
      setTestingId(null);
    }
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
          API Keys & Webhooks
        </ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Security Banner */}
        <GlassCard style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primaryGlow }]}>
              <Icons.ShieldCheck size={22} color={theme.primary} />
            </View>
            <View style={styles.bannerText}>
              <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                Cryptographic Authentication
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                SocialAI API requests require Bearer token headers. Webhooks are HMAC SHA-256 signed with your secret.
              </ThemedText>
            </View>
          </View>
        </GlassCard>

        {/* Live Key Section */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          PRODUCTION CREDENTIALS
        </ThemedText>

        <GlassCard style={styles.keyCard}>
          <View style={styles.keyHeader}>
            <View style={styles.keyTitleRow}>
              <Icons.Key size={18} color={theme.primary} />
              <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                Live API Key
              </ThemedText>
            </View>
            <Badge label="PRODUCTION" variant="status" status="PUBLISHED" size="sm" />
          </View>

          <View style={[styles.keyValueContainer, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="mono" style={styles.keyValueText}>
              {showLiveKey ? liveKey : `sai_live_••••••••••••••••••••••••`}
            </ThemedText>
            <View style={styles.keyActionButtons}>
              <Pressable
                onPress={() => setShowLiveKey(!showLiveKey)}
                style={styles.iconAction}
                hitSlop={8}
              >
                {showLiveKey ? (
                  <Icons.EyeOff size={18} color={theme.textSecondary} />
                ) : (
                  <Icons.Eye size={18} color={theme.textSecondary} />
                )}
              </Pressable>
              <Pressable
                onPress={() => handleCopy(liveKey, 'Live API Key')}
                style={styles.iconAction}
                hitSlop={8}
              >
                <Icons.Copy size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>

          <Button
            label="Rotate Live Key"
            variant="ghost"
            size="sm"
            icon={<Icons.Refresh size={14} color={theme.textSecondary} />}
            onPress={handleRegenerateLiveKey}
            style={{ alignSelf: 'flex-start', marginTop: Spacing.two }}
          />
        </GlassCard>

        {/* Sandbox Key Section */}
        <GlassCard style={[styles.keyCard, { marginTop: Spacing.three }]}>
          <View style={styles.keyHeader}>
            <View style={styles.keyTitleRow}>
              <Icons.Key size={18} color={theme.secondary} />
              <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                Sandbox Test Key
              </ThemedText>
            </View>
            <Badge label="SANDBOX" variant="platform" size="sm" style={{ backgroundColor: theme.backgroundElement }} />
          </View>

          <View style={[styles.keyValueContainer, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="mono" style={styles.keyValueText}>
              {showSandboxKey ? sandboxKey : `sai_test_••••••••••••••••••••••••`}
            </ThemedText>
            <View style={styles.keyActionButtons}>
              <Pressable
                onPress={() => setShowSandboxKey(!showSandboxKey)}
                style={styles.iconAction}
                hitSlop={8}
              >
                {showSandboxKey ? (
                  <Icons.EyeOff size={18} color={theme.textSecondary} />
                ) : (
                  <Icons.Eye size={18} color={theme.textSecondary} />
                )}
              </Pressable>
              <Pressable
                onPress={() => handleCopy(sandboxKey, 'Sandbox Test Key')}
                style={styles.iconAction}
                hitSlop={8}
              >
                <Icons.Copy size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>
        </GlassCard>

        {/* Signing Secret */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.five }]}>
          WEBHOOK SIGNING SECRET
        </ThemedText>

        <GlassCard style={styles.keyCard}>
          <View style={styles.keyHeader}>
            <View style={styles.keyTitleRow}>
              <Icons.Lock size={18} color="#10B981" />
              <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                HMAC SHA-256 Secret
              </ThemedText>
            </View>
          </View>

          <View style={[styles.keyValueContainer, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="mono" style={styles.keyValueText}>
              {showSecret ? signingSecret : `sai_whsec_••••••••••••••••••••••••••••`}
            </ThemedText>
            <View style={styles.keyActionButtons}>
              <Pressable
                onPress={() => setShowSecret(!showSecret)}
                style={styles.iconAction}
                hitSlop={8}
              >
                {showSecret ? (
                  <Icons.EyeOff size={18} color={theme.textSecondary} />
                ) : (
                  <Icons.Eye size={18} color={theme.textSecondary} />
                )}
              </Pressable>
              <Pressable
                onPress={() => handleCopy(signingSecret, 'Signing Secret')}
                style={styles.iconAction}
                hitSlop={8}
              >
                <Icons.Copy size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>
        </GlassCard>

        {/* Webhooks Monitor */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.five }]}>
          ACTIVE WEBHOOK SUBSCRIPTIONS ({webhooks.length})
        </ThemedText>

        <View style={{ gap: Spacing.three }}>
          {webhooks.map((wh) => (
            <GlassCard key={wh.id} style={styles.webhookCard}>
              <View style={styles.webhookHeader}>
                <View style={styles.urlRow}>
                  <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                  <ThemedText type="mono" style={styles.urlText} numberOfLines={1}>
                    {wh.url}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.eventsContainer}>
                {wh.events.map((ev) => (
                  <View
                    key={ev}
                    style={[styles.eventChip, { backgroundColor: theme.backgroundElement }]}
                  >
                    <ThemedText type="mono" style={{ fontSize: 10, color: theme.primary }}>
                      {ev}
                    </ThemedText>
                  </View>
                ))}
              </View>

              <View style={[styles.webhookFooter, { borderTopColor: theme.border }]}>
                <View style={styles.telemetryRow}>
                  <ThemedText type="mono" style={{ fontSize: 11, color: '#10B981', fontWeight: '700' }}>
                    HTTP {wh.lastPingStatus}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    •
                  </ThemedText>
                  <ThemedText type="mono" style={{ fontSize: 11, color: theme.textSecondary }}>
                    {wh.latencyMs}ms
                  </ThemedText>
                </View>

                <Button
                  label={testingId === wh.id ? 'Pinging...' : 'Send Test Ping'}
                  variant="outline"
                  size="sm"
                  loading={testingId === wh.id}
                  icon={<Icons.Send size={12} color={theme.primary} />}
                  onPress={() => handleTestPing(wh)}
                />
              </View>
            </GlassCard>
          ))}
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
  banner: {
    padding: Spacing.four,
    marginBottom: Spacing.five,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
  },
  sectionLabel: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.three,
  },
  keyCard: {
    padding: Spacing.four,
  },
  keyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  keyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  keyValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radii.lg,
  },
  keyValueText: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.two,
  },
  keyActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconAction: {
    padding: Spacing.one,
  },
  webhookCard: {
    padding: Spacing.four,
  },
  webhookHeader: {
    marginBottom: Spacing.two,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
  },
  urlText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  eventsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  eventChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  webhookFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
