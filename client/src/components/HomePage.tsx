import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Fab,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ProfilesCounter from './ProfilesCounter';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Comment as CommentIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface Idea {
  id: number;
  title: string;
  description: string;
  author: string;
  avatar: string;
  likes: number;
  comments: number;
  tags: string[];
  timeAgo: string;
}

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mock data for ideas
  const ideas: Idea[] = [
    {
      id: 1,
      title: 'Solar-powered phone charger for hiking',
      description: 'A lightweight, portable solar panel that can charge your phone during long hiking trips. Could be integrated into backpack straps.',
      author: 'Alex Chen',
      avatar: 'AC',
      likes: 24,
      comments: 8,
      tags: ['Technology', 'Outdoor', 'Sustainability'],
      timeAgo: '2h ago',
    },
    {
      id: 2,
      title: 'Community tool sharing app',
      description: 'An app where neighbors can share tools and equipment they don\'t use often. Reduce waste and build community connections.',
      author: 'Maria Rodriguez',
      avatar: 'MR',
      likes: 31,
      comments: 12,
      tags: ['Community', 'Sharing Economy', 'App Idea'],
      timeAgo: '4h ago',
    },
    {
      id: 3,
      title: 'Smart plant care system',
      description: 'IoT sensors that monitor soil moisture, light, and temperature for house plants, with automated watering and mobile notifications.',
      author: 'David Kim',
      avatar: 'DK',
      likes: 18,
      comments: 5,
      tags: ['IoT', 'Plants', 'Smart Home'],
      timeAgo: '6h ago',
    },
  ];

  const IdeaCard: React.FC<{ idea: Idea }> = ({ idea }) => (
    <Card
      sx={{
        mb: 2,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 32,
              height: 32,
              fontSize: '0.875rem',
              mr: 1,
            }}
          >
            {idea.avatar}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {idea.author}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {idea.timeAgo}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          {idea.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.5,
          }}
        >
          {idea.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          {idea.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                mr: 0.5,
                mb: 0.5,
                bgcolor: 'primary.50',
                color: 'primary.main',
                fontSize: '0.75rem',
              }}
            />
          ))}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <FavoriteIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ mr: 2 }}>
            {idea.likes}
          </Typography>

          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <CommentIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ mr: 2 }}>
            {idea.comments}
          </Typography>
        </Box>

        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <ShareIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
          }}
        >
          💡 Latest Ideas
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Discover innovative ideas from the community
          </Typography>
        </Box>
        
        {/* Profiles Counter for mobile */}
        {isMobile && (
          <Box sx={{ mt: 2 }}>
            <ProfilesCounter variant="compact" />
          </Box>
        )}
      </Box>

      {/* Ideas Grid */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 } }}>
        <Box sx={{ flex: { xs: 1, md: '2 1 0%' } }}>
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </Box>

        {/* Sidebar for larger screens */}
        {!isMobile && (
          <Box sx={{ flex: '1 1 0%', maxWidth: '300px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Profiles Counter */}
              <Box sx={{ position: 'sticky', top: 80 }}>
                <ProfilesCounter variant="card" />
              </Box>
              
              {/* Trending Tags */}
              <Card sx={{ position: 'sticky', top: 320 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    🔥 Trending Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {['ETHcc', 'French Riviera', 'hackathon', 'Vitalik', 'Bullrun'].map(
                      (tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          clickable
                          sx={{
                            bgcolor: 'background.default',
                            '&:hover': {
                              bgcolor: 'primary.50',
                              color: 'primary.main',
                            },
                          }}
                        />
                      )
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add idea"
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1000,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default HomePage;
