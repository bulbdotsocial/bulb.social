import React, { useState, useEffect } from 'react';
import ENSUser from './ENSUser';
import {
  Box,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
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

interface Post {
  id: string;
  hash: string;
  cid: string;
  address: string;
  description: string;
  created_at: string;
  tags: string[];
  private: boolean;
  imageUrl: string; // Généré à partir du CID
  likes: number; // Mock data pour l'instant
  isLiked: boolean; // Mock data pour l'instant
  comments: number; // Mock data pour l'instant
  timeAgo: string; // Calculé à partir de created_at
}

interface ApiItem {
  hash: string;
  key: string;
  value: {
    cid: string;
    description: string;
    address: string;
    created_at: string;
    tags: string[];
    private: boolean;
  };
}

const InstagramFeed: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour calculer le temps écoulé
  const getTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h`;
      } else {
        return `${diffInDays}d`;
      }
    } catch {
      return 'Unknown';
    }
  };

  // Fonction pour générer l'URL de l'image à partir du CID
  const getImageUrl = (cid: string): string => {
    // Adaptez cette URL selon votre gateway IPFS
    return `https://ipfs.io/ipfs/${cid}`;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.bulb.social/api/v0/metadata');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiItem[] = await response.json();

        // Transformez les données de l'API en format Post
        const transformedPosts: Post[] = data
          .filter(item => !item.value.private) // Filtrer les posts privés
          .map((item: ApiItem) => ({
            id: item.key,
            hash: item.hash,
            cid: item.value.cid,
            address: item.value.address,
            description: item.value.description,
            created_at: item.value.created_at,
            tags: item.value.tags,
            private: item.value.private,
            imageUrl: getImageUrl(item.value.cid),
            likes: Math.floor(Math.random() * 200), // Mock data - à remplacer par de vraies données
            isLiked: false, // Mock data - à remplacer par de vraies données
            comments: Math.floor(Math.random() * 20), // Mock data - à remplacer par de vraies données
            timeAgo: getTimeAgo(item.value.created_at),
          }));

        setPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const PostCard: React.FC<{ post: Post }> = ({ post }) => (
    <Card
      sx={{
        maxWidth: 468,
        mx: 'auto',
        mb: 3,
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <CardHeader
        avatar={<ENSUser address={post.address} avatarSize={32} linkToProfile={true} />}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title=""
        subheader={
          post.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {post.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                  }}
                />
              ))}
            </Box>
          )
        }
        sx={{ pb: 1 }}
      />

      {/* Image */}
      <CardMedia
        component="img"
        image={post.imageUrl}
        alt={post.description}
        sx={{
          aspectRatio: '1/1',
          objectFit: 'cover',
        }}
        onError={(e) => {
          // Fallback en cas d'erreur de chargement d'image
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop';
        }}
      />

      {/* Actions */}
      <CardActions sx={{ px: 2, py: 1, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" sx={{ p: 0.5 }}>
            {post.isLiked ? (
              <FavoriteIcon sx={{ color: '#ED4956', fontSize: 24 }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 24 }} />
            )}
          </IconButton>
          <IconButton size="small" sx={{ p: 0.5 }}>
            <CommentIcon sx={{ fontSize: 24 }} />
          </IconButton>
          <IconButton size="small" sx={{ p: 0.5 }}>
            <ShareIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Box>
        <IconButton size="small" sx={{ p: 0.5 }}>
          <BookmarkIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </CardActions>

      {/* Content */}
      <CardContent sx={{ pt: 0, pb: 2 }}>
        {/* Likes */}
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {post.likes.toLocaleString()} likes
        </Typography>

        {/* Caption */}
        <Box sx={{ mb: 1 }}>
          <ENSUser
            address={post.address}
            showAvatar={false}
            typography="body2"
            linkToProfile={true}
          />
          <Typography
            component="span"
            variant="body2"
            color="text.primary"
            sx={{ ml: 1 }}
          >
            {post.description}
          </Typography>
        </Box>

        {/* Comments */}
        {post.comments > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, cursor: 'pointer' }}
          >
            View all {post.comments} comments
          </Typography>
        )}

        {/* Time */}
        <Typography variant="caption" color="text.secondary">
          {post.timeAgo.toUpperCase()}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
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

  if (error) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}>
        <Alert severity="error" sx={{ maxWidth: 468, mx: 'auto' }}>
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
          {posts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              No posts available
            </Typography>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
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
                          bgcolor: 'primary.50',
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
};

export default InstagramFeed;
