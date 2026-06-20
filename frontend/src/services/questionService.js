import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// Add Question
export const addQuestion = async (quizId, questionData) => {
  const docRef = await addDoc(collection(db, 'questions'), {
    ...questionData,
    quizId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get Questions by Quiz
export const getQuestionsByQuiz = async (quizId) => {
 const q = query(
  collection(db, "questions"),
  where("quizId", "==", quizId)
);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Update Question
export const updateQuestion = async (questionId, questionData) => {
  const docRef = doc(db, 'questions', questionId);
  await updateDoc(docRef, {
    ...questionData,
    updatedAt: serverTimestamp(),
  });
};

// Delete Question
export const deleteQuestion = async (questionId) => {
  await deleteDoc(doc(db, 'questions', questionId));
};