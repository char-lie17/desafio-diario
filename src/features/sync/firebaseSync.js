import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export async function syncToFirestore(user, grade, streak, completedStatus, currentDateStr) {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  
  try {
    const docSnap = await getDoc(userRef);
    const data = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastUpdated: new Date().toISOString(),
      grade: grade,
      streak: streak
    };

    if (docSnap.exists()) {
      // Update existing
      await updateDoc(userRef, {
        ...data,
        [`completedDays.${currentDateStr}.math.${grade}`]: completedStatus.math || false
      });
    } else {
      // Create new
      await setDoc(userRef, {
        ...data,
        totalSolved: 0, // We can increment this later if needed
        completedDays: {
          [currentDateStr]: { math: { [grade]: completedStatus.math || false } }
        }
      });
    }
  } catch (error) {
    console.error("Error syncing to Firestore:", error);
  }
}

export async function fetchFromFirestore(user) {
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Error fetching from Firestore:", error);
  }
  return null;
}
