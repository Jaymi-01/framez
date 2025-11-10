import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useAuth } from '../../src/context/AuthContext';
import SplashScreen from '../../src/screens/SplashScreen';
import { COLORS } from '../../src/theme/colors';

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
      return <SplashScreen />; 
  }
  
  if (!user) {
      return <Redirect href="/auth/login" />; 
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.background, 
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarShowLabel: false, 
        tabBarStyle: { 
            backgroundColor: COLORS.background,
            borderTopWidth: 1,
            borderTopColor: COLORS.textSecondary + '20',
        },
      }}
    >
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Framez',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="newPost"
        options={{
          title: 'New Frame',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size + 8} color={COLORS.accent} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}