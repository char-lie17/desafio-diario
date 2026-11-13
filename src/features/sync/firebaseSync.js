import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// progress is the day's local completion: { math: { [grade]: true }, chess: { [level]: true } }
export async function syncToFirestore(user, { grade, chessLevel, streak, dateStr, progress }) {
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
      chessLevel: chessLevel,
      streak: streak
    };

    // Send only completed challenges, and merge: a challenge that is pending
    // here must not clear one completed on another device, grade or level.
    const day = {};
    for (const type of ['math', 'chess']) {
      const done = Object.keys(progress?.[type] || {}).filter((key) => progress[type][key]);
      if (done.length) day[type] = Object.fromEntries(done.map((key) => [key, true]));
    }

    await setDoc(userRef, {
      ...data,
      ...(!docSnap.exists() ? { totalSolved: 0 } : {}),
      ...(Object.keys(day).length ? { completedDays: { [dateStr]: day } } : {}),
    }, { merge: true });
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
