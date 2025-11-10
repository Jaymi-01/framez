import { User as FirebaseAuthUser } from 'firebase/auth';

// Extend the Firebase User type for our app needs
export interface AppUser extends Pick<FirebaseAuthUser, 'uid' | 'email'> {
  displayName: string | null;
 photoURL?: string | null;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string; // ISO 8601 string or Firebase Timestamp
  text: string;
  imageUrl?: string; // Optional image
   
}