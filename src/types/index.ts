import { Timestamp } from 'firebase/firestore';

export interface Upload {
  id: string;
  userId: string;
  description: string;
  price: number;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  isPublic: boolean;
  timestamp: Timestamp;
  tags?: string[];
  mediaItems: {
    id: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
  }[];
}
