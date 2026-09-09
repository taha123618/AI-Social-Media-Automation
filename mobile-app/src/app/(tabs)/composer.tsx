import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii, PlatformColors } from '@/constants/theme';
import { postsApi } from '@/api/posts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SocialPlatform } from '@/components/ui/badge';

const ALL_PLATFORMS: Array<{ id: SocialPlatform; name: string }> = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'x', name: 'X' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
];

const PRESET_TIMES = [
  { label: 'Publish Immediately', value: 'NOW' },
  { label: 'Next Peak Slot (09:00 AM)', value: 'PEAK' },
  { label: 'Tomorrow 12:30 PM', value: 'TOMORROW_NOON' },
  { label: 'Tomorrow 06:00 PM', value: 'TOMORROW_EVE' },
];

export default function ComposerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['linkedin', 'x']);
  const [topicPrompt, setTopicPrompt] = useState('');
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Array<{ uri: string; type: 'image' | 'video' }>>([]);
  const [selectedTiming, setSelectedTiming] = useState('PEAK');
  const [isGenerating, setIsGenerating] = useState(false);

  // Platform limits (X: 280, others: 2200+)
  const minCharCap = useMemo(() => {
    if (selectedPlatforms.includes('x') || selectedPlatforms.includes('twitter')) {
      return 280;
    }
    return 2200;
  }, [selectedPlatforms]);

  // Brand Guardian metrics
  const readingEaseScore = useMemo(() => {
    if (!content.trim()) return 100;
    const words = content.trim().split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).filter(Boolean).length || 1;
    // Simplified Flesch-Kincaid representation
    const score = Math.max(50, Math.min(99, Math.round(206.835 - 1.015 * (words / sentences) - 10)));
    return score;
  }, [content]);

  const togglePlatform = (plat: SocialPlatform) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (selectedPlatforms.includes(plat)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  const handlePickMedia = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Photo library access is needed to attach media to your posts.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        const newMedia = result.assets.map((a) => ({
          uri: a.uri,
          type: (a.type === 'video' ? 'video' : 'image') as 'image' | 'video',
        }));
        setSelectedMedia((prev) => [...prev, ...newMedia]);
      }
    } catch (err) {
      console.warn('Error picking media:', err);
      Alert.alert('Media Error', 'Failed to pick image or video.');
    }
  };

  const handleRemoveMedia = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAIGenerate = async () => {
    if (!topicPrompt.trim()) {
      Alert.alert('Missing Topic', 'Please enter a topic or concept for the AI agent to write.');
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsGenerating(true);
    try {
      const generated = await postsApi.generateCopy(topicPrompt, selectedPlatforms[0]);
      setContent(generated);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert('Generation Error', 'Could not synthesize caption at this time.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createPostMutation = useMutation({
    mutationFn: (payload: any) => postsApi.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Post Scheduled!', 'Your post has been queued and validated by Brand Guardian.', [
        { text: 'View Feed', onPress: () => router.push('/(tabs)') },
      ]);
      setContent('');
      setTopicPrompt('');
      setSelectedMedia([]);
    },
    onError: () => {
      Alert.alert('Submission Error', 'Failed to schedule post.');
    },
  });

  const handleScheduleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write or generate post content before scheduling.');
      return;
    }
    createPostMutation.mutate({
      content,
      platforms: selectedPlatforms,
      status: selectedTiming === 'NOW' ? 'PUBLISHED' : 'SCHEDULED',
      scheduledFor: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
      mediaUrl: selectedMedia[0]?.uri,
      mediaType: selectedMedia[0]?.type,
    });
  };

  const charsRemaining = minCharCap - content.length;
  const isOverLimit = charsRemaining < 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle">AI Composer</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            Multi-platform publisher with real-time Brand Guardian audits
          </ThemedText>
        </View>

        {/* 1. Target Platforms */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          1. Select Platforms
        </ThemedText>
        <View style={styles.platformSelectorRow}>
          {ALL_PLATFORMS.map(({ id, name }) => {
            const isSelected = selectedPlatforms.includes(id);
            const platColor = PlatformColors[id as keyof typeof PlatformColors] || theme.primary;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => togglePlatform(id)}
                activeOpacity={0.7}
                style={[
                  styles.platformChip,
                  {
                    backgroundColor: isSelected ? `${platColor}20` : theme.backgroundElement,
                    borderColor: isSelected ? platColor : theme.border,
                  },
                ]}
              >
                <View style={[styles.platformDot, { backgroundColor: isSelected ? platColor : theme.textMuted }]} />
                <ThemedText
                  style={[
                    styles.platformChipText,
                    { color: isSelected ? platColor : theme.textSecondary, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {name}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. AI Synthesizer Prompt Box */}
        <GlassCard style={styles.aiBox}>
          <View style={styles.aiBoxHeader}>
            <View style={styles.sparkleTitle}>
              <Icons.Sparkles size={18} color={theme.primary} />
              <ThemedText type="defaultSemiBold" style={{ color: theme.primary }}>
                AI Hook & Prompt Generator
              </ThemedText>
            </View>
          </View>
          <TextInput
            value={topicPrompt}
            onChangeText={setTopicPrompt}
            placeholder="e.g. 5 tips for B2B founders to scale organic pipeline..."
            placeholderTextColor={theme.textMuted}
            style={[
              styles.promptInput,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
          />
          <Button
            title={isGenerating ? 'Synthesizing...' : 'Generate AI Copy'}
            variant="primary"
            size="sm"
            loading={isGenerating}
            icon={<Icons.Sparkles size={16} color="#FFFFFF" />}
            onPress={handleAIGenerate}
            style={styles.generateBtn}
          />
        </GlassCard>

        {/* 3. Content Editor */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          2. Post Content
        </ThemedText>
        <GlassCard style={styles.editorCard}>
          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            placeholder="Write your post here or generate using the prompt box above..."
            placeholderTextColor={theme.textMuted}
            style={[styles.mainEditor, { color: theme.text }]}
          />

          {/* Linter Bar */}
          <View style={[styles.linterBar, { borderTopColor: theme.borderSubtle }]}>
            <View style={styles.linterItem}>
              <Icons.ShieldCheck size={14} color={readingEaseScore >= 80 ? theme.success : theme.warning} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Readability:{' '}
                <ThemedText type="mono" style={{ color: readingEaseScore >= 80 ? theme.success : theme.warning }}>
                  {readingEaseScore}%
                </ThemedText>
              </ThemedText>
            </View>

            <View style={styles.linterItem}>
              <ThemedText
                type="mono"
                style={[
                  styles.charCount,
                  { color: isOverLimit ? theme.destructive : charsRemaining < 30 ? theme.warning : theme.textMuted },
                ]}
              >
                {charsRemaining} chars
              </ThemedText>
            </View>
          </View>
        </GlassCard>

        {/* 3. Media Attachments */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            3. Media Attachments ({selectedMedia.length})
          </ThemedText>
          <TouchableOpacity
            onPress={handlePickMedia}
            activeOpacity={0.7}
            style={[styles.addMediaBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
          >
            <Icons.Plus size={14} color={theme.primary} />
            <ThemedText style={[styles.addMediaText, { color: theme.primary }]}>Add Media</ThemedText>
          </TouchableOpacity>
        </View>

        {selectedMedia.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaStrip}>
            {selectedMedia.map((m, idx) => (
              <View key={`${m.uri}_${idx}`} style={[styles.mediaThumbContainer, { borderColor: theme.border }]}>
                <Image source={{ uri: m.uri }} style={styles.mediaThumb} resizeMode="cover" />
                {m.type === 'video' && (
                  <View style={styles.videoBadge}>
                    <Icons.Video size={12} color="#FFFFFF" />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => handleRemoveMedia(idx)}
                  activeOpacity={0.7}
                  style={styles.removeMediaBtn}
                >
                  <Icons.Close size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <TouchableOpacity
            onPress={handlePickMedia}
            activeOpacity={0.7}
            style={[styles.emptyMediaBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
          >
            <Icons.Image size={24} color={theme.textMuted} />
            <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.one }}>
              Attach photos or short clips from library
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* 4. Scheduling Presets */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          4. Publishing Schedule
        </ThemedText>
        <View style={styles.timingList}>
          {PRESET_TIMES.map((preset) => {
            const isSelected = selectedTiming === preset.value;
            return (
              <TouchableOpacity
                key={preset.value}
                onPress={() => setSelectedTiming(preset.value)}
                style={[
                  styles.timingItem,
                  {
                    backgroundColor: isSelected ? theme.primaryLight : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Icons.Clock size={16} color={isSelected ? theme.primary : theme.textMuted} />
                <ThemedText
                  style={[
                    styles.timingLabel,
                    { color: isSelected ? theme.primary : theme.text, fontWeight: isSelected ? '600' : '400' },
                  ]}
                >
                  {preset.label}
                </ThemedText>
                {isSelected && <Icons.Check size={16} color={theme.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Submit Button */}
        <Button
          title={selectedTiming === 'NOW' ? 'Publish Now' : 'Schedule Post'}
          variant="primary"
          size="lg"
          loading={createPostMutation.isPending}
          disabled={!content.trim() || isOverLimit}
          icon={<Icons.Send size={18} color="#FFFFFF" />}
          onPress={handleScheduleSubmit}
          style={styles.submitBtn}
        />
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
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
  },
  platformSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: Spacing.one + Spacing.half,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  platformChipText: {
    fontSize: 13,
  },
  aiBox: {
    marginBottom: Spacing.three,
  },
  aiBoxHeader: {
    marginBottom: Spacing.two,
  },
  sparkleTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    marginBottom: Spacing.two,
  },
  generateBtn: {
    alignSelf: 'flex-start',
  },
  editorCard: {
    padding: 0,
    marginBottom: Spacing.four,
  },
  mainEditor: {
    padding: Spacing.three,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 130,
    textAlignVertical: 'top',
  },
  linterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
  },
  linterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  charCount: {
    fontSize: 12,
  },
  timingList: {
    gap: Spacing.two,
    marginBottom: Spacing.six,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing.two,
  },
  timingLabel: {
    flex: 1,
    fontSize: 14,
  },
  submitBtn: {
    marginTop: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: Spacing.one,
  },
  addMediaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mediaStrip: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    marginBottom: Spacing.two,
  },
  mediaThumbContainer: {
    width: 80,
    height: 80,
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    padding: 3,
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMediaBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    marginBottom: Spacing.two,
  },
});
