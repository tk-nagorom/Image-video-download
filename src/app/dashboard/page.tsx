'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Upload } from '@/types';

import { VideoCameraIcon } from '@heroicons/react/24/solid';
import Image from 'next/image'; // Import the Image component

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{
    url: string;
    type: 'image' | 'video';
  }[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles(files);

      const newMediaPreviews = files.map(file => {
        const fileURL = URL.createObjectURL(file);
        const fileType: 'image' | 'video' = file.type.startsWith('image') ? 'image' : 'video';
        return { url: fileURL, type: fileType };
      });
      setMediaPreviews(newMediaPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || mediaFiles.length === 0) {
      setUploadError('Please fill all required fields and select at least one file.');
      return;
    }

    // Log authenticated user's UID
    console.log("Authenticated User UID:", user.uid);

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const uploadedMediaItems: Upload['mediaItems'] = [];

      for (const mediaFile of mediaFiles) {
        const formData = new FormData();
        formData.append('mediaFile', mediaFile);
        formData.append('mediaType', mediaFile.type.startsWith('image') ? 'image' : 'video');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          uploadedMediaItems.push({
            id: data.public_id || Math.random().toString(36).substring(7), // Assuming public_id from Cloudinary or generate a random one
            mediaType: mediaFile.type.startsWith('image') ? 'image' : 'video',
            mediaUrl: data.mediaUrl,
          });
        } else {
          throw new Error('Upload failed for one or more files');
        }
      }

      // Save upload data to Firestore
      await addDoc(collection(db, 'mediaItems'), {
        userId: user.uid,
        description,
        price: parseFloat(price),
        mediaType: uploadedMediaItems[0]?.mediaType || 'other', // Main media type, can be improved
        mediaUrl: uploadedMediaItems[0]?.mediaUrl || '', // Main media URL, can be improved
        isPublic,
        timestamp: Timestamp.now(),
        mediaItems: uploadedMediaItems,
      });

      setUploadSuccess(true);
      setDescription('');
      setPrice('');
      setMediaFiles([]);
      setMediaPreviews([]);
      setIsPublic(true);
      router.push('/home');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUploadError(err.message);
        console.error('Error uploading:', err);
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled by useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900 dark:text-white">Upload Media</h1>
        {uploadSuccess && (
          <p className="text-green-600 dark:text-green-400 text-center mb-4 font-medium">Upload successful!</p>
        )}
        {uploadError && (
          <p className="text-red-600 dark:text-red-400 text-center mb-4 font-medium">Error: {uploadError}</p>
        )}
        {/* Media Upload Box */}
        <div
          className="relative border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-xl p-8 mb-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 dark:hover:border-blue-400 transition-colors duration-200"
          onClick={() => document.getElementById('mediaFile')?.click()}
        >
          {mediaPreviews.length > 0 ? (
            mediaPreviews.map((preview, index) => (
              <div key={index} className="mb-4 rounded-lg overflow-hidden">
                {preview.type === 'image' ? (
                  <Image
                    src={preview.url}
                    alt={`Media Preview ${index + 1}`}
                    fill // Use fill property for Next.js 13 Image component
                    className="max-h-64 object-contain w-full" // Use Tailwind CSS for object-fit
                  />
                ) : (
                  <video src={preview.url} controls className="max-h-64 object-contain w-full" />
                )}
              </div>
            ))
          ) : (
            <>
              <VideoCameraIcon className="w-16 h-16 text-blue-400 dark:text-blue-500" />
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">Click to upload an image or video</p>
            </>
          )}
          <input
            type="file"
            id="mediaFile"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 transition-colors duration-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Price (e.g., ₦5000)
            </label>
            <input
              type="text"
              id="price"
              className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 transition-colors duration-200"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 transition-colors duration-200"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
              Public
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
