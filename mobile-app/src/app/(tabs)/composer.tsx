import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { backendApi } from '@/lib/backend';
import { usePostMutations } from '@/hooks/mutations/use-post-mutations';
import { SocialPlatform } from '@/types/api';
import {
  PlatformSelector,
  AiPromptBox,
  ContentEditor,
  MediaControls,
  ScheduleSelector,
  SelectedMediaItem,
} from '@/features/composer';

export default function ComposerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { createPostMutation } = usePostMutations();

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['linkedin', 'x']);
  const [topicPrompt, setTopicPrompt] = useState('');
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<SelectedMediaItem[]>([]);
  const [selectedTiming, setSelectedTiming] = useState('PEAK');
  const [isGenerating, setIsGenerating] = useState(false);

  // Platform limits (X: 280, others: 2200+)
  const minCharCap = useMemo(() => {
    if (selectedPlatforms.includes('x')) {
      return 280;
    }
    return 2200;
  }, [selectedPlatforms]);

  // Brand Guardian metrics (Flesch-Kincaid estimate)
  const readingEaseScore = useMemo(() => {
    if (!content.trim()) return 100;
    const words = content.trim().split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).filter(Boolean).length || 1;
    const score = Math.max(50, Math.min(99, Math.round(206.835 - 1.015 * (words / sentences) - 10)));
    return score;
  }, [content]);

  const charsRemaining = minCharCap - content.length;
  const isOverLimit = charsRemaining < 0;

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
        const newMedia: SelectedMediaItem[] = result.assets.map((a) => ({
          uri: a.uri,
          type: a.type === 'video' ? 'video' : 'image',
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
      const generated = await backendApi.generateCopy(topicPrompt, selectedPlatforms[0]);
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

  const handleScheduleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write or generate post content before scheduling.');
      return;
    }

    createPostMutation.mutate(
      {
        content,
        platforms: selectedPlatforms,
        status: selectedTiming === 'NOW' ? 'PUBLISHED' : 'SCHEDULED',
        scheduledFor: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
        mediaUrl: selectedMedia[0]?.uri,
        mediaType: selectedMedia[0]?.type,
      },
      {
        onSuccess: () => {
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
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: Spacing.four }}>
          <ThemedText type="title" style={{ fontSize: 24, fontWeight: '800' }}>
            AI Post Composer
          </ThemedText>
        </View>

        {/* 1. Target Platforms Selector */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          1. Destination Channels
        </ThemedText>
        <PlatformSelector selectedPlatforms={selectedPlatforms} onChange={setSelectedPlatforms} />

        {/* 2. AI Hook & Copy Generator */}
        <AiPromptBox
          prompt={topicPrompt}
          onPromptChange={setTopicPrompt}
          onGenerate={handleAIGenerate}
          isGenerating={isGenerating}
        />

        {/* 3. Post Content Editor with Brand Guardian Linter */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          2. Post Content
        </ThemedText>
        <ContentEditor
          content={content}
          onChangeContent={setContent}
          readingEaseScore={readingEaseScore}
          charsRemaining={charsRemaining}
          isOverLimit={isOverLimit}
        />

        {/* 4. Media Attachments */}
        <MediaControls
          mediaList={selectedMedia}
          onPickMedia={handlePickMedia}
          onRemoveMedia={handleRemoveMedia}
        />

        {/* 5. Publishing Schedule */}
        <ScheduleSelector selectedTiming={selectedTiming} onSelectTiming={setSelectedTiming} />

        {/* 6. Submit Action */}
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
    marginTop: Spacing.two,
    fontSize: 15,
  },
  submitBtn: {
    marginTop: Spacing.two,
    marginBottom: Spacing.six,
  },
});
