import * as FileSystem from 'expo-file-system/legacy';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, User as FirebaseAuthUser, getAuth, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { Platform } from 'react-native';
import { Post } from '../types/types';

const firebaseConfig = {
    apiKey: "AIzaSyDvEdnCw5K7mmJwC6GNje8-b1syHwge-5M", 
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = "framez"; 


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


export const registerUser = async (email: string, password: string, displayName: string): Promise<FirebaseAuthUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
};

export const loginUser = async (email: string, password: string): Promise<FirebaseAuthUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const logoutUser = async (): Promise<void> => {
    await signOut(auth);
};

export const updateUserProfile = async (data: { photoURL: string | null }): Promise<void> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        await updateProfile(currentUser, { photoURL: data.photoURL });
    } else {
        throw new Error("No authenticated user found.");
    }
};


const uploadImage = async (uri: string): Promise<string> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error(
            "Cloudinary credentials missing. Please add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME to your .env file"
        );
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        if (Platform.OS === 'web') {
            const response = await fetch(uri);
            const blob = await response.blob();
            formData.append('file', blob as any); 

        } else {
            const base64Image = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64', 
            });
            formData.append('file', `data:image/jpeg;base64,${base64Image}`);
        }
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {},
        });

        const data = await response.json();
        
        if (!response.ok || data.error) {
            console.error("❌ Cloudinary Error:", data.error || data);
            throw new Error(
                data.error?.message || 
                `Upload failed: ${response.status} ${response.statusText}`
            );
        }

        return data.secure_url;
        
    } catch (error) {
        console.error("💥 Image upload error:", error);
        throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const createPost = async (
    userId: string, 
    userName: string, 
    userEmail: string, 
    text: string, 
    imageUri?: string
): Promise<void> => {
    
    let imageUrl: string | undefined;

    if (imageUri) {
        imageUrl = await uploadImage(imageUri);
    }

    const postsRef = collection(db, 'posts');
    
    const postData = {
        userId,
        userName,
        userEmail,
        text,
        imageUrl: imageUrl || null,
        timestamp: serverTimestamp(),
    };
    
    try {
        await addDoc(postsRef, postData);
    } catch (error) {
        console.error("❌ Firestore error:", error);
        throw error;
    }
};

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

export const fetchUserPosts = async (userId: string): Promise<Post[]> => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        userName: doc.data().userName,
        userEmail: doc.data().userEmail,
        text: doc.data().text,
        imageUrl: doc.data().imageUrl,
        timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
    })) as Post[];
    
    posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return posts;
};


export const toggleLike = async (userId: string, postId: string, isLiked: boolean): Promise<void> => {
    const likeRef = doc(db, 'likes', `${postId}_${userId}`);
    
    if (isLiked) {
        await deleteDoc(likeRef);
    } else {
        await setDoc(likeRef, {
            postId: postId,
            userId: userId,
            timestamp: serverTimestamp()
        });
    }
};

export const checkIsLiked = async (userId: string, postId: string): Promise<boolean> => {
    const likeRef = doc(db, 'likes', `${postId}_${userId}`);
    const docSnap = await getDoc(likeRef);
    return docSnap.exists();
};

export const countPostLikes = async (postId: string): Promise<number> => {
    const likesRef = collection(db, 'likes');
    const q = query(likesRef, where('postId', '==', postId));
    const snapshot = await getDocs(q);
    return snapshot.size;
};

export const countUserTotalLikes = async (userId: string): Promise<number> => {
    const postsRef = collection(db, 'posts');
    const postsQuery = query(postsRef, where('userId', '==', userId));
    const postsSnapshot = await getDocs(postsQuery);
    
    if (postsSnapshot.empty) {
        return 0;
    }

    let totalLikes = 0;
    
    for (const postDoc of postsSnapshot.docs) {
        const postId = postDoc.id;
        const likesCount = await countPostLikes(postId);
        totalLikes += likesCount;
    }

    return totalLikes;
};