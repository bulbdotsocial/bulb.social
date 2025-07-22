/**
 * Types relatifs aux posts et médias
 */

export interface PostData {
  cid: string;
  description: string;
  address: string;
  tags: string[];
  createdAt: string;
  likes?: number;
  comments?: CommentData[];
  author?: {
    address: string;
    username?: string;
    profilePicture?: string;
    ensName?: string;
  };
}

export interface CommentData {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes?: number;
}

export interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}
