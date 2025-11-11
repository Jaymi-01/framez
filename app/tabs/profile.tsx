import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchUserPosts } from "../../src/api/firebase";
import { AppButton } from "../../src/components/common/AppButton";
import { PostCard } from "../../src/components/posts/PostCard";
import { useAuth } from "../../src/context/AuthContext";
import { COLORS } from "../../src/theme/colors";
import { Post } from "../../src/types/types";

const PROFILE_PICTURES = [
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/avatars/avatar1.png",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/avatars/avatar2.png",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/avatars/avatar3.png",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/avatars/avatar4.png",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/avatars/avatar5.png",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/avatars/avatar6.png",
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicturePicker, setShowPicturePicker] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null);

  const loadUserPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const posts = await fetchUserPosts(user.uid);
      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadUserPosts();
    }, [loadUserPosts])
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert("Logout Failed", "Could not log out. Please try again.");
    }
  };

  const handleSelectPicture = async (pictureUrl: string) => {
    try {
       setSelectedPicture(pictureUrl);
      setShowPicturePicker(false);
      Alert.alert("Success", "Profile picture updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile picture.");
    }
  };

  if (!user) {
    return null;
  }

  const displayName = user.displayName || user.email?.split('@')[0] || "User";
  const profilePicture = selectedPicture || user.photoURL;

  const ListHeader = () => (
    <View style={styles.profileHeader}>
      <Pressable 
        style={styles.avatarContainer}
        onPress={() => setShowPicturePicker(true)}
      >
        {profilePicture ? (
          <Image 
            source={{ uri: profilePicture }} 
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {displayName[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.plusIconContainer}>
          <Ionicons name="add-circle" size={28} color={COLORS.accent} />
        </View>
      </Pressable>

      <Text style={styles.displayName}>{displayName}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statCount}>{userPosts.length}</Text>
          <Text style={styles.statLabel}>Frames</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statCount}>0</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>

      <AppButton
        title="Logout"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
      <Text style={styles.postsTitle}>Your Frames:</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={userPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              You haven&apos;t posted any Frames yet!
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      <Modal
        visible={showPicturePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicturePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Profile Picture</Text>
              <Pressable onPress={() => setShowPicturePicker(false)}>
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            <FlatList
              data={PROFILE_PICTURES}
              numColumns={3}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.pictureOption}
                  onPress={() => handleSelectPicture(item)}
                >
                  <Image source={{ uri: item }} style={styles.pictureImage} />
                </Pressable>
              )}
              contentContainerStyle={styles.pictureGrid}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileHeader: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "white",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary + "20",
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  plusIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: COLORS.background },
  displayName: { fontSize: 22, fontWeight: "bold", color: COLORS.textPrimary },
  email: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 15 },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statBox: { alignItems: "center" },
  statCount: { fontSize: 18, fontWeight: "bold", color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  logoutButton: { backgroundColor: "red", width: "100%", marginTop: 10 },
  postsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary + "20",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  pictureGrid: {
    padding: 10,
  },
  pictureOption: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    maxWidth: '30%',
  },
  pictureImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.textSecondary + "30",
  },
});