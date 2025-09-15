'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import MediaCard from './MediaCard';
import { Upload } from '@/types'; // Import the Upload interface from @/types

export default function MediaDisplay() {
  const [mediaItems, setMediaItems] = useState<Upload[]>([]); // Use Upload interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleItemDeleted = (deletedDocId: string) => {
    setMediaItems(prevItems => prevItems.filter(item => item.id !== deletedDocId));
  };

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const q = query(collection(db, 'mediaItems'), orderBy('timestamp', 'desc')); // Query 'mediaItems' collection
        const querySnapshot = await getDocs(q);
        const items: Upload[] = []; // Use Upload interface
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data(),
          } as Upload);
        });
        setMediaItems(items);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error('Error fetching media:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading media...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {mediaItems.length === 0 ? (
        <p className="col-span-full text-center text-gray-500">No media uploaded yet.</p>
      ) : (
        mediaItems.map((item) => (
          <MediaCard
            key={item.id}
            upload={item} // Pass the entire item as 'upload' prop
            docId={item.id}
            onItemDeleted={handleItemDeleted}
          />
        ))
      )}
    </div>
  );
}


