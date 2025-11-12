import { User as FirebaseAuthUser } from 'firebase/auth';

export interface AppUser extends Pick<FirebaseAuthUser, 'uid' | 'email'> {
  displayName: string | null;
 photoURL?: string | null;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  text: string;
  imageUrl?: string;
   
}