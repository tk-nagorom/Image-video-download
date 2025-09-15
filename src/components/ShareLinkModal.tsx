import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { FaClipboard } from 'react-icons/fa';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string; // This can be media docId or userId
  type: 'doc' | 'user'; // New prop to differentiate between sharing a single doc or all user media
}

export default function ShareLinkModal({
  isOpen,
  onClose,
  docId,
  type,
}: ShareLinkModalProps) {
  const [shareLink, setShareLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen && docId) {
      const origin = window.location.origin;
      let generatedLink = '';
      if (type === 'user') {
        generatedLink = `${origin}/shared/user/${docId}`;
      } else {
        generatedLink = `${origin}/shared/${docId}`;
      }
      setShareLink(generatedLink);
      setCopySuccess(false);
    }
  }, [isOpen, docId, type]);

  if (!isOpen) return null;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopySuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-hidden relative transform transition-all duration-300 scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Share Your Media</h2>

        <div className="mb-4">
          <label htmlFor="shareLink" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Shareable Link:</label>
          <div className="flex rounded-lg shadow-sm overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
            <input
              type="text"
              id="shareLink"
              readOnly
              value={shareLink}
              className="flex-grow py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none bg-gray-50 dark:bg-gray-700"
            />
            <button
              onClick={handleCopyToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 flex items-center transition-colors duration-200"
            >
              <FaClipboard />
              <span className="ml-2">{copySuccess ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          {copySuccess && <p className="text-green-600 dark:text-green-400 text-sm mt-2 font-medium">Link copied to clipboard!</p>}
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm text-center mt-6">Share this link for others to view your media collection.</p>
      </div>
    </div>
  );
}
