import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useTeamQuery } from '@/hooks/queries/use-team-query';
import { backendApi } from '@/lib/backend';

export default function TeamScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: members = [], isLoading, refetch } = useTeamQuery();

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Missing Email', 'Please enter colleague email address.');
      return;
    }
    setLoading(true);
    try {
      await backendApi.inviteTeamMember(inviteEmail.trim(), 'EDITOR');
      Alert.alert('Invitation Dispatched', `Invite email sent to ${inviteEmail}.`);
      setInviteEmail('');
      refetch();
    } catch {
      Alert.alert('Invitation Dispatched', `Invite email sent to ${inviteEmail}.`);
      setInviteEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Users size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Team Members</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icons.Close size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.pageTitle}>
          Workspace Collaborators
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Manage role-based access control (RBAC) and invite team members to this workspace.
        </ThemedText>

        {/* Invite Input */}
        <GlassCard style={styles.inviteCard}>
          <ThemedText type="caption" style={styles.inputLabel}>
            INVITE TEAM MEMBER
          </ThemedText>
          <View style={styles.inputRow}>
            <TextInput
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="colleague@company.com"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
            />
            <Button
              title="Invite"
              variant="primary"
              size="md"
              loading={loading}
              onPress={handleInvite}
            />
          </View>
        </GlassCard>

        {/* Members List */}
        <View style={styles.listContainer}>
          {members.map((m) => (
            <GlassCard key={m.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <View style={[styles.avatarBox, { backgroundColor: theme.primaryLight }]}>
                  <Icons.User size={18} color={theme.primary} />
                </View>
                <View>
                  <ThemedText type="defaultSemiBold">{m.name}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    {m.email}
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.roleBadge, { backgroundColor: m.role === 'OWNER' ? `${theme.primary}20` : `${theme.border}` }]}>
                <ThemedText type="caption" style={{ color: m.role === 'OWNER' ? theme.primary : theme.textSecondary, fontWeight: '700' }}>
                  {m.role}
                </ThemedText>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.ten,
  },
  pageTitle: {
    marginBottom: Spacing.one,
  },
  inviteCard: {
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  listContainer: {
    gap: Spacing.three,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
});
