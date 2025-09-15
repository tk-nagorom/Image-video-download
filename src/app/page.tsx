'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-black">
        <h1 className="text-5xl font-extrabold text-white animate-fade-in-up">ShowVideo</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Hero Section */}
      <section className="text-center text-gray-900 dark:text-white mb-16">
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 animate-fade-in-down">
          ShowVideo: Your Creative Hub
        </h1>
        <p className="text-xl md:text-2xl mb-10 opacity-90 animate-fade-in delay-200">
          Discover, share, and connect through captivating media.
        </p>
        <Link
          href="/login"
          className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-4 rounded-full text-xl font-semibold shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Get Started
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl w-full mb-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center transform hover:scale-105 transition duration-300 border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4 text-blue-500">🚀</div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Upload & Share</h2>
          <p className="text-gray-600 dark:text-gray-400">Easily upload your videos and images to showcase your talent to the world.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center transform hover:scale-105 transition duration-300 border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4 text-purple-500">✨</div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Explore Content</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse a diverse collection of captivating media from creators worldwide.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center transform hover:scale-105 transition duration-300 border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4 text-green-500">💖</div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Connect & Engage</h2>
          <p className="text-gray-600 dark:text-gray-400">Interact with other users through comments, likes, and follows.</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center text-gray-900 dark:text-white mb-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to unleash your creativity?</h2>
        <Link
          href="/signup"
          className="bg-purple-600 text-white hover:bg-purple-700 px-12 py-4 rounded-full text-xl font-semibold shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Join ShowVideo Today!
        </Link>
      </section>
    </div>
  );
}