import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import { COLORS } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ 
        headerShown: false, 
        contentStyle: { backgroundColor: COLORS.background }
      }} />
    </AuthProvider>
  );
}