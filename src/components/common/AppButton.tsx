import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
  disabled?: boolean; 
}

export const AppButton: React.FC<AppButtonProps> = ({ title, onPress, isLoading = false, style, disabled = false }) => (
  <TouchableOpacity
    style={[styles.button, style, (isLoading || disabled) && styles.disabledButton]}
    onPress={onPress}
    disabled={isLoading || disabled} 
  >
    {isLoading ? (
      <ActivityIndicator color={COLORS.background} />
    ) : (
      <Text style={styles.buttonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});