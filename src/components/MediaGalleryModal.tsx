import React, { useState } from 'react';
import { Upload } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { FaTrash } from 'react-icons/fa';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { deleteMediaItemFromUpload } from '@/lib/firebase';
import Image from 'next/image'; // Import the Image component

interface MediaGalleryModalProps {
  mediaItems: { id: string; mediaType: 'image' | 'video'; mediaUrl: string; }[];
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  onMediaItemDeleted: (deletedItemId: string) => void;
  canDelete?: boolean; // New prop for delete permission
  canCloseModal?: boolean; // New prop for close button permission
}

export default function MediaGalleryModal({
  mediaItems: initialMediaItems,
  isOpen,
  onClose,
  docId,
  onMediaItemDeleted,
  canDelete = true, // Default to true if not provided
  canCloseModal = true, // Default to true
}: MediaGalleryModalProps) {
  const [mediaItems, setMediaItems] = useState(initialMediaItems);
  const [fullscreenMedia, setFullscreenMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    index: number;
    id?: string; // Add id property
  } | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    url: string;
  } | null>(null);

  // State for drag functionality
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const openFullscreen = (item: Upload['mediaItems'][0], index: number) => {
    setFullscreenMedia({ url: item.mediaUrl, type: item.mediaType, index, id: item.id });
  };

  const closeFullscreen = () => {
    setFullscreenMedia(null);
  };

  const handleDeleteMediaItemClick = (item: { id: string; url: string }) => {
    setItemToDelete(item);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDeleteMediaItem = async () => {
    if (!itemToDelete) return;

    setIsDeleteConfirmModalOpen(false);
    try {
      console.log(`Attempting to delete item: ${itemToDelete.id} with URL: ${itemToDelete.url}`);
      await deleteMediaItemFromUpload(docId, itemToDelete.id, itemToDelete.url);

      const updatedMediaItems = mediaItems.filter(item => item.id !== itemToDelete.id);
      setMediaItems(updatedMediaItems);
      onMediaItemDeleted(itemToDelete.id);

      if (fullscreenMedia?.id === itemToDelete.id) {
        closeFullscreen();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Error deleting item: " + error.message);
        console.error("Error deleting media item from gallery:", error);
      }
    } finally {
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmModalOpen(false);
    setItemToDelete(null);
  };

  // Drag handlers for fullscreen navigation
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    setCurrentX(clientX);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const dragDistance = currentX - startX;
    const threshold = 50; // Pixels to drag to trigger navigation

    if (dragDistance > threshold) {
      navigateFullscreen('prev');
    } else if (dragDistance < -threshold) {
      navigateFullscreen('next');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  const navigateFullscreen = (direction: 'prev' | 'next') => {
    if (fullscreenMedia && mediaItems && mediaItems.length > 0) {
      const newIndex =
        direction === 'next'
          ? (fullscreenMedia.index + 1) % mediaItems.length
          : (fullscreenMedia.index - 1 + mediaItems.length) % mediaItems.length;
      const newItem = mediaItems[newIndex];
      setFullscreenMedia({ url: newItem.mediaUrl, type: newItem.mediaType, index: newIndex, id: newItem.id });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => { if (!fullscreenMedia && canCloseModal) onClose(); }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-hidden relative transform transition-all duration-300 scale-100 opacity-100" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={canCloseModal ? onClose : undefined}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!canCloseModal || isDeleteConfirmModalOpen}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Media Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(90vh-120px)] p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {mediaItems &&
            mediaItems.map((item, index) => (
              <div
                key={item.id}
                className="relative w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer overflow-hidden shadow-md group"
              >
                {item.mediaType === 'image' ? (
                  <Image src={item.mediaUrl} alt={`Media ${index + 1}`} fill className="object-cover" onClick={() => openFullscreen(item, index)} />
                ) : (
                  <video src={item.mediaUrl} controls className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" onClick={() => openFullscreen(item, index)} />
                )}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMediaItemClick({ id: item.id, url: item.mediaUrl });
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-red-700"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        message="Are you sure you want to delete this media item? This action cannot be undone."
        onConfirm={handleConfirmDeleteMediaItem}
        onCancel={handleCancelDelete}
      />

      {fullscreenMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={closeFullscreen}>
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <div
            className="relative h-full w-full max-w-screen-lg flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {fullscreenMedia.type === 'image' ? (
              <Image src={fullscreenMedia.url} alt="Fullscreen Media" fill className="object-contain rounded-lg shadow-xl" />
            ) : (
              <video src={fullscreenMedia.url} controls className="max-h-full max-w-full object-contain rounded-lg shadow-xl" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); navigateFullscreen('prev'); }}
              className="absolute left-4 bg-gray-800 bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-opacity duration-200 hidden md:block"
            >
              Prev
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigateFullscreen('next'); }}
              className="absolute right-4 bg-gray-800 bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-opacity duration-200 hidden md:block"
            >
              Next
            </button>
            {canDelete && fullscreenMedia.id && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteMediaItemClick({ id: fullscreenMedia.id!, url: fullscreenMedia.url! }); closeFullscreen(); }}
                className="absolute top-4 left-4 bg-red-600 text-white rounded-full p-2 text-lg hover:bg-red-700 transition-colors duration-200 z-10"
                title="Delete Media"
              >
                <FaTrash />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
