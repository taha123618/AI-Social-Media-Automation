import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { backendApi } from '@/lib/backend';
import { GeneratedImageResult } from '@/types/api';

const ASPECT_RATIOS: Array<{ id: '1:1' | '16:9' | '9:16' | '4:5'; label: string; sub: string }> = [
  { id: '1:1', label: '1:1 Square', sub: 'Instagram / Feed' },
  { id: '4:5', label: '4:5 Portrait', sub: 'LinkedIn / IG' },
  { id: '16:9', label: '16:9 Landscape', sub: 'Twitter / YouTube' },
  { id: '9:16', label: '9:16 Reel', sub: 'TikTok / Stories' },
];

const STYLES = [
  'Photorealistic',
  'Cyberpunk Neon',
  '3D Isometric Render',
  'Minimalist Vector',
  'Cinematic Anime',
  'Luxury Studio Editorial',
];

export default function ImageGeneratorScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<'1:1' | '16:9' | '9:16' | '4:5'>('1:1');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedImageResult | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<GeneratedImageResult[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Prompt Required', 'Please enter a description for the image.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await backendApi.generateImage(prompt, selectedRatio, selectedStyle);
      setGeneratedResult(result);
      setRecentGenerations((prev) => [result, ...prev]);
    } catch {
      Alert.alert('Generation Error', 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!generatedResult?.imageUrl) return;
    try {
      await Share.share({
        title: 'Generated AI Asset',
        message: `Generated with SocialAI Image Studio: ${generatedResult.prompt}`,
        url: generatedResult.imageUrl,
      });
    } catch {
      // Ignored
    }
  };

  const handleAttachToComposer = () => {
    if (!generatedResult?.imageUrl) return;
    Alert.alert('Attached', 'Image attached to your next social post draft!');
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.backgroundElement }]}
          activeOpacity={0.7}
        >
          <Icons.Close size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="heading" style={styles.headerTitle}>
          AI Image Generator
        </ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <GlassCard style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
              <Icons.Sparkles size={24} color={theme.primary} />
            </View>
            <View style={styles.bannerText}>
              <ThemedText type="defaultSemiBold" style={{ fontWeight: '700' }}>
                Diffusion Studio 2.0
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                High-definition marketing visual synthesis optimized for multi-channel engagement.
              </ThemedText>
            </View>
          </View>
        </GlassCard>

        {/* Prompt Input */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          CREATIVE PROMPT
        </ThemedText>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="e.g. Futuristic SaaS conference on a rooftop at twilight with glowing holographic charts..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
            value={prompt}
            onChangeText={setPrompt}
          />
        </View>

        {/* Aspect Ratio Picker */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.four }]}>
          ASPECT RATIO
        </ThemedText>
        <View style={styles.ratioGrid}>
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = selectedRatio === ratio.id;
            return (
              <TouchableOpacity
                key={ratio.id}
                style={[
                  styles.ratioCard,
                  {
                    backgroundColor: isSelected ? `${theme.primary}15` : theme.backgroundElement,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedRatio(ratio.id)}
                activeOpacity={0.8}
              >
                <ThemedText
                  type="bodyMedium"
                  style={{
                    fontWeight: '700',
                    color: isSelected ? theme.primary : theme.text,
                    fontSize: 13,
                  }}
                >
                  {ratio.label}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>
                  {ratio.sub}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Visual Style Selection */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.four }]}>
          ARTISTIC STYLE
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.styleScroll}>
          {STYLES.map((style) => {
            const isSelected = selectedStyle === style;
            return (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedStyle(style)}
                activeOpacity={0.8}
              >
                <ThemedText
                  type="caption"
                  style={{
                    color: isSelected ? '#FFFFFF' : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {style}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Generate Button */}
        <Button
          label={isGenerating ? 'Synthesizing Visual...' : 'Generate Image (1 Credit)'}
          variant="primary"
          size="lg"
          loading={isGenerating}
          icon={<Icons.Sparkles size={18} color="#FFFFFF" />}
          onPress={handleGenerate}
          style={{ marginTop: Spacing.five }}
        />

        {/* Generated Image Result Display */}
        {generatedResult && (
          <View style={styles.resultSection}>
            <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              OUTPUT PREVIEW
            </ThemedText>
            <GlassCard style={styles.resultCard}>
              <Image
                source={{ uri: generatedResult.imageUrl }}
                style={[
                  styles.previewImage,
                  {
                    aspectRatio:
                      generatedResult.aspectRatio === '16:9'
                        ? 16 / 9
                        : generatedResult.aspectRatio === '9:16'
                        ? 9 / 16
                        : generatedResult.aspectRatio === '4:5'
                        ? 4 / 5
                        : 1,
                  },
                ]}
                resizeMode="cover"
              />
              <View style={styles.resultMeta}>
                <ThemedText type="caption" style={{ color: theme.textSecondary, fontWeight: '600' }}>
                  Style: {generatedResult.style} • {generatedResult.aspectRatio}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textMuted, marginTop: 2 }} numberOfLines={2}>
                  "{generatedResult.prompt}"
                </ThemedText>

                <View style={styles.actionRow}>
                  <Button
                    label="Attach to Draft"
                    variant="primary"
                    size="sm"
                    icon={<Icons.Check size={14} color="#FFFFFF" />}
                    onPress={handleAttachToComposer}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Share"
                    variant="outline"
                    size="sm"
                    icon={<Icons.Send size={14} color={theme.text} />}
                    onPress={handleShare}
                  />
                </View>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Generation History Vault */}
        {recentGenerations.length > 1 && (
          <View style={{ marginTop: Spacing.five }}>
            <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              RECENT SYNTHESES
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.three }}>
              {recentGenerations.slice(1).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.historyThumbContainer, { borderColor: theme.border }]}
                  onPress={() => setGeneratedResult(item)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.historyThumb} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
  backBtn: {
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
    marginBottom: Spacing.two,
  },
  inputContainer: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  input: {
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
    minHeight: 64,
  },
  ratioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  ratioCard: {
    width: '48%',
    padding: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  styleScroll: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  styleChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  resultSection: {
    marginTop: Spacing.five,
  },
  resultCard: {
    padding: Spacing.three,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    borderRadius: Radii.md,
  },
  resultMeta: {
    marginTop: Spacing.three,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  historyThumbContainer: {
    width: 80,
    height: 80,
    borderRadius: Radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  historyThumb: {
    width: '100%',
    height: '100%',
  },
});
