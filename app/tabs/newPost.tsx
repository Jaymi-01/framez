import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { createPost } from '../../src/api/firebase';
import { AppButton } from '../../src/components/common/AppButton';
import { AppInput } from '../../src/components/common/AppInput';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/theme/colors';

export default function NewPostScreen() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  
  const handleCancelImage = () => {
      setImageUri(null);
  };

  const handleShare = async () => {
  if (!user) return;
  if (!text.trim() && !imageUri) {
    Alert.alert('Hold On', 'You need to add text or an image to share a Frame!');
    return;
  }

  setLoading(true);
  try {
    console.log("🚀 Starting post creation...");
    
    // Added a timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
    );
    
    await Promise.race([
      createPost(
        user.uid,
        user.displayName || user.email!,
        user.email!,
        text,
        imageUri || undefined
      ),
      timeoutPromise
    ]);

    console.log("✅ Post created successfully!");
    Alert.alert('Success!', 'Your Frame has been shared!');
    router.back(); 
  } catch (error) {
    console.error('❌ Post creation failed:', error);
    Alert.alert('Share Failed', error instanceof Error ? error.message : 'Could not upload your post. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <AppInput
        label="What's on your mind?"
        placeholder="Write a caption..."
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <AppButton
        title={imageUri ? "Change Image" : "Pick Image from Gallery"}
        onPress={pickImage}
        style={styles.pickButton}
      />

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
         
          <Pressable onPress={handleCancelImage} style={styles.cancelButton}>
            <Ionicons name="close-circle" size={32} color="gray" />
          </Pressable>
        </View>
      )}

      <AppButton
        title="Share Frame"
        onPress={handleShare}
        isLoading={loading}
        style={styles.shareButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickButton: {
    marginBottom: 20,
    backgroundColor: COLORS.accent, 
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
    position: 'relative', 
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  cancelButton: {
    position: 'absolute',
    top: -10, 
    right: -10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 2,
  },
  shareButton: {
    marginTop: 20,
    marginBottom: 30,
  }
});