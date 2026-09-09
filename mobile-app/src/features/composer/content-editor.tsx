import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { BrandGuardianBar } from './brand-guardian-bar';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface ContentEditorProps {
  content: string;
  onChangeContent: (text: string) => void;
  readingEaseScore: number;
  charsRemaining: number;
  isOverLimit: boolean;
}

export function ContentEditor({
  content,
  onChangeContent,
  readingEaseScore,
  charsRemaining,
  isOverLimit,
}: ContentEditorProps) {
  const theme = useTheme();

  return (
    <GlassCard style={styles.editorCard}>
      <TextInput
        value={content}
        onChangeText={onChangeContent}
        multiline
        numberOfLines={6}
        placeholder="Write your post here or generate using the prompt box above..."
        placeholderTextColor={theme.textMuted}
        style={[styles.mainEditor, { color: theme.text }]}
      />
      <BrandGuardianBar
        readingEaseScore={readingEaseScore}
        charsRemaining={charsRemaining}
        isOverLimit={isOverLimit}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
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
});
