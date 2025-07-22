/**
 * Composant pour la création de posts
 */

import React, { useState } from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PhotoLibrary as PhotoLibraryIcon,
  CameraAlt as CameraAltIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { PostData, UploadResponse, CreatePostResponse } from '../../types';
import { API_BASE_URL } from '../../utils';

interface PostCreationProps {
  userAddress?: string;
  onPostCreated?: () => void;
}

const PostCreation: React.FC<PostCreationProps> = ({
  userAddress,
  onPostCreated,
}) => {
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCameraCapture = () => {
    // Cette fonction sera connectée au composant Camera existant
    setSpeedDialOpen(false);
    // TODO: Ouvrir le composant Camera
  };

  const handlePhotoLibrary = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedImage(file);
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
          setUploadDialogOpen(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    setSpeedDialOpen(false);
  };

  const handlePostSubmit = async () => {
    if (!selectedImage || !description.trim()) return;
    
    if (!userAddress) {
      setUploadError('No wallet address found. Please connect your wallet.');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Stage 1: Upload image to get IPFS CID
      const formData = new FormData();
      formData.append('file', selectedImage);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/api/v0/upload-pic`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      const uploadResult: UploadResponse = await uploadResponse.json();
      const cid = uploadResult.cid;
      
      if (!cid) {
        throw new Error('No CID returned from image upload');
      }
      
      // Stage 2: Create post with metadata
      const postData: PostData = {
        cid: cid,
        description: description.trim(),
        address: userAddress,
        tags: tags.split(' ').filter(tag => tag.trim().startsWith('#')),
        createdAt: new Date().toISOString(),
      };
      
      const createPostResponse = await fetch(`${API_BASE_URL}/api/v0/create-post`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!createPostResponse.ok) {
        throw new Error(`Post creation failed: ${createPostResponse.statusText}`);
      }
      
      const createPostResult: CreatePostResponse = await createPostResponse.json();
      console.log('Post created successfully:', createPostResult);
      
      // Reset form and close dialog
      handleDialogClose();
      
      // Callback pour informer le parent
      onPostCreated?.();
      
    } catch (error) {
      console.error('Error uploading post:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload post');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDialogClose = () => {
    setUploadDialogOpen(false);
    setSelectedImage(null);
    setImagePreview(null);
    setDescription('');
    setTags('');
    setUploadError(null);
    setIsUploading(false);
  };

  const speedDialActions = [
    {
      icon: <PhotoLibraryIcon />,
      name: 'Photo Library',
      onClick: handlePhotoLibrary,
    },
    {
      icon: <CameraAltIcon />,
      name: 'Camera',
      onClick: handleCameraCapture,
    },
  ];

  return (
    <>
      {/* SpeedDial pour créer un post */}
      <SpeedDial
        ariaLabel="Create post"
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          zIndex: theme.zIndex.speedDial,
        }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
        FabProps={{
          sx: {
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          },
        }}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>

      {/* Dialog pour composer le post */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create new post
          <IconButton onClick={handleDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          
          {imagePreview && (
            <Card sx={{ mb: 2 }}>
              <CardMedia
                component="img"
                image={imagePreview}
                alt="Post preview"
                sx={{
                  maxHeight: 400,
                  objectFit: 'contain',
                }}
              />
            </Card>
          )}
          
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Write a caption..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            variant="outlined"
            label="Tags (use # for hashtags)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="#photography #art #nature"
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handlePostSubmit}
            variant="contained"
            disabled={!selectedImage || !description.trim() || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? 'Posting...' : 'Share'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostCreation;
