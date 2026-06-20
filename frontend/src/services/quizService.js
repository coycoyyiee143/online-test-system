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

// Create Quiz
export const createQuiz = async (userId, quizData) => {
  const quizCode = generateQuizCode();
  const docRef = await addDoc(collection(db, 'quizzes'), {
    ...quizData,
    userId,
    quizCode,
    isActive: false,
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
export const getQuizByCode = async (quizCode) => {
  const q = query(
    collection(db, 'quizzes'),
    where('quizCode', '==', quizCode.toUpperCase()),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
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