/**
 * Types pour les props des composants
 */

import { ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material';

export interface LayoutProps {
  children: ReactNode;
}

export interface CameraProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export interface CropSelectorProps {
  open: boolean;
  onClose: () => void;
  imageFile: File;
  onCropComplete: (croppedFile: File) => void;
}

export interface CreateProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onProfileCreated?: () => void;
}

export interface UpdateProfileDialogProps {
  open: boolean;
  onClose: () => void;
  currentProfile?: {
    username: string;
    bio: string;
    profilePicture: string;
    isPublic: boolean;
  };
  onProfileUpdated?: () => void;
}

export interface ProtectedRouteProps {
  children: ReactNode;
}

export interface ProfilesCounterProps {
  sx?: SxProps<Theme>;
}

export interface BaseComponentProps {
  sx?: SxProps<Theme>;
  className?: string;
}
