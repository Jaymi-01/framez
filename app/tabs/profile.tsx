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
import { auth, countUserTotalLikes, fetchUserPosts, updateUserProfile } from "../../src/api/firebase";
import { AppButton } from "../../src/components/common/AppButton";
import { PostCard } from "../../src/components/posts/PostCard";
import { useAuth } from "../../src/context/AuthContext";
import { COLORS } from "../../src/theme/colors";
import { Post } from "../../src/types/types";

const PROFILE_PICTURES = [
    "https://res.cloudinary.com/dquzcqxcy/image/upload/v1762779681/bc110031-06a7-460a-bf9c-545e5e896824_ghugru.jpg",
    "https://res.cloudinary.com/dquzcqxcy/image/upload/v1762779678/356306451_54b19ada-d53e-4ee9-8882-9dfed1bf1396_iv8jlz.jpg",
    "https://res.cloudinary.com/dquzcqxcy/image/upload/v1762779676/bc9fd4bd-de9b-4555-976c-8360576c6708_gspd7g.jpg",
    "https://res.cloudinary.com/dquzcqxcy/image/upload/v1762779678/27f3d5b2-1059-4123-848b-9ac4844aff7ae8_i6ujan.jpg",
    "https://res.cloudinary.com/dquzcqxcy/image/upload/v1762779677/4f357b16-1614-45a5-b043-2709189af2cf_rifs2v.jpg",
    "https://res.cloudinary.com/dquzcqxcy/image/upload/v1762779677/1e59f641-d568-4f4a-8fff-922da4c45c10_bal312.jpg",
];

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalLikes, setTotalLikes] = useState(0); // New state for Total Likes
    const [showPicturePicker, setShowPicturePicker] = useState(false);
    
    const loadUserPosts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const posts = await fetchUserPosts(user.uid);
            setUserPosts(posts);
            
            // Fetch total likes after posts are loaded
            const likesCount = await countUserTotalLikes(user.uid);
            setTotalLikes(likesCount);

        } catch (_error) {
            console.error("Error fetching profile data:", _error);
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
        } catch (_error) {
            Alert.alert("Logout Failed", "Could not log out. Please try again.");
        }
    };

    const handleSelectPicture = async (pictureUrl: string) => {
        try {
            await updateUserProfile({ photoURL: pictureUrl });

            if (auth.currentUser) {
                await auth.currentUser.reload();
            }

            setShowPicturePicker(false);
            Alert.alert("Success", "Profile picture updated!");
        } catch (_error) {
            console.error("Failed to update profile picture:", _error);
            Alert.alert("Error", "Failed to update profile picture. Check console.");
        }
    };

    if (!user) {
        return null;
    }

    const displayName = user.displayName || user.email?.split('@')[0] || "User";
    const finalProfilePicture = user.photoURL; 

    const ListHeader = () => (
        <View style={styles.profileHeader}>
            <Pressable 
                style={styles.avatarContainer}
                onPress={() => setShowPicturePicker(true)}
            >
                {finalProfilePicture ? (
                    <Image 
                        source={{ uri: finalProfilePicture }} 
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
                {/* Display Posts Count */}
                <View style={styles.statBox}>
                    <Text style={styles.statCount}>{userPosts.length}</Text>
                    <Text style={styles.statLabel}>Frames</Text>
                </View>
                {/* Display Total Likes Count */}
                <View style={styles.statBox}>
                    <Text style={styles.statCount}>{totalLikes}</Text>
                    <Text style={styles.statLabel}>Total Likes</Text>
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
            {loading && userPosts.length === 0 ? (
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
                                    <Image 
                                        source={{ uri: item }} 
                                        style={styles.pictureImage}
                                        resizeMode="cover" 
                                    />
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