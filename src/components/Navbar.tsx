'use client';

import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/home" className="text-2xl font-extrabold text-gray-900 dark:text-white">
          ShowVideo
        </Link>
        <div className="flex items-center space-x-4">
          {user && (
            <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              Dashboard
            </Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Logout
            </button>
          ) : (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}




