import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { checkIsLiked, countPostLikes, toggleLike } from '../../api/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { Post } from '../../types/types';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  const updateLikeState = async () => {
    if (!user) return;
    try {
      const liked = await checkIsLiked(user.uid, post.id);
      const count = await countPostLikes(post.id);
      setIsLiked(liked);
      setLikeCount(count);
    } catch (error) {
      console.error("Error updating like state:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateLikeState();
  }, [user, post.id]);

  const handleLike = async () => {
    if (!user || loading) return;
    
    const newIsLiked = !isLiked;
    const newCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

    setIsLiked(newIsLiked);
    setLikeCount(newCount);
    
    try {
      await toggleLike(user.uid, post.id, isLiked);
      const finalCount = await countPostLikes(post.id);
      setLikeCount(finalCount);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setIsLiked(!newIsLiked);
      setLikeCount(likeCount); 
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.author}>
          {post.userName || post.userEmail}
        </Text>
        
        <Text style={styles.timestamp}>
          {timeAgo}
        </Text>
      </View>
      
      {post.imageUrl && (
        <Image 
          source={{ uri: post.imageUrl }} 
          style={styles.image} 
          resizeMode="cover" 
        />
      )}

      <Text style={styles.text}>{post.text}</Text>

      {/* Like Button and Count */}
      <View style={styles.actionContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
            <Ionicons 
              name={isLiked ? "heart-sharp" : "heart-outline"} 
              size={24} 
              color={isLiked ? 'red' : COLORS.textSecondary} 
            />
            <Text style={styles.likeCountText}>{likeCount} Likes</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary + '20',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  author: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginVertical: 10,
  },
  text: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    paddingVertical: 5,
  },
  likeCountText: {
    marginLeft: 5,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.textSecondary + '10',
    marginTop: 15,
  }
});