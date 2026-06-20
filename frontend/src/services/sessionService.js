import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// Start Session
export const startSession = async (quizId, studentName, studentId, section) => {
  // Check if already submitted
  const submittedQ = query(
    collection(db, 'quiz_sessions'),
    where('quizId', '==', quizId),
    where('studentId', '==', studentId),
    where('status', '==', 'submitted')
  );
  const submittedSnap = await getDocs(submittedQ);
  if (!submittedSnap.empty) {
    throw new Error('You have already submitted this quiz. Duplicate attempt is not allowed.');
  }

  // Check existing active session - resume
  const activeQ = query(
    collection(db, 'quiz_sessions'),
    where('quizId', '==', quizId),
    where('studentId', '==', studentId),
    where('status', '==', 'active')
  );
  const activeSnap = await getDocs(activeQ);
  if (!activeSnap.empty) {
    const existingSession = { id: activeSnap.docs[0].id, ...activeSnap.docs[0].data() };
    return { session: existingSession, isResumed: true };
  }

  // Create new session
  const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const docRef = await addDoc(collection(db, 'quiz_sessions'), {
    quizId,
    studentName,
    studentId,
    section,
    sessionToken,
    status: 'active',
    violationCount: 0,
    startedAt: serverTimestamp(),
    lastActivity: serverTimestamp(),
  });

  const newSession = { id: docRef.id, quizId, studentName, studentId, section, sessionToken, status: 'active', violationCount: 0 };
  return { session: newSession, isResumed: false };
};

// Get Sessions by Quiz
export const getSessionsByQuiz = async (quizId) => {
  const q = query(collection(db, 'quiz_sessions'), where('quizId', '==', quizId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Update Last Activity
export const updateLastActivity = async (sessionId) => {
  await updateDoc(doc(db, 'quiz_sessions', sessionId), {
    lastActivity: serverTimestamp(),
  });
};

// Submit Session
export const submitSession = async (sessionId) => {
  await updateDoc(doc(db, 'quiz_sessions', sessionId), {
    status: 'submitted',
    submittedAt: serverTimestamp(),
  });
};

// Get Session by ID
export const getSession = async (sessionId) => {
  const docSnap = await getDoc(doc(db, 'quiz_sessions', sessionId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};