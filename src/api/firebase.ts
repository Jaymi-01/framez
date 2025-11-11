import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, User as FirebaseAuthUser, getAuth, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { addDoc, collection, getDocs, getFirestore, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { Post } from '../types/types';

const firebaseConfig = {
  apiKey: "AIzaSyDvEdnCw5K7mmJwC6GNje8-b1syHwge-5M", 
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Cloudinary configuration
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = "framez"; // Must match your Cloudinary unsigned preset name


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Registers a new user with Firebase Auth and sets their display name.
 */
export const registerUser = async (email: string, password: string, displayName: string): Promise<FirebaseAuthUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
};

/**
 * Logs in an existing user.
 */
export const loginUser = async (email: string, password: string): Promise<FirebaseAuthUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Logs out the current user.
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Updates the currently logged-in user's photoURL in Firebase Auth.
 */
export const updateUserProfile = async (data: { photoURL: string | null }): Promise<void> => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    await updateProfile(currentUser, { photoURL: data.photoURL });
  } else {
    throw new Error("No authenticated user found.");
  }
};


const uploadImage = async (uri: string): Promise<string> => {
  // DEBUG: Log environment variables
  console.log("🔍 CLOUD_NAME:", CLOUD_NAME);
  console.log("🔍 UPLOAD_PRESET:", UPLOAD_PRESET);
  
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary credentials missing. Please add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME to your .env file"
    );
  }

  try {
    const formData = new FormData();
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    // Check if running on web (blob URL) or mobile (file URI)
    if (uri.startsWith('blob:') || uri.startsWith('http')) {
      // WEB: Convert blob to file
      const response = await fetch(uri);
      const blob = await response.blob();
      const file = new File([blob], 'upload.jpg', { type: blob.type });
      formData.append('file', file);
    } else {
      // MOBILE: Use file URI format
      const fileExtension = uri.split('.').pop() || 'jpg';
      formData.append('file', {
        uri,
        type: `image/${fileExtension}`,
        name: `upload.${fileExtension}`,
      } as any);
    }
    
    formData.append('upload_preset', UPLOAD_PRESET);
    console.log("📤 Uploading to:", uploadUrl);

    // Upload to Cloudinary
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log("📥 Cloudinary response:", data);

    if (!response.ok || data.error) {
      console.error("❌ Cloudinary Error:", data.error || data);
      throw new Error(
        data.error?.message || 
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }

    console.log("✅ Image uploaded successfully:", data.secure_url);
    return data.secure_url;
    
  } catch (error) {
    console.error("💥 Image upload error:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


/**
 * Creates a new post document in Firestore, handling image upload via Cloudinary.
 */
export const createPost = async (
  userId: string, 
  userName: string, 
  userEmail: string, 
  text: string, 
  imageUri?: string
): Promise<void> => {
  console.log("📝 Creating post...");
  console.log("User ID:", userId);
  console.log("User Name:", userName);
  console.log("Has image:", !!imageUri);
  
  let imageUrl: string | undefined;

  // Upload image to Cloudinary if provided
  if (imageUri) {
    console.log("📸 Uploading image...");
    imageUrl = await uploadImage(imageUri);
    console.log("✅ Image uploaded:", imageUrl);
  }

  // Create Firestore document
  console.log("💾 Saving to Firestore...");
  const postsRef = collection(db, 'posts');
  
  const postData = {
    userId,
    userName,
    userEmail,
    text,
    imageUrl: imageUrl || null,
    timestamp: serverTimestamp(),
  };
  
  console.log("Post data:", postData);
  
  try {
    const docRef = await addDoc(postsRef, postData);
    console.log("✅ Post created with ID:", docRef.id);
  } catch (error) {
    console.error("❌ Firestore error:", error);
    throw error;
  }
};


/**
 * Fetches all posts, ordered by most recent first.
 */
export const fetchAllPosts = async (): Promise<Post[]> => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    userName: doc.data().userName,
    userEmail: doc.data().userEmail,
    text: doc.data().text,
    imageUrl: doc.data().imageUrl,
    timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
  })) as Post[];
};


/**
 * Fetches posts created only by a specific user.
 */
export const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    userName: doc.data().userName,
    userEmail: doc.data().userEmail,
    text: doc.data().text,
    imageUrl: doc.data().imageUrl,
    timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
  })) as Post[];
};