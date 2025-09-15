'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Upload } from '@/types';
import MediaGalleryModal from '@/components/MediaGalleryModal';

export default function SharedUserMediaPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [mediaItems, setMediaItems] = useState<Upload['mediaItems']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUserMediaItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const q = query(collection(db, 'mediaItems'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const allUserMedia: Upload['mediaItems'] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as Upload;
          if (data.mediaItems) {
            allUserMedia.push(...data.mediaItems.map(item => ({ ...item, docId: docSnap.id })));
          }
        });
        setMediaItems(allUserMedia);

        if (allUserMedia.length > 0) {
          setIsGalleryOpen(true);
        } else {
          setError('No media found for this user.');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching shared user media:', err);
          setError('Failed to load media. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserMediaItems();
  }, [userId]);

  const handleCloseGallery = () => {
    setIsGalleryOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700">Loading media...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (mediaItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
        <p>No media items to display.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Shared User Media Collection</h1>
      {isGalleryOpen && mediaItems.length > 0 && (
        <MediaGalleryModal
          mediaItems={mediaItems}
          isOpen={isGalleryOpen}
          onClose={handleCloseGallery}
          docId={userId}
          onMediaItemDeleted={() => { /* No deletion in shared view */ } } // No deletion in shared view
          canDelete={false}
          canCloseModal={false}
        />
      )}
    </div>
  );
}
