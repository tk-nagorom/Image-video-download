'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Upload } from '@/types';
import MediaGalleryModal from '@/components/MediaGalleryModal'; // Import MediaGalleryModal

export default function SharedMediaPage() {
  const params = useParams();
  const docId = params.docId as string;
  const [mediaItems, setMediaItems] = useState<Upload['mediaItems']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    if (!docId) return;

    const fetchMediaItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const docRef = doc(db, 'mediaItems', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Upload;
          setMediaItems(data.mediaItems || []);
          if (data.mediaItems && data.mediaItems.length > 0) {
            setIsGalleryOpen(true); // Open gallery directly if media exists
          }
        } else {
          setError('No media found for this link.');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching shared media:', err);
          setError('Failed to load media. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMediaItems();
  }, [docId]);

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
      <h1 className="text-3xl font-bold mb-8 text-center">Shared Media Collection</h1>
      {isGalleryOpen && mediaItems.length > 0 && (
        <MediaGalleryModal
          mediaItems={mediaItems}
          isOpen={isGalleryOpen}
          onClose={handleCloseGallery}
          docId={docId}
          onMediaItemDeleted={() => { /* No deletion in shared view */ } } // No deletion in shared view
          canDelete={false}
          canCloseModal={false}
        />
      )}
    </div>
  );
}
