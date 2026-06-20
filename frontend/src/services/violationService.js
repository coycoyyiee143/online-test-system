import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';

// Log Violation
export const logViolation = async (sessionId, quizId, violationType, description) => {
  await addDoc(collection(db, 'violations'), {
    sessionId,
    quizId,
    violationType,
    description,
    violatedAt: serverTimestamp(),
  });

  // Increment violation count
  await updateDoc(doc(db, 'quiz_sessions', sessionId), {
    violationCount: increment(1),
  });

  // Get updated session
  const { getSession } = await import('./sessionService');
  const session = await getSession(sessionId);
  return session?.violationCount || 0;
};

// Get Violations by Quiz
export const getViolationsByQuiz = async (quizId) => {
  const q = query(
    collection(db, 'violations'),
    where('quizId', '==', quizId),
    orderBy('violatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};