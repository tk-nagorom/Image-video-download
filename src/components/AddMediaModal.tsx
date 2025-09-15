import React, { useState } from 'react';
import { XMarkIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { Upload } from '@/types';
import { addMediaItemsToUpload } from '@/lib/firebase';
import Image from 'next/image'; // Import the Image component

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  onMediaAdded: (newItems: Upload['mediaItems']) => void;
}

export default function AddMediaModal({
  isOpen,
  onClose,
  docId,
  onMediaAdded,
}: AddMediaModalProps) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{
    url: string;
    type: 'image' | 'video';
  }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles(files);

      const newMediaPreviews = files.map(file => {
        const fileURL = URL.createObjectURL(file);
        let fileType: 'image' | 'video';
        if (file.type.startsWith('image')) {
          fileType = 'image';
        } else if (file.type.startsWith('video')) {
          fileType = 'video';
        } else {
          fileType = 'image'; // Default to image if unknown
        }
        return { url: fileURL, type: fileType };
      });
      setMediaPreviews(newMediaPreviews);
      setUploadError(''); // Clear previous errors
    }
  };

  const handleUpload = async () => {
    if (mediaFiles.length === 0) {
      setUploadError('Please select at least one file.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const newMediaItems = await addMediaItemsToUpload(docId, mediaFiles);
      onMediaAdded(newMediaItems as Upload['mediaItems']); // Cast to correct type
      setMediaFiles([]);
      setMediaPreviews([]);
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUploadError(error.message);
        console.error('Error adding media items:', error);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto relative transform transition-all duration-300 scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add More Media</h2>

        {uploadError && <p className="text-red-600 dark:text-red-400 mb-4 font-medium">Error: {uploadError}</p>}

        {/* Media Upload Box */}
        <div
          className="relative border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-xl p-6 mb-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 dark:hover:border-blue-400 transition-colors duration-200"
          onClick={() => document.getElementById('addMediaFile')?.click()}
        >
          {mediaPreviews.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg max-h-48 overflow-y-auto w-full">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative w-full h-24 bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden shadow-sm">
                  {preview.type === 'image' ? (
                    <Image
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <video src={preview.url} controls className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <VideoCameraIcon className="w-16 h-16 text-blue-400 dark:text-blue-500" />
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg text-center">Click to add images or videos</p>
            </>
          )}
          <input
            type="file"
            id="addMediaFile"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
        </div>

        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200"
          disabled={uploading || mediaFiles.length === 0}
        >
          {uploading ? 'Uploading...' : 'Add Media'}
        </button>
      </div>
    </div>
  );
}
