import React from 'react';
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
  id: number;
  address: string; // Ethereum address
  location?: string;
  imageUrl: string;
  likes: number;
  isLiked: boolean;
  caption: string;
  comments: number;
  timeAgo: string;
  tags: string[];
}

const InstagramFeed: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mock data for posts with Ethereum addresses
  const posts: Post[] = [
    {
      id: 1,
      address: '0x742d35Cc8B78cBA66b6c3e42F7a6e1E1E1c3A0aD', // Random address for demo
      location: 'San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
      likes: 127,
      isLiked: false,
      caption: '☀️ Solar-powered innovation! Just finished prototyping this portable charger that uses flexible solar panels. Perfect for hiking adventures! 🏔️ #SolarTech #Innovation #Sustainability #TechLife',
      comments: 8,
      timeAgo: '2 hours ago',
      tags: ['SolarTech', 'Innovation', 'Sustainability', 'TechLife'],
    },
    {
      id: 2,
      address: '0x8ba1f109551bD432803012645Hac136c27598C45', // Random address for demo
      location: 'Austin, TX',
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      likes: 89,
      isLiked: true,
      caption: '🏠 Community vibes! Working on an app concept that lets neighbors share tools and equipment. Building stronger communities one tool at a time! 🔨 #Community #SharingEconomy #AppDesign',
      comments: 12,
      timeAgo: '4 hours ago',
      tags: ['Community', 'SharingEconomy', 'AppDesign'],
    },
    {
      id: 3,
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI token address for demo
      location: 'Seattle, WA',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      likes: 234,
      isLiked: false,
      caption: '🌱 Smart plant care system in action! IoT sensors monitoring my plants while I focus on coding. Technology meets nature 🌿 #IoT #SmartHome #PlantTech #GreenTech',
      comments: 15,
      timeAgo: '6 hours ago',
      tags: ['IoT', 'SmartHome', 'PlantTech', 'GreenTech'],
    },
  ];

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
        avatar={<ENSUser address={post.address} avatarSize={32} />}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title=""
        subheader={
          post.location && (
            <Typography variant="caption" color="text.secondary">
              {post.location}
            </Typography>
          )
        }
        sx={{ pb: 1 }}
      />

      {/* Image */}
      <CardMedia
        component="img"
        image={post.imageUrl}
        alt={`Post by ${post.address}`}
        sx={{
          aspectRatio: '1/1',
          objectFit: 'cover',
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
          />
          <Typography
            component="span"
            variant="body2"
            color="text.primary"
            sx={{ ml: 1 }}
          >
            {post.caption}
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
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
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
                {['Innovation', 'TechLife', 'Sustainability', 'IoT', 'Community', 'GreenTech'].map(
                  (tag) => (
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
                  )
                )}
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InstagramFeed;
