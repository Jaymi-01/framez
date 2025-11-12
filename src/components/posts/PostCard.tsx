import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { checkIsLiked, countPostComments, countPostLikes, toggleLike } from '../../api/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { Post } from '../../types/types';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false); 

  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  const updatePostStats = async () => {
    if (!user) return;
    try {
      const liked = await checkIsLiked(user.uid, post.id);
      const count = await countPostLikes(post.id);
      const comments = await countPostComments(post.id);

      setIsLiked(liked);
      setLikeCount(count);
      setCommentCount(comments); 
    } catch (error) {
      console.error("Error updating post stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updatePostStats();
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

  const handleCommentCountChange = (newCount: number) => {
    setCommentCount(newCount);
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

      <View style={styles.actionRow}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <Ionicons 
                name={isLiked ? "heart-sharp" : "heart-outline"} 
                size={24} 
                color={isLiked ? 'red' : COLORS.textSecondary} 
              />
              <Text style={styles.countText}>{likeCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowComments(!showComments)} style={styles.actionButton}>
              <Ionicons 
                name="chatbubble-outline" 
                size={24} 
                color={COLORS.textSecondary} 
              />
              <Text style={styles.countText}>{commentCount}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {showComments && (
        <CommentSection 
          postId={post.id} 
          onCommentCountChange={handleCommentCountChange}
        />
      )}

      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 0,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary + '20',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 15,
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
  },
  text: {
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  countText: {
    marginLeft: 5,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.textSecondary + '10',
    marginTop: 0,
  }
});