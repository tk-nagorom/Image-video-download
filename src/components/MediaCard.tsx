import { Upload } from '@/types'; // Import Upload from the new types file
import { deleteMediaItem } from '@/lib/firebase';
import { FaTrash, FaPlus, FaShareAlt } from 'react-icons/fa'; // Import the trash, plus, and share icons
import { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import MediaGalleryModal from './MediaGalleryModal'; // Import the new MediaGalleryModal
import Image from 'next/image';
import AddMediaModal from './AddMediaModal'; // Import the new AddMediaModal
import ShareLinkModal from './ShareLinkModal'; // Import the new ShareLinkModal

interface MediaCardProps {
  upload: Upload;
  docId: string;
  onItemDeleted: (docId: string) => void; // Callback to notify parent of deletion
}

export default function MediaCard({
  upload: { description, price, timestamp, tags, mediaItems }, docId, onItemDeleted
}: MediaCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false); // New state for share link modal
  const [currentMediaItems, setCurrentMediaItems] = useState(mediaItems);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening gallery when deleting
    setIsModalOpen(true);
  };

  const handleCardClick = () => {
    if (mediaItems && mediaItems.length > 0) {
      setShowGallery(true);
    }
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  const handleAddMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening gallery when adding media
    setShowAddMediaModal(true);
  };

  const handleCloseAddMediaModal = () => {
    setShowAddMediaModal(false);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening gallery when sharing
    setShowShareLinkModal(true);
  };

  const handleCloseShareLinkModal = () => {
    setShowShareLinkModal(false);
  };

  const handleMediaAdded = (newItems: Upload['mediaItems']) => {
    setCurrentMediaItems(prevItems => [...(prevItems || []), ...newItems]);
    setShowAddMediaModal(false);
  };

  const handleMediaItemDeletedFromGallery = async (deletedItemId: string) => {
    if (currentMediaItems) {
      const updatedItems = currentMediaItems.filter(item => item.id !== deletedItemId);
      setCurrentMediaItems(updatedItems);

      if (updatedItems.length === 0) {
        // If all media items are deleted, delete the entire document
        try {
          await deleteMediaItem(docId); // Call the updated deleteMediaItem to delete the whole doc and its media
          onItemDeleted(docId);
        } catch (error: unknown) {
          if (error instanceof Error) {
            alert("Error deleting the last media item: " + error.message);
          }
        }
      }
    }
  };

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    try {
      console.log("Attempting to delete:", { docId });
      await deleteMediaItem(docId); // Call the updated deleteMediaItem, storagePath is no longer needed
      onItemDeleted(docId); // Notify parent component
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Error deleting item: " + error.message);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
      onClick={handleCardClick}
    >
      {currentMediaItems && currentMediaItems.length > 0 && (
        <div className="relative w-full h-48">
          {currentMediaItems[0].mediaType === 'image' && currentMediaItems[0].mediaUrl && (
            <Image
              src={currentMediaItems[0].mediaUrl}
              alt={description}
              fill
              className="object-cover"
            />
          )}
          {currentMediaItems[0].mediaType === 'video' && currentMediaItems[0].mediaUrl && (
            <video src={currentMediaItems[0].mediaUrl} controls className="w-full h-full object-cover" />
          )}
          {currentMediaItems.length > 1 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-3xl font-bold">
              +{currentMediaItems.length - 1}
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-extrabold mb-2 text-gray-900 dark:text-white">{description}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-1 font-semibold">Price: ${price}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 mt-2">
            {tags.map((tag: string, index: number) => (
              <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-gray-500 dark:text-gray-400 text-sm">Uploaded: {new Date(timestamp.toDate()).toLocaleDateString()}</p>
      </div>
      <div className="flex items-center justify-center space-x-4 p-4 border-t border-gray-200 dark:border-gray-700 md:absolute md:inset-0 md:bg-black md:bg-opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleDeleteClick}
          className="bg-red-600 text-white rounded-full p-3 text-lg hover:bg-red-700 transition-colors duration-200"
          title="Delete Media"
        >
          <FaTrash />
        </button>
        <button
          onClick={handleAddMediaClick}
          className="bg-blue-600 text-white rounded-full p-3 text-lg hover:bg-blue-700 transition-colors duration-200"
          title="Add More Media"
        >
          <FaPlus />
        </button>
        <button
          onClick={handleShareClick}
          className="bg-purple-600 text-white rounded-full p-3 text-lg hover:bg-purple-700 transition-colors duration-200"
          title="Share Link"
        >
          <FaShareAlt />
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {currentMediaItems && currentMediaItems.length > 0 && (
        <MediaGalleryModal
          mediaItems={currentMediaItems}
          isOpen={showGallery}
          onClose={handleCloseGallery}
          docId={docId}
          onMediaItemDeleted={handleMediaItemDeletedFromGallery}
        />
      )}

      <AddMediaModal
        isOpen={showAddMediaModal}
        onClose={handleCloseAddMediaModal}
        docId={docId}
        onMediaAdded={handleMediaAdded}
      />

      <ShareLinkModal
        isOpen={showShareLinkModal}
        onClose={handleCloseShareLinkModal}
        docId={docId}
        type="doc"
      />
    </div>
  );
}
