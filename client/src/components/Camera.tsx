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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [videoReady, setVideoReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const startCamera = async () => {
    console.log('Starting camera...');
    console.log(`URL: ${window.location.href}`);
    console.log(`Secure context: ${window.isSecureContext}`);
    
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 } // Square aspect ratio
        }
      });

      console.log(`Got stream with ${mediaStream.getTracks().length} tracks`);
      setStream(mediaStream);

      if (videoRef.current) {
        console.log('Setting stream to video element...');
        videoRef.current.srcObject = mediaStream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log(`Video metadata loaded: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
          setVideoReady(true);
        };

        try {
          await videoRef.current.play();
          console.log('Video started playing');
        } catch (playError) {
          console.log(`Play error: ${playError}`);
        }
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.log(`Error: ${message}`);
      setError(message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVideoReady(false);
    console.log('Camera stopped');
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
    stopCamera();
    setTimeout(() => startCamera(), 100);
  };

  // Handle dialog close
  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Capture photo from current video frame
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Calculate square dimensions
    const minDimension = Math.min(video.videoWidth, video.videoHeight);
    const xOffset = (video.videoWidth - minDimension) / 2;
    const yOffset = (video.videoHeight - minDimension) / 2;

    // Set canvas to square dimensions
    canvas.width = minDimension;
    canvas.height = minDimension;

    // Capture square crop from center of video stream
    context.drawImage(
      video,
      xOffset, yOffset, minDimension, minDimension, // Source rectangle (square crop from center)
      0, 0, minDimension, minDimension // Destination rectangle (full canvas)
    );

    // Convert captured frame to high-quality JPEG
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        handleClose();
      }
    }, 'image/jpeg', 0.9);
  };

  useEffect(() => {
    if (open) {
      setError('');
      getAvailableDevices();
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

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

        {/* Video stream container */}
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
          {error && (
            <Alert severity="error" sx={{ m: 2, maxWidth: 400 }}>
              {error}
            </Alert>
          )}

          {!error && (
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
                  display: videoReady ? 'block' : 'none',
                }}
              />

              {!videoReady && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CircularProgress sx={{ color: 'white' }} />
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Starting camera...
                  </Typography>
                </Box>
              )}

              {/* Capture button - only show when video is ready */}
              {videoReady && (
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
