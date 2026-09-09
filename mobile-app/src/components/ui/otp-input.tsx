import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  onResend?: () => void;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  onResend,
}: OtpInputProps) {
  const theme = useTheme();
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const chars = value.split('');

    if (cleanText.length > 0) {
      chars[index] = cleanText[cleanText.length - 1];
      const nextValue = chars.join('').slice(0, length);
      onChange(nextValue);

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      } else if (nextValue.length === length && onComplete) {
        onComplete(nextValue);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const chars = value.split('');
        chars[index - 1] = '';
        onChange(chars.join(''));
      } else {
        const chars = value.split('');
        chars[index] = '';
        onChange(chars.join(''));
      }
    }
  };

  const handleResendClick = () => {
    if (countdown > 0) return;
    setCountdown(60);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onResend?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.cellsRow}>
        {Array.from({ length }).map((_, idx) => {
          const digit = value[idx] || '';
          const isFocused = idx === value.length || (idx === length - 1 && value.length === length);

          return (
            <TextInput
              key={idx}
              ref={(ref) => {
                inputsRef.current[idx] = ref;
              }}
              value={digit}
              onChangeText={(text) => handleDigitChange(text, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              style={[
                styles.cell,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: isFocused ? theme.primary : digit ? theme.borderSubtle : theme.border,
                  color: theme.text,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Resend & Countdown row */}
      <View style={styles.resendRow}>
        <ThemedText type="caption" style={{ color: theme.textMuted }}>
          Didn't receive code?{' '}
        </ThemedText>
        <TouchableOpacity
          onPress={handleResendClick}
          disabled={countdown > 0}
          activeOpacity={0.7}
        >
          <ThemedText
            type="caption"
            style={{
              color: countdown > 0 ? theme.textMuted : theme.primary,
              fontWeight: '700',
            }}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  cellsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  cell: {
    width: 46,
    height: 54,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
});
