import { router } from 'expo-router'; // IMPORTANT: Use 'router' for navigation
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import { AppButton } from '../../src/components/common/AppButton';
import { AppInput } from '../../src/components/common/AppInput';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/theme/colors';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Too short!').required('Password is required'),
});

export default function LoginScreen() { 
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: typeof LoginSchema['__outputType']) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      router.replace('/tabs');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message.replace('Firebase: Error (auth/', '').replace(').', '').replace(/-/g, ' '));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/framez-transparent.png')} style={styles.logo} resizeMode="contain" /> 
      <Text style={styles.title}>Welcome to Framez</Text>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <AppInput
              label="Email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
              error={touched.email ? errors.email : undefined}
            />
            <AppInput
              label="Password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
              error={touched.password ? errors.password : undefined}
            />

            <AppButton
              title="Log In"
              onPress={handleSubmit}
              isLoading={loading}
              style={styles.buttonMargin}
            />
            <TouchableOpacity style={styles.link} onPress={() => router.push('/auth/signup')}>
              <Text style={styles.linkText}>Don&apos;t have an account? <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Sign Up</Text></Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 30 },
  form: { width: '100%' },
  buttonMargin: { marginTop: 20, marginBottom: 15 },
  link: { alignSelf: 'center', padding: 10 },
  linkText: { color: COLORS.textSecondary, fontSize: 14 }
});