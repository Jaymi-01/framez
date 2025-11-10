import React, { useEffect } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/colors';

const SplashScreen = () => {
  const scaleAnim = new Animated.Value(0.1); // Start small

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1.2, 
      duration: 1500,
      easing: Easing.elastic(1), 
      useNativeDriver: true,
    }).start(() => {
    });
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/images/framez-transparent.jpg')}
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background, 
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;