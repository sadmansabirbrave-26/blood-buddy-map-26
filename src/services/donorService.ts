import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  where,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Donor, BloodGroup } from '@/types/donor';

const DONORS_COLLECTION = 'donors';

// Convert Firestore document to Donor type
const convertToDonor = (doc: DocumentData): Donor => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    bloodGroup: data.bloodGroup,
    phone: data.phone,
    lastDonated: data.lastDonated,
    lat: data.lat,
    lng: data.lng,
    status: data.status
  };
};

// Get all donors
export const getDonors = async (): Promise<Donor[]> => {
  try {
    const q = query(collection(db, DONORS_COLLECTION), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToDonor);
  } catch (error) {
    console.error('Error fetching donors:', error);
    throw error;
  }
};

// Get donors by blood group
export const getDonorsByBloodGroup = async (bloodGroup: BloodGroup): Promise<Donor[]> => {
  try {
    const q = query(
      collection(db, DONORS_COLLECTION), 
      where('bloodGroup', '==', bloodGroup),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToDonor);
  } catch (error) {
    console.error('Error fetching donors by blood group:', error);
    throw error;
  }
};

// Add new donor
export const addDonor = async (donor: Omit<Donor, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, DONORS_COLLECTION), donor);
    return docRef.id;
  } catch (error) {
    console.error('Error adding donor:', error);
    throw error;
  }
};

// Update donor
export const updateDonor = async (id: string, donor: Partial<Donor>): Promise<void> => {
  try {
    const donorRef = doc(db, DONORS_COLLECTION, id);
    await updateDoc(donorRef, donor);
  } catch (error) {
    console.error('Error updating donor:', error);
    throw error;
  }
};

// Delete donor
export const deleteDonor = async (id: string): Promise<void> => {
  try {
    const donorRef = doc(db, DONORS_COLLECTION, id);
    await deleteDoc(donorRef);
  } catch (error) {
    console.error('Error deleting donor:', error);
    throw error;
  }
};

// Real-time listener for donors
export const subscribeToDonors = (callback: (donors: Donor[]) => void) => {
  const q = query(collection(db, DONORS_COLLECTION), orderBy('name'));
  return onSnapshot(q, (querySnapshot) => {
    const donors = querySnapshot.docs.map(convertToDonor);
    callback(donors);
  });
};

// Real-time listener for donors by blood group
export const subscribeToDonorsByBloodGroup = (bloodGroup: BloodGroup, callback: (donors: Donor[]) => void) => {
  const q = query(
    collection(db, DONORS_COLLECTION), 
    where('bloodGroup', '==', bloodGroup),
    orderBy('name')
  );
  return onSnapshot(q, (querySnapshot) => {
    const donors = querySnapshot.docs.map(convertToDonor);
    callback(donors);
  });
};
