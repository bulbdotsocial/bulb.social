import React, { memo, useCallback } from 'react';
import UserDisplayComponent from './UserDisplayComponent';
import { Card as UICard, Button, Box, Typography, Chip } from './ui';
import { usePostsOptimized } from '../hooks/usePostsOptimized';
import { useResponsive } from '../hooks/useResponsive';
import {
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  useTheme,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

// Post Card Component with optimizations
const PostCard: React.FC<{ post: any }> = memo(({ post }) => {
  const handleLike = useCallback(() => {
    // TODO: Implement like functionality
    console.log('Like post:', post.id);
  }, [post.id]);

  const handleComment = useCallback(() => {
    // TODO: Implement comment functionality  
    console.log('Comment on post:', post.id);
  }, [post.id]);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Share post:', post.id);
  }, [post.id]);

  return (
    <UICard
      variant="elevated"
      interactive={false}
      sx={{
        maxWidth: 468,
        mx: 'auto',
        mb: 3,
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <CardHeader
        avatar={
          <UserDisplayComponent 
            address={post.address} 
            avatarSize={32} 
            linkToProfile={true}
            variant="full"
          />
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title=""
        subheader={
          post.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {post.tags.slice(0, 3).map((tag: string) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  clickable
                  sx={{
                    fontSize: '0.75rem',
                    height: 20,
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    },
                  }}
                />
              ))}
              {post.tags.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{post.tags.length - 3} more
                </Typography>
              )}
            </Box>
          )
        }
      />

      {/* Image */}
      {post.imageUrl && (
        <CardMedia
          component="img"
          height="400"
          image={post.imageUrl}
          alt={`Post by ${post.address}`}
          sx={{
            objectFit: 'cover',
            bgcolor: 'background.default',
          }}
          loading="lazy"
        />
      )}

      {/* Actions */}
      <CardActions disableSpacing sx={{ px: 2, py: 1 }}>
        <IconButton aria-label="add to favorites" onClick={handleLike}>
          {post.isLiked ? (
            <FavoriteIcon sx={{ color: '#ed4956' }} />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
        <IconButton aria-label="comment" onClick={handleComment}>
          <CommentIcon />
        </IconButton>
        <IconButton aria-label="share" onClick={handleShare}>
          <ShareIcon />
        </IconButton>
        <Box sx={{ marginLeft: 'auto' }}>
          <IconButton aria-label="bookmark">
            <BookmarkIcon />
          </IconButton>
        </Box>
      </CardActions>

      {/* Content */}
      <CardContent sx={{ pt: 0 }}>
        {/* Likes */}
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {post.likes} {post.likes === 1 ? 'like' : 'likes'}
        </Typography>

        {/* Caption */}
        <Box sx={{ mb: 1 }}>
          <UserDisplayComponent
            address={post.address}
            showAvatar={false}
            typography="body2"
            linkToProfile={true}
            variant="full"
          />
          <Typography
            component="span"
            variant="body2"
            sx={{ ml: 1 }}
          >
            {post.description}
          </Typography>
        </Box>

        {/* Comments */}
        {post.comments > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            View all {post.comments} comments
          </Typography>
        )}

        {/* Time */}
        <Typography variant="caption" color="text.secondary">
          {post.timeAgo.toUpperCase()}
        </Typography>
      </CardContent>
    </UICard>
  );
});

PostCard.displayName = 'PostCard';

// Main InstagramFeed Component
const InstagramFeedOptimized: React.FC = memo(() => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  
  // Use optimized posts hook
  const {
    posts,
    isLoading,
    error,
    isEmpty,
    hasMore,
    loadMore,
    likePost,
    refresh,
  } = usePostsOptimized({
    autoFetch: true,
    cacheKey: 'instagram-feed',
  });

  // Handle infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  // Loading state
  if (isLoading && posts.length === 0) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}>
        <Alert 
          severity="error" 
          sx={{ maxWidth: 468, mx: 'auto' }}
          action={
            <Button variant="outline" size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      py: { xs: 2, sm: 3 },
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 4,
        maxWidth: 975,
        mx: 'auto',
        px: { xs: 0, sm: 2 },
      }}>
        {/* Main Feed */}
        <Box sx={{
          flex: 1,
          maxWidth: 468,
        }}>
          {isEmpty ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No posts available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Be the first to share something!
              </Typography>
              <Button variant="primary" onClick={refresh}>
                Refresh
              </Button>
            </Box>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    loading={isLoading}
                    loadingText="Loading more..."
                  >
                    Load More
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Sidebar for larger screens */}
        {!isMobile && (
          <Box sx={{
            width: 293,
            pt: 2,
          }}>
            <Paper
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                position: 'sticky',
                top: 80,
              }}
              elevation={0}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                Trending Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {posts.flatMap(post => post.tags)
                  .filter((tag, index, arr) => arr.indexOf(tag) === index)
                  .slice(0, 10)
                  .map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      clickable
                      sx={{
                        bgcolor: 'background.default',
                        color: 'primary.main',
                        fontSize: '0.75rem',
                        height: 24,
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        },
                      }}
                    />
                  ))}
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
});

InstagramFeedOptimized.displayName = 'InstagramFeedOptimized';

export default InstagramFeedOptimized;
