# Framez 📸

A modern social media application built with React Native and Expo, where users can share their moments through images and text posts.

## Features ✨

- **User Authentication** - Secure signup and login with Firebase Authentication
- **Create Posts** - Share images with captions (images stored on Cloudinary)
- **Feed** - View all posts from users in chronological order
- **Profile Management** - Customize your profile with pre-selected avatars
- **Auto-refresh** - Seamless updates when navigating between screens
- **Responsive Design** - Works on web, iOS, and Android

## Tech Stack 🛠️

- **Frontend**: React Native (Expo)
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Image Storage**: Cloudinary
- **Navigation**: Expo Router
- **Language**: TypeScript

## Prerequisites 📋

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A Firebase account
- A Cloudinary account

## Installation 🚀

1. **Clone the repository**
   ```bash
   git clone https://github.com/jaymi-01/framez.git
   cd framez
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   ```

4. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable **Authentication** (Email/Password)
   - Create a **Firestore Database**
   - Set up Firestore security rules:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if request.auth != null; 
         }
       }
     }
     ```

5. **Configure Cloudinary**
   - Go to [Cloudinary Dashboard](https://cloudinary.com/console)
   - Navigate to **Settings** → **Upload** → **Upload presets**
   - Create an **unsigned** upload preset named `framez`
   - Note your **Cloud Name** for the `.env` file

6. **Start the development server**
   ```bash
   npx expo start
   ```

## Running the App 📱

After starting the development server:

- **Web**: Press `w` in the terminal
- **iOS Simulator**: Press `i` (requires Xcode on macOS)
- **Android Emulator**: Press `a` (requires Android Studio)
- **Physical Device**: Scan QR code with Expo Go app

## Project Structure 📁

```
framez/
├── app/
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── index.tsx    # Feed/Home screen
│   │   ├── newPost.tsx  # Create new post screen
│   │   └── profile.tsx  # User profile screen
│   ├── auth/            # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── _layout.tsx      # Root layout
├── src/
│   ├── api/
│   │   └── firebase.ts  # Firebase configuration & API calls
│   ├── components/
│   │   ├── common/      # Reusable components
│   │   └── posts/       # Post-related components
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── theme/
│   │   └── colors.ts    # App color scheme
│   └── types/
│       └── types.ts     # TypeScript type definitions
├── .env                 # Environment variables (not in repo)
└── package.json
```

## Features in Detail 🔍

### Authentication
- Email and password-based signup/login
- Display name registration
- Automatic session persistence
- Secure logout

### Posts
- Upload images from device gallery
- Add text captions
- View posts in chronological feed
- See post author information with timestamps

### Comments
- Add comments
- View comments in chronological order

### Profile
- View your post count and likes
- Customize profile picture from pre-selected avatars
- View all your posts in one place
- Persistent profile picture across sessions

## Environment Variables 🔐

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |

## Building for Production 🏗️

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

### Web
```bash
npx expo export:web
```

## Troubleshooting 🔧

**Issue**: Images not uploading
- Ensure Cloudinary upload preset is set to **unsigned**
- Verify `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- Check console for specific error messages

**Issue**: Posts not appearing
- Check Firebase security rules allow authenticated reads/writes
- Verify all Firebase environment variables are set correctly
- Clear cache: `npx expo start --clear`

**Issue**: Authentication failing
- Ensure Firebase Authentication is enabled in Firebase Console
- Verify Email/Password provider is enabled
- Check that all Firebase environment variables are correct

## Future Enhancements 🚀

- [ ] Follow/unfollow users
- [ ] Real-time notifications
- [ ] Direct messaging
- [ ] Story/reels feature
- [ ] Search functionality
- [ ] Hashtag support
- [ ] Dark mode

## LINK TO MY VIDEO DEMO

https://drive.google.com/drive/folders/1Hp8uY9hdCsJMREq6Xn_0JGwJmqjmOv08?usp=drive_link

Made with ❤️ by Jaymi.
