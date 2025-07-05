import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface CropSelectorProps {
  open: boolean;
  onClose: () => void;
  onCropConfirm: (croppedFile: File, previewUrl: string) => void;
  imageFile: File | null;
}

interface CropArea {
  x: number;
  y: number;
  size: number;
}

const CropSelector: React.FC<CropSelectorProps> = ({ 
  open, 
  onClose, 
  onCropConfirm, 
  imageFile 
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageFile && open) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [imageFile, open]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setContainerDimensions({ width: img.offsetWidth, height: img.offsetHeight });
      
      // Initialize crop area in the center
      const minDisplayDimension = Math.min(img.offsetWidth, img.offsetHeight);
      const initialSize = Math.min(minDisplayDimension * 0.6, 300);
      setCropArea({
        x: (img.offsetWidth - initialSize) / 2,
        y: (img.offsetHeight - initialSize) / 2,
        size: initialSize
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();
    if (action === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (isDragging) {
      setCropArea(prev => {
        const newX = Math.max(0, Math.min(containerDimensions.width - prev.size, prev.x + deltaX));
        const newY = Math.max(0, Math.min(containerDimensions.height - prev.size, prev.y + deltaY));
        return { ...prev, x: newX, y: newY };
      });
    } else if (isResizing) {
      setCropArea(prev => {
        const delta = Math.max(deltaX, deltaY);
        const newSize = Math.max(50, Math.min(
          Math.min(containerDimensions.width - prev.x, containerDimensions.height - prev.y),
          prev.size + delta
        ));
        return { ...prev, size: newSize };
      });
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleCropConfirm = () => {
    if (!imageFile || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Calculate scale factors
    const scaleX = imageDimensions.width / containerDimensions.width;
    const scaleY = imageDimensions.height / containerDimensions.height;

    // Calculate actual crop coordinates in original image dimensions
    const actualX = cropArea.x * scaleX;
    const actualY = cropArea.y * scaleY;
    const actualSize = cropArea.size * Math.min(scaleX, scaleY);

    // Set canvas to square dimensions
    canvas.width = actualSize;
    canvas.height = actualSize;

    // Create a new image for cropping
    const cropImg = new Image();
    cropImg.onload = () => {
      // Draw the cropped area
      ctx.drawImage(
        cropImg,
        actualX, actualY, actualSize, actualSize, // Source rectangle
        0, 0, actualSize, actualSize // Destination rectangle
      );

      // Convert to blob and file
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, { type: imageFile.type });
          const previewUrl = canvas.toDataURL('image/jpeg', 0.9);
          onCropConfirm(croppedFile, previewUrl);
          onClose();
        }
      }, imageFile.type, 0.9);
    };
    
    cropImg.src = imageUrl;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'background.paper',
          maxHeight: '95vh',
          margin: 1,
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">Crop Image</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Image container */}
        <Box
          ref={containerRef}
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'grey.100',
            overflow: 'hidden',
            userSelect: 'none',
            width: '100%',
            height: 'auto',
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageUrl && (
            <>
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                onLoad={handleImageLoad}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                }}
                draggable={false}
              />

              {/* Crop overlay */}
              {containerDimensions.width > 0 && (
                <>
                  {/* Dark overlays - four rectangles covering areas outside crop selection */}
                  {/* Top overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: cropArea.y,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Bottom overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: cropArea.y + cropArea.size,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Left overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: cropArea.y,
                      left: 0,
                      width: cropArea.x,
                      height: cropArea.size,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Right overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: cropArea.y,
                      left: cropArea.x + cropArea.size,
                      right: 0,
                      height: cropArea.size,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Crop area */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.size,
                      height: cropArea.size,
                      border: '2px solid white',
                      cursor: 'move',
                      bgcolor: 'transparent',
                      boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.3)',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'drag')}
                  >
                    {/* Resize handle */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        width: 16,
                        height: 16,
                        bgcolor: 'white',
                        border: '2px solid primary.main',
                        borderRadius: '50%',
                        cursor: 'se-resize',
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, 'resize');
                      }}
                    />

                    {/* Grid lines */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '33.333%',
                        width: 1,
                        height: '100%',
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        pointerEvents: 'none',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '66.666%',
                        width: 1,
                        height: '100%',
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        pointerEvents: 'none',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '33.333%',
                        left: 0,
                        width: '100%',
                        height: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        pointerEvents: 'none',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '66.666%',
                        left: 0,
                        width: '100%',
                        height: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        pointerEvents: 'none',
                      }}
                    />
                  </Box>
                </>
              )}
            </>
          )}
        </Box>

        {/* Instructions */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Drag to move • Drag the circle to resize
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleCropConfirm} variant="contained">
          Crop & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CropSelector;
