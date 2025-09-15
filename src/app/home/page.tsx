
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import MediaDisplay from '@/components/MediaDisplay';
import ShareLinkModal from '@/components/ShareLinkModal'; // Import ShareLinkModal
import { FaShareAlt } from 'react-icons/fa'; // Import share icon

interface UserProfile {
  uid: string;
  email: string;
  username: string;
  createdAt: Date;
}

export default function HomePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showShareLinkModal, setShowShareLinkModal] = useState(false); // New state for share link modal

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch profile data
        const userDocRef = doc(db, 'user', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          console.log("No such document!");
          // Optionally, sign out if user data is missing in Firestore but exists in Auth
          await signOut(auth);
          router.push('/login');
        }
      } else {
        // User is signed out
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleShareAllMediaClick = () => {
    setShowShareLinkModal(true);
  };

  const handleCloseShareLinkModal = () => {
    setShowShareLinkModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 dark:text-white">Welcome to ShowVideo!</h1>
        <div className="flex justify-center mb-10">
          <button
            onClick={handleShareAllMediaClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center space-x-2"
            disabled={!userProfile}
          >
            <FaShareAlt />
            <span>Share All My Media</span>
          </button>
        </div>
        <MediaDisplay />
      </div>

      {userProfile && (
        <ShareLinkModal
          isOpen={showShareLinkModal}
          onClose={handleCloseShareLinkModal}
          docId={userProfile.uid}
          type="user"
        />
      )}
    </div>
  );
}
