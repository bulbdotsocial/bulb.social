/**
 * Types relatifs aux utilisateurs et profils
 */

export interface UserProfileData {
  address: string;
  ensName?: string;
  contractProfile?: {
    username: string;
    profilePicture: string;
    bio: string;
    isPublic: boolean;
    profilePictureHash?: string;
    ipfsHash?: string;
  };
}

export interface ProfileData {
  address: string;
  username: string;
  profilePicture: string;
  bio: string;
  isPublic: boolean;
  profilePictureHash?: string;
  ipfsHash?: string;
  ensName?: string;
  posts?: PostData[];
  followerCount?: number;
  followingCount?: number;
}

export interface ENSUserProps {
  address: string;
  showFullAddress?: boolean;
  maxDisplayLength?: number;
  sx?: object;
}

export interface ProfileUserProps {
  address: string;
  showFullAddress?: boolean;
  maxDisplayLength?: number;
  sx?: object;
}
