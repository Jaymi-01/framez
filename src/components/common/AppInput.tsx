import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { COLORS } from '../../theme/colors';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AppInput: React.FC<AppInputProps> = ({ label, error, ...props }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholderTextColor={COLORS.textSecondary}
      {...props}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});