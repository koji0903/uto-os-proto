import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
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
    createdAt?: number;
}

export async function addSpot(spot: Omit<Spot, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, 'spots'), {
            ...spot,
            createdAt: Date.now(),
        });
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
        const fileRef = ref(storage, `images/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
    } catch (error) {
        console.error('Error uploading image: ', error);
        throw error;
    }
}
