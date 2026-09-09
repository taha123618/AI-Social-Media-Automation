import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge, SocialPlatform } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useInboxQuery } from '@/hooks/queries/use-inbox-query';
import { useInboxMutations } from '@/hooks/mutations/use-inbox-mutations';
import { Conversation } from '@/types/api';

type TabSection = 'MESSAGES' | 'COMMENTS';

export default function InboxScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabSection>('MESSAGES');
  const [selectedIntent, setSelectedIntent] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBotActive, setIsBotActive] = useState<boolean>(true);

  // Thread Reply Modal State
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const { data: conversations = [], isLoading, refetch } = useInboxQuery();
  const { sendReplyMutation } = useInboxMutations();

  const handleTabChange = (tab: TabSection) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const toggleBot = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const nextState = !isBotActive;
    setIsBotActive(nextState);
    Alert.alert(
      nextState ? 'Bot Activated' : 'Bot Paused',
      nextState
        ? 'Autonomous AI DM responder is now live and evaluating incoming leads.'
        : 'Autonomous AI DM responder is paused. Inbound messages require manual triage.'
    );
  };

  const intentCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: conversations.length };
    conversations.forEach((c) => {
      counts[c.intentTag] = (counts[c.intentTag] || 0) + 1;
    });
    return counts;
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c: Conversation) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.senderName.toLowerCase().includes(q);
        const matchesMsg = c.lastMessage.toLowerCase().includes(q);
        const matchesPlatform = c.platform.toLowerCase().includes(q);
        const matchesTag = c.intentTag.toLowerCase().includes(q);
        if (!matchesName && !matchesMsg && !matchesPlatform && !matchesTag) {
          return false;
        }
      }
      // Intent filter
      if (selectedIntent !== 'ALL' && c.intentTag !== selectedIntent) {
        return false;
      }
      return true;
    });
  }, [conversations, selectedIntent, searchQuery]);

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

  const openReplyModal = (conv: Conversation, initialText?: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedConv(conv);
    setReplyText(initialText ?? conv.suggestedReply ?? '');
  };

  const closeReplyModal = () => {
    setSelectedConv(null);
    setReplyText('');
  };

  const handleSendReply = (conversationId: string, text: string) => {
    if (!text.trim()) {
      Alert.alert('Empty Reply', 'Please enter a message to reply.');
      return;
    }
    sendReplyMutation.mutate(
      { conversationId, replyText: text.trim() },
      {
        onSuccess: () => {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          Alert.alert('Reply Dispatched', 'Your response has been sent to the prospect.');
          closeReplyModal();
        },
        onError: (err: any) => {
          Alert.alert('Dispatch Error', err?.message || 'Failed to deliver response.');
        },
      }
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title & Interactive Bot Pill */}
      <View style={styles.header}>
        <View>
          <ThemedText type="subtitle">Social Inbox</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            Omnichannel DMs & Autonomous Sales Bot
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={toggleBot}
          activeOpacity={0.8}
          style={[
            styles.botPill,
            {
              backgroundColor: isBotActive ? theme.primaryLight : theme.backgroundElement,
              borderColor: isBotActive ? theme.primary : theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.botIndicatorDot,
              { backgroundColor: isBotActive ? theme.success : theme.textMuted },
            ]}
          />
          <Icons.Bot size={14} color={isBotActive ? theme.primary : theme.textMuted} />
          <ThemedText
            type="caption"
            style={{
              color: isBotActive ? theme.primary : theme.textMuted,
              fontWeight: '700',
            }}
          >
            {isBotActive ? 'Bot Active' : 'Bot Paused'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        <Icons.Search size={18} color={theme.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search sender, message, or channel..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icons.Close size={16} color={theme.textMuted} />
          </TouchableOpacity>
        )}
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
            Post Comments (0)
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Intent Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.intentRow}>
        {['ALL', 'PRICING', 'LEAD', 'SUPPORT'].map((intent) => {
          const isSelected = selectedIntent === intent;
          const count = intentCounts[intent] || 0;
          return (
            <TouchableOpacity
              key={intent}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedIntent(intent);
              }}
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
                {intent} ({count})
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderConversationItem = ({ item: conv }: { item: Conversation }) => (
    <GlassCard style={styles.conversationCard}>
      {/* Sender row */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => openReplyModal(conv)}
        style={styles.senderRow}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: conv.senderAvatar }} style={styles.avatar} contentFit="cover" />
          {conv.unreadCount > 0 && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
        </View>

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
      </TouchableOpacity>

      {/* Inbound Message */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => openReplyModal(conv)}
        style={[styles.messageBubble, { backgroundColor: theme.backgroundElement }]}
      >
        <ThemedText style={styles.messageText}>{conv.lastMessage}</ThemedText>
      </TouchableOpacity>

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
          <View style={styles.actionButtonGroup}>
            <Button
              title="Approve & Send"
              size="sm"
              variant="primary"
              loading={sendReplyMutation.isPending}
              icon={<Icons.Send size={14} color="#FFFFFF" />}
              onPress={() => handleSendReply(conv.id, conv.suggestedReply || '')}
              style={styles.replyButton}
            />
            <Button
              title="Edit & Reply"
              size="sm"
              variant="outline"
              icon={<Icons.MessageCircle size={14} color={theme.primary} />}
              onPress={() => openReplyModal(conv, conv.suggestedReply)}
              style={styles.editButton}
            />
          </View>
        </View>
      )}

      {/* Write manual response if no suggestion or if pending */}
      {!conv.suggestedReply && conv.status !== 'RESOLVED' && (
        <View style={styles.manualReplyRow}>
          <Button
            title="Write Reply"
            size="sm"
            variant="outline"
            icon={<Icons.Send size={14} color={theme.primary} />}
            onPress={() => openReplyModal(conv)}
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
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlashList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={activeTab === 'COMMENTS' ? 'No Comments Yet' : 'Inbox Up to Date'}
              description={
                activeTab === 'COMMENTS'
                  ? 'There are currently no unprocessed comments on recent social media posts.'
                  : searchQuery
                    ? `No conversations match "${searchQuery}".`
                    : 'No incoming messages matching this intent filter. Autonomous bot is monitoring all connected channels.'
              }
              icon={<Icons.Inbox size={32} color={theme.primary} />}
            />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Reply Composer Modal */}
      <Modal
        visible={selectedConv !== null}
        animationType="slide"
        transparent
        onRequestClose={closeReplyModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.four,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={styles.modalRecipientInfo}>
                <Image
                  source={{ uri: selectedConv?.senderAvatar }}
                  style={styles.modalAvatar}
                  contentFit="cover"
                />
                <View>
                  <ThemedText type="defaultSemiBold">{selectedConv?.senderName}</ThemedText>
                  <View style={styles.modalBadgeRow}>
                    {selectedConv?.platform && (
                      <Badge variant="platform" platform={selectedConv.platform as SocialPlatform} />
                    )}
                    <ThemedText type="caption" style={{ color: theme.textMuted, marginLeft: 6 }}>
                      {selectedConv?.timestamp}
                    </ThemedText>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={closeReplyModal} style={styles.modalCloseBtn}>
                <Icons.Close size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Context: Sender's Message */}
              <View style={[styles.originalMessageBlock, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="caption" style={[styles.contextLabel, { color: theme.textSecondary }]}>
                  Prospect Inquiry
                </ThemedText>
                <ThemedText style={styles.originalMessageText}>
                  {selectedConv?.lastMessage}
                </ThemedText>
              </View>

              {/* AI Suggestion Quick Insert */}
              {selectedConv?.suggestedReply && (
                <View style={[styles.modalAiPill, { backgroundColor: theme.primaryLight, borderColor: theme.borderFocus }]}>
                  <View style={styles.modalAiPillHeader}>
                    <Icons.Sparkles size={14} color={theme.primary} />
                    <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                      AI Recommended Copy
                    </ThemedText>
                  </View>
                  <ThemedText type="caption" style={{ color: theme.text, marginTop: 4 }}>
                    {selectedConv.suggestedReply}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => setReplyText(selectedConv.suggestedReply || '')}
                    style={styles.useSuggestionBtn}
                  >
                    <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                      Use this template
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Reply Input Area */}
              <View style={styles.inputWrapper}>
                <ThemedText type="caption" style={styles.inputLabel}>
                  Your Response
                </ThemedText>
                <TextInput
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="Draft your reply to the prospect..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={[
                    styles.replyTextInput,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
                <ThemedText type="caption" style={styles.charCount}>
                  {replyText.length} characters
                </ThemedText>
              </View>

              {/* Modal Buttons */}
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={closeReplyModal}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Send Message"
                  variant="primary"
                  loading={sendReplyMutation.isPending}
                  icon={<Icons.Send size={16} color="#FFFFFF" />}
                  onPress={() => selectedConv && handleSendReply(selectedConv.id, replyText)}
                  style={{ flex: 1.5 }}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.ten,
  },
  headerContainer: {
    marginBottom: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  botPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  botIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
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
    marginBottom: Spacing.three,
    paddingRight: Spacing.four,
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
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.two,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    marginBottom: Spacing.two,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiReplyContainer: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    marginTop: Spacing.one,
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
    marginBottom: Spacing.two,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  replyButton: {
    alignSelf: 'flex-start',
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  manualReplyRow: {
    marginTop: Spacing.one,
    alignItems: 'flex-start',
  },
  resolvedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },

  // Reply Modal Styles
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalSheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    borderTopWidth: 1,
    maxHeight: '85%',
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.three,
  },
  modalRecipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  modalAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: Spacing.one,
  },
  modalScroll: {
    maxHeight: 400,
  },
  originalMessageBlock: {
    padding: Spacing.three,
    borderRadius: Radii.md,
    marginBottom: Spacing.three,
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  originalMessageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalAiPill: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  modalAiPillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  useSuggestionBtn: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
  },
  inputWrapper: {
    marginBottom: Spacing.four,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  replyTextInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.three,
    minHeight: 90,
    fontSize: 14,
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 4,
    color: '#71717A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
});
