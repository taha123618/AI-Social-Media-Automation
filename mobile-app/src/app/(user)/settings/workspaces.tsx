import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth.store';
import { Spacing, Radii } from '@/constants/theme';
import { Workspace } from '@/types/api';

export default function WorkspacesScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { workspaces, activeWorkspaceId, setActiveWorkspace, createWorkspace } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedTier, setSelectedTier] = useState<'Starter' | 'Pro' | 'Enterprise'>('Pro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectWorkspace = async (workspace: Workspace) => {
    if (workspace.id === activeWorkspaceId) return;

    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    await setActiveWorkspace(workspace.id);
    // Invalidate all active queries for the newly selected tenant
    queryClient.invalidateQueries();
  };

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) {
      Alert.alert('Required', 'Please provide a workspace name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkspace(newWorkspaceName.trim(), selectedTier);
      queryClient.invalidateQueries();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setNewWorkspaceName('');
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to create workspace.');
    } finally {
      setIsSubmitting(false);
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
          Workspaces
        </ThemedText>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [
            styles.createHeaderBtn,
            { backgroundColor: theme.primaryGlow, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Icons.Plus size={18} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <GlassCard style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primaryGlow }]}>
              <Icons.Building size={22} color={theme.primary} />
            </View>
            <View style={styles.bannerText}>
              <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                Multi-Tenant Architecture
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                SocialAI enforces strict isolation across PostgreSQL schemas and pgvector collections per workspace ID.
              </ThemedText>
            </View>
          </View>
        </GlassCard>

        {/* Workspaces List */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          YOUR WORKSPACES ({workspaces.length})
        </ThemedText>

        <View style={styles.list}>
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <Pressable
                key={ws.id}
                onPress={() => handleSelectWorkspace(ws)}
                style={({ pressed }) => [
                  styles.workspaceCard,
                  {
                    backgroundColor: isActive ? theme.cardElevated : theme.card,
                    borderColor: isActive ? theme.primary : theme.border,
                    borderWidth: isActive ? 2 : 1,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.nameRow}>
                    <View
                      style={[
                        styles.avatarSquare,
                        {
                          backgroundColor: isActive ? theme.primary : theme.backgroundElement,
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: isActive ? '#FFFFFF' : theme.text,
                          fontWeight: '800',
                          fontSize: 16,
                        }}
                      >
                        {ws.name.charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="bodyMedium" style={{ fontWeight: '700' }}>
                        {ws.name}
                      </ThemedText>
                      <ThemedText type="mono" style={{ fontSize: 11, color: theme.textMuted }}>
                        {ws.id}
                      </ThemedText>
                    </View>
                  </View>

                  {isActive ? (
                    <View style={[styles.activeIndicator, { backgroundColor: theme.primaryLight }]}>
                      <Icons.Check size={16} color={theme.primary} />
                    </View>
                  ) : null}
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.badgesRow}>
                    <Badge
                      label={ws.role}
                      variant="platform"
                      size="sm"
                      style={{ backgroundColor: theme.backgroundElement }}
                    />
                    <Badge
                      label={ws.planTier}
                      variant="status"
                      status="PUBLISHED"
                      size="sm"
                    />
                  </View>
                  {isActive && (
                    <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                      ACTIVE
                    </ThemedText>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Create Button */}
        <Button
          label="Create New Workspace"
          variant="outline"
          icon={<Icons.Plus size={18} color={theme.primary} />}
          onPress={() => setModalVisible(true)}
          style={{ marginTop: Spacing.four }}
        />
      </ScrollView>

      {/* Create Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">New Tenant Workspace</ThemedText>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={8}
                style={[styles.closeBtn, { backgroundColor: theme.backgroundElement }]}
              >
                <Icons.Close size={18} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.four }}>
              Spin up an isolated environment with dedicated brand voice, LLM credentials, and social connections.
            </ThemedText>

            <ThemedText type="caption" style={[styles.inputLabel, { color: theme.textSecondary }]}>
              WORKSPACE NAME
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="e.g. Acme Hypergrowth Media"
              placeholderTextColor={theme.textMuted}
              value={newWorkspaceName}
              onChangeText={setNewWorkspaceName}
              autoFocus
            />

            <ThemedText type="caption" style={[styles.inputLabel, { color: theme.textSecondary, marginTop: Spacing.four }]}>
              PLAN TIER
            </ThemedText>
            <View style={styles.tierSelector}>
              {(['Starter', 'Pro', 'Enterprise'] as const).map((tier) => {
                const isSelected = selectedTier === tier;
                return (
                  <Pressable
                    key={tier}
                    onPress={() => setSelectedTier(tier)}
                    style={[
                      styles.tierPill,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={{
                        color: isSelected ? '#FFFFFF' : theme.text,
                        fontWeight: '700',
                      }}
                    >
                      {tier}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                label="Create Workspace"
                variant="primary"
                loading={isSubmitting}
                onPress={handleCreate}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  createHeaderBtn: {
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
  list: {
    gap: Spacing.three,
  },
  workspaceCard: {
    borderRadius: Radii.xl,
    padding: Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  avatarSquare: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: Spacing.two,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    borderTopWidth: 1,
    padding: Spacing.five,
    paddingBottom: Platform.OS === 'ios' ? 44 : Spacing.five,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  input: {
    height: 48,
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  tierSelector: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  tierPill: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
});
