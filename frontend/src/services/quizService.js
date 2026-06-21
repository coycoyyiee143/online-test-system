import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

const generateQuizCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Compute the *real* status of a quiz based on isActive + availability window.
// This does NOT touch the database — it's a pure, read-only check used for
// display and for blocking joins once a quiz has expired or hasn't started yet.
// Possible return values: 'inactive' | 'upcoming' | 'expired' | 'active'
export const getQuizEffectiveStatus = (quiz) => {
  if (!quiz) return 'inactive';
  if (!quiz.isActive) return 'inactive';

  const now = new Date();

  if (quiz.availableFrom) {
    const from = new Date(quiz.availableFrom);
    if (!isNaN(from.getTime()) && now < from) return 'upcoming';
  }

  if (quiz.availableUntil) {
    const until = new Date(quiz.availableUntil);
    if (!isNaN(until.getTime()) && now > until) return 'expired';
  }

  return 'active';
};

// Convenience boolean for places that just need a yes/no
export const isQuizCurrentlyActive = (quiz) => getQuizEffectiveStatus(quiz) === 'active';

// Create Quiz
export const createQuiz = async (userId, quizData) => {
  const quizCode = generateQuizCode();
  const docRef = await addDoc(collection(db, 'quizzes'), {
    ...quizData,
    userId,
    quizCode,
    isActive: false,
    allowReviewAnswers: !!quizData.allowReviewAnswers,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, quizCode };
};

// Get all quizzes by teacher
export const getQuizzesByTeacher = async (userId) => {
  const q = query(collection(db, 'quizzes'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get single quiz
export const getQuiz = async (quizId) => {
  const docRef = doc(db, 'quizzes', quizId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

// Get quiz by code (for students)
// Returns null if the quiz doesn't exist, isn't marked active, OR has expired
// based on availableUntil — even if isActive is still true in the database.
export const getQuizByCode = async (quizCode) => {
  const q = query(
    collection(db, 'quizzes'),
    where('quizCode', '==', quizCode.toUpperCase()),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const quiz = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

  const status = getQuizEffectiveStatus(quiz);
  if (status !== 'active') return null;

  return quiz;
};

// Update Quiz
export const updateQuiz = async (quizId, quizData) => {
  const docRef = doc(db, 'quizzes', quizId);
  await updateDoc(docRef, {
    ...quizData,
    updatedAt: serverTimestamp(),
  });
};

// Toggle Active
export const toggleQuizActive = async (quizId, currentStatus) => {
  const docRef = doc(db, 'quizzes', quizId);
  await updateDoc(docRef, {
    isActive: !currentStatus,
    updatedAt: serverTimestamp(),
  });
};

// Delete Quiz
export const deleteQuiz = async (quizId) => {
  await deleteDoc(doc(db, 'quizzes', quizId));
};