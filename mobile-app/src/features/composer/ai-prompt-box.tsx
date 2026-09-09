import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

interface AiPromptBoxProps {
  prompt: string;
  onPromptChange: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function AiPromptBox({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
}: AiPromptBoxProps) {
  const theme = useTheme();

  return (
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
        value={prompt}
        onChangeText={onPromptChange}
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
        onPress={onGenerate}
        style={styles.generateBtn}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
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
});
