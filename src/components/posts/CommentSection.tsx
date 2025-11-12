import { formatDistanceToNow } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { addComment, Comment, fetchComments } from '../../api/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { AppButton } from '../common/AppButton';

interface CommentSectionProps {
    postId: string;
    onCommentCountChange?: (count: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentCountChange }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadComments = useCallback(async () => {
        setLoadingComments(true);
        try {
            const fetchedComments = await fetchComments(postId);
            setComments(fetchedComments);
            if (onCommentCountChange) {
                onCommentCountChange(fetchedComments.length);
            }
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setLoadingComments(false);
        }
    }, [postId, onCommentCountChange]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleAddComment = async () => {
        if (!user || !commentText.trim()) return;

        setSubmitting(true);
        const newCommentText = commentText.trim();
        
        try {
            setCommentText('');
            await addComment(postId, user.uid, user.displayName || user.email!, newCommentText);
            await loadComments();
        } catch (error) {
            Alert.alert("Error", "Failed to post comment.");
            console.error("Comment submission failed:", error);
            await loadComments();
        } finally {
            setSubmitting(false);
        }
    };
    
    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentContainer}>
            <Text style={styles.commentUser}>{item.userName}</Text>
            <Text style={styles.commentText}>{item.text}</Text>
            <Text style={styles.commentTime}>
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.commentHeader}>Comments ({comments.length})</Text>
            
            {loadingComments && comments.length === 0 ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={item => item.id} 
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={styles.emptyText}>No comments yet.</Text>}
                />
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    editable={!submitting}
                />
                <AppButton
                    title={submitting ? "..." : "Post"}
                    onPress={handleAddComment}
                    isLoading={submitting}
                    style={styles.postButton}
                    disabled={submitting || commentText.trim().length === 0}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        paddingHorizontal: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: COLORS.background,
    },
    commentHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        paddingTop: 10,
        marginBottom: 5,
    },
    commentContainer: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    commentUser: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginRight: 5,
    },
    commentText: {
        fontSize: 13,
        color: COLORS.textPrimary,
        flexShrink: 1,
    },
    commentTime: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginLeft: 'auto',
        alignSelf: 'center',
    },
    emptyText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        paddingVertical: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 10,
    },
    commentInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.textSecondary + '50',
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: COLORS.background,
        fontSize: 14,
        color: COLORS.textPrimary,
        textAlignVertical: 'top',
    },
    postButton: {
        width: 80,
        minHeight: 40,
        padding: 8,
    }
});