import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface Spot {
    id?: string;
    location: { lat: number; lng: number };
    type: 'resource' | 'issue';
    category: string;
    imageUrl: string;
    description: string;
    ai_analysis: string;
    urgency?: 'high' | 'medium' | 'low';
    createdAt?: number;
}

export async function addSpot(spot: Omit<Spot, 'id' | 'createdAt'>) {
    try {
        console.log("Firestore: Saving spot...");
        const docRef = await Promise.race([
            addDoc(collection(db, 'spots'), {
                ...spot,
                createdAt: Date.now(),
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore timeout (15s). Ensure Firestore Database is created and security rules allow writes.")), 15000))
        ]) as any;
        console.log("Firestore: Saved successfully with ID", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding document: ', error);
        throw error;
    }
}

export async function getSpots(): Promise<Spot[]> {
    try {
        const q = query(collection(db, 'spots'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const spots: Spot[] = [];
        querySnapshot.forEach((doc) => {
            spots.push({ id: doc.id, ...doc.data() } as Spot);
        });
        return spots;
    } catch (error) {
        console.error('Error getting documents: ', error);
        throw error;
    }
}

export async function uploadImage(file: File): Promise<string> {
    try {
        console.log("Firebase Storage: Starting upload for", file.name);
        if (!storage) {
            throw new Error("Storage is not initialized. Check your Firebase config.");
        }

        const fileRef = ref(storage, `images/${Date.now()}_${file.name}`);

        // Wrap with timeout to catch silent hangs (e.g. uninitialized Firebase Storage bucket)
        const uploadResult = await Promise.race([
            uploadBytes(fileRef, file),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Storage upload timed out (15s). Ensure Firebase Storage is enabled in your project console and security rules allow writes.")), 15000))
        ]) as any;

        console.log("Firebase Storage: Upload complete. Fetching URL...");
        const url = await getDownloadURL(uploadResult.ref);
        console.log("Firebase Storage: URL fetched:", url);
        return url;
    } catch (error) {
        console.error('Error uploading image: ', error);
        throw error;
    }
}

export async function deleteSpot(id: string) {
    try {
        await deleteDoc(doc(db, 'spots', id));
        console.log("Firestore: Deleted spot", id);
    } catch (error) {
        console.error('Error deleting document: ', error);
        throw error;
    }
}
