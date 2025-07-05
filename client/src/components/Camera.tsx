import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  FlipCameraAndroid as FlipCameraIcon,
  RadioButtonChecked as CaptureIcon,
} from '@mui/icons-material';

interface CameraProps {
  open: boolean;
  onClose: () => void;
  onCapture: (imageBlob: Blob) => void;
}

const Camera: React.FC<CameraProps> = ({ open, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Start camera
  const startCamera = async (currentFacingMode: 'user' | 'environment') => {
    console.log('Starting camera with facing mode:', currentFacingMode);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported on this device');
      return;
    }

    setLoading(true);
    setError('');
    setVideoLoaded(false);

    try {
      // Stop existing stream first
      if (streamRef.current) {
        console.log('Stopping existing stream');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        },
        audio: false,
      };

      console.log('Requesting media with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got media stream:', mediaStream);
      
      streamRef.current = mediaStream;

      if (videoRef.current) {
        console.log('Setting video source');
        videoRef.current.srcObject = mediaStream;
        
        // Add event listeners for video events
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setVideoLoaded(true);
        };
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play');
        };
        
        videoRef.current.onplaying = () => {
          console.log('Video is playing');
        };
        
        try {
          await videoRef.current.play();
          console.log('Video play started successfully');
        } catch (playError) {
          console.error('Video play error:', playError);
          // Handle AbortError gracefully - expected when switching cameras
          if (playError instanceof Error && playError.name === 'AbortError') {
            console.log('Video play was interrupted, likely due to camera switch');
          } else {
            console.log('Video play error:', playError);
          }
        }
      }
    } catch (err: unknown) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Failed to access camera';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device.';
        } else if (err.name === 'AbortError') {
          // Handle the AbortError gracefully - it's expected when switching cameras
          console.log('Camera start was aborted, likely due to camera switch');
          return;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get available devices
  const getAvailableDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (err) {
      console.error('Error getting devices:', err);
    }
  };

  // Toggle camera facing mode
  const toggleCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
  };

  // Handle dialog close
  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVideoLoaded(false);
    onClose();
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        handleClose();
      }
    }, 'image/jpeg', 0.9);
  };

  // Effect for when dialog opens/closes
  useEffect(() => {
    if (open) {
      getAvailableDevices();
      startCamera(facingMode);
    } else {
      // Cleanup when dialog closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setVideoLoaded(false);
    }

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setVideoLoaded(false);
    };
  }, [open, facingMode]); // Include facingMode to restart camera when it changes

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'black',
          m: 0,
          borderRadius: 0,
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'black' }}>
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Camera toggle button */}
        {devices.length > 1 && (
          <IconButton
            onClick={toggleCamera}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <FlipCameraIcon />
          </IconButton>
        )}

        {/* Video stream */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'black',
          }}
        >
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress sx={{ color: 'white' }} />
              <Typography variant="body2" sx={{ color: 'white' }}>
                Starting camera...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ m: 2, maxWidth: 400 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && !videoLoaded && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress sx={{ color: 'white' }} />
              <Typography variant="body2" sx={{ color: 'white' }}>
                Loading video stream...
              </Typography>
            </Box>
          )}

          {!loading && !error && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: videoLoaded ? 'block' : 'none',
                }}
              />

              {/* Show debug info */}
              {!videoLoaded && (
                <Typography variant="caption" sx={{ color: 'white', position: 'absolute', top: 60 }}>
                  Video stream: {streamRef.current ? 'Connected' : 'Not connected'}
                </Typography>
              )}

              {/* Capture button - only show when video is loaded */}
              {videoLoaded && (
                <IconButton
                  onClick={capturePhoto}
                  sx={{
                    position: 'absolute',
                    bottom: 32,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'white',
                    color: 'primary.main',
                    width: 80,
                    height: 80,
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  <CaptureIcon sx={{ fontSize: 40 }} />
                </IconButton>
              )}
            </>
          )}
        </Box>

        {/* Hidden canvas for capturing */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Camera;
