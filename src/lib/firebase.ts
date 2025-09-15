
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, deleteDoc, updateDoc, arrayRemove, getDoc, DocumentData, arrayUnion } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

async function deleteMediaItem(docId: string) {
  try {
    // First, get the document to retrieve all media items
    const docRef = doc(db, "mediaItems", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData;
      const mediaItems = data.mediaItems as { mediaUrl: string }[];

      // Delete each media item from Cloudinary
      if (mediaItems && mediaItems.length > 0) {
        for (const item of mediaItems) {
          if (item.mediaUrl) {
            const response = await fetch('/api/deleteMedia', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ mediaUrl: item.mediaUrl }),
            });

            if (!response.ok) {
              console.error(`Failed to delete media ${item.mediaUrl} from Cloudinary`);
            }
          }
        }
      }
    }

    // Delete from Firestore
    await deleteDoc(doc(db, "mediaItems", docId));

    console.log("Item and associated media deleted successfully!");
  } catch (error) {
    console.error("Error deleting item: ", error);
    throw error; // Re-throw to allow calling function to handle
  }
}

async function deleteMediaItemFromUpload(docId: string, mediaItemId: string, mediaUrl: string) {
  try {
    // Delete from Cloudinary via API route
    const response = await fetch('/api/deleteMedia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mediaUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete media from Cloudinary');
    }

    // Remove from Firestore mediaItems array
    const mediaDocRef = doc(db, "mediaItems", docId);
    await updateDoc(mediaDocRef, {
      mediaItems: arrayRemove({ id: mediaItemId, mediaUrl: mediaUrl, mediaType: mediaUrl.includes("video") ? "video" : "image" })
    });

    console.log(`Media item ${mediaItemId} deleted from doc ${docId} successfully!`);
  } catch (error) {
    console.error("Error deleting media item from upload: ", error);
    throw error;
  }
}

async function addMediaItemsToUpload(docId: string, files: File[]) {
  const newMediaItems = [];

  try {
    for (const file of files) {
      const formData = new FormData();
      formData.append('mediaFile', file);
      formData.append('mediaType', file.type.startsWith('image') ? 'image' : 'video');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        newMediaItems.push({
          id: data.public_id || Math.random().toString(36).substring(7),
          mediaType: file.type.startsWith('image') ? 'image' : 'video',
          mediaUrl: data.mediaUrl,
        });
      } else {
        throw new Error('Upload failed for one or more files');
      }
    }

    // Update Firestore document with new media items
    const mediaDocRef = doc(db, "mediaItems", docId);
    await updateDoc(mediaDocRef, {
      mediaItems: arrayUnion(...newMediaItems)
    });

    console.log(`Added ${newMediaItems.length} new media items to doc ${docId} successfully!`);
    return newMediaItems;
  } catch (error) {
    console.error("Error adding media items to upload: ", error);
    throw error;
  }
}

export { auth, db, storage, deleteMediaItem, deleteMediaItemFromUpload, addMediaItemsToUpload };
