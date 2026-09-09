import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge, SocialPlatform } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxApi } from '@/api/inbox';
import { Conversation } from '@/types/api';

type TabSection = 'MESSAGES' | 'COMMENTS';

export default function InboxScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabSection>('MESSAGES');
  const [selectedIntent, setSelectedIntent] = useState<string>('ALL');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => inboxApi.getConversations(),
  });

  const sendReplyMutation = useMutation({
    mutationFn: ({ conversationId, replyText }: { conversationId: string; replyText: string }) =>
      inboxApi.sendReply(conversationId, replyText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Reply Dispatched', 'Your AI response was successfully sent.');
    },
  });

  const handleTabChange = (tab: TabSection) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const filteredConversations = conversations.filter((c: Conversation) => {
    if (selectedIntent === 'ALL') return true;
    return c.intentTag === selectedIntent;
  });

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'PRICING':
        return theme.warning;
      case 'LEAD':
        return theme.success;
      case 'SUPPORT':
        return theme.info;
      default:
        return theme.primary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle">Social Inbox</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              Omnichannel DMs & Autonomous Sales Bot
            </ThemedText>
          </View>
          <View style={[styles.botPill, { backgroundColor: theme.primaryLight }]}>
            <Icons.Bot size={14} color={theme.primary} />
            <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
              Bot Active
            </ThemedText>
          </View>
        </View>

        {/* Section Switcher (Messages / Comments) */}
        <View style={[styles.segmentContainer, { backgroundColor: theme.backgroundElement }]}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'MESSAGES' && { backgroundColor: theme.card }]}
            onPress={() => handleTabChange('MESSAGES')}
          >
            <ThemedText
              type="defaultSemiBold"
              style={[styles.segmentText, { color: activeTab === 'MESSAGES' ? theme.primary : theme.textMuted }]}
            >
              Direct Messages ({conversations.length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'COMMENTS' && { backgroundColor: theme.card }]}
            onPress={() => handleTabChange('COMMENTS')}
          >
            <ThemedText
              type="defaultSemiBold"
              style={[styles.segmentText, { color: activeTab === 'COMMENTS' ? theme.primary : theme.textMuted }]}
            >
              Post Comments
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Intent Filters */}
        <View style={styles.intentRow}>
          {['ALL', 'PRICING', 'LEAD', 'SUPPORT'].map((intent) => {
            const isSelected = selectedIntent === intent;
            return (
              <TouchableOpacity
                key={intent}
                onPress={() => setSelectedIntent(intent)}
                style={[
                  styles.intentChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="caption"
                  style={{
                    color: isSelected ? '#FFFFFF' : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {intent}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Conversation Stream */}
        {filteredConversations.map((conv: Conversation) => (
          <GlassCard key={conv.id} style={styles.conversationCard}>
            {/* Sender row */}
            <View style={styles.senderRow}>
              <View style={styles.senderInfo}>
                <Image source={{ uri: conv.senderAvatar }} style={styles.avatar} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <View style={styles.nameHeader}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1} style={{ flex: 1 }}>
                      {conv.senderName}
                    </ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textMuted }}>
                      {conv.timestamp}
                    </ThemedText>
                  </View>
                  <View style={styles.badgesRow}>
                    <Badge variant="platform" platform={conv.platform as SocialPlatform} />
                    <View
                      style={[
                        styles.intentBadge,
                        { backgroundColor: `${getIntentColor(conv.intentTag)}20` },
                      ]}
                    >
                      <ThemedText
                        type="caption"
                        style={{ color: getIntentColor(conv.intentTag), fontWeight: '700', fontSize: 10 }}
                      >
                        {conv.intentTag}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Inbound Message */}
            <View style={[styles.messageBubble, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={styles.messageText}>{conv.lastMessage}</ThemedText>
            </View>

            {/* AI Suggested Response Banner */}
            {conv.suggestedReply && conv.status !== 'RESOLVED' && (
              <View style={[styles.aiReplyContainer, { backgroundColor: theme.primaryLight, borderColor: theme.borderFocus }]}>
                <View style={styles.aiReplyHeader}>
                  <Icons.Sparkles size={14} color={theme.primary} />
                  <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                    AI Autonomous Proposal
                  </ThemedText>
                </View>
                <ThemedText style={[styles.aiReplyText, { color: theme.text }]}>
                  {conv.suggestedReply}
                </ThemedText>
                <Button
                  title="Approve & Send"
                  size="sm"
                  variant="primary"
                  icon={<Icons.Send size={14} color="#FFFFFF" />}
                  onPress={() =>
                    sendReplyMutation.mutate({
                      conversationId: conv.id,
                      replyText: conv.suggestedReply || '',
                    })
                  }
                  style={styles.replyButton}
                />
              </View>
            )}

            {conv.status === 'RESOLVED' && (
              <View style={styles.resolvedStatus}>
                <Icons.Check size={14} color={theme.success} />
                <ThemedText type="caption" style={{ color: theme.success, fontWeight: '600' }}>
                  Replied & Resolved
                </ThemedText>
              </View>
            )}
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.ten,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  botPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    borderRadius: Radii.full,
  },
  segmentContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radii.lg,
    marginBottom: Spacing.three,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Radii.md,
  },
  segmentText: {
    fontSize: 13,
  },
  intentRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  intentChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  conversationCard: {
    marginBottom: Spacing.three,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 4,
  },
  intentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  messageBubble: {
    padding: Spacing.three,
    borderRadius: Radii.lg,
    marginBottom: Spacing.three,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiReplyContainer: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  aiReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  aiReplyText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  replyButton: {
    alignSelf: 'flex-start',
  },
  resolvedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
});
