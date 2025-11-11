import { router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import { AppButton } from '../../src/components/common/AppButton';
import { AppInput } from '../../src/components/common/AppInput';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/theme/colors';

const SignUpSchema = Yup.object().shape({
  displayName: Yup.string().min(3, 'Too short!').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function SignUpScreen() {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (values: typeof SignUpSchema['__outputType']) => {
    setLoading(true);
    try {
      await signup(values.email, values.password, values.displayName);
      router.replace('/tabs');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message.replace('Firebase: Error (auth/', '').replace(').', '').replace(/-/g, ' '));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Image source={require('../../assets/images/framez-transparent.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Create Your Framez Account</Text>

        <Formik
          initialValues={{ displayName: '', email: '', password: '' }}
          validationSchema={SignUpSchema}
          onSubmit={handleSignUp}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <AppInput
                label="Your Name"
                onChangeText={handleChange('displayName')}
                onBlur={handleBlur('displayName')}
                value={values.displayName}
                autoCapitalize="words"
                error={touched.displayName ? errors.displayName : undefined}
              />
              <AppInput
                label="Email Address"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
                error={touched.email ? errors.email : undefined}
              />
              <AppInput
                label="Password (min 6 characters)"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                secureTextEntry
                error={touched.password ? errors.password : undefined}
              />

              <AppButton
                title="Sign Up"
                onPress={handleSubmit}
                isLoading={loading}
                style={styles.buttonMargin}
              />
              <TouchableOpacity style={styles.link} onPress={() => router.push('/auth/login')}>
                <Text style={styles.linkText}>Already have an account? <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Log In</Text></Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', backgroundColor: COLORS.background },
  container: { padding: 25, alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 30, textAlign: 'center' },
  form: { width: '100%' },
  buttonMargin: { marginTop: 20, marginBottom: 15 },
  link: { alignSelf: 'center', padding: 10 },
  linkText: { color: COLORS.textSecondary, fontSize: 14 }
});