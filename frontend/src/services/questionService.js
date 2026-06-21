import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { recalculateResultsForQuiz } from './resultService';

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
// After updating, automatically recalculates every existing result for this
// quiz — since the answer key may have changed, past scores need to reflect
// the corrected version, not the one that was wrong when students took it.
export const updateQuestion = async (questionId, questionData) => {
  const docRef = doc(db, 'questions', questionId);
  await updateDoc(docRef, {
    ...questionData,
    updatedAt: serverTimestamp(),
  });

  try {
    const updatedSnap = await getDoc(docRef);
    const quizId = updatedSnap.exists() ? updatedSnap.data().quizId : null;
    if (quizId) {
      const questions = await getQuestionsByQuiz(quizId);
      await recalculateResultsForQuiz(quizId, questions);
    }
  } catch (e) {
    // Don't let a recalculation failure block the question edit itself
    console.error('Failed to recalculate results after question edit:', e);
  }
};

// Delete Question
export const deleteQuestion = async (questionId) => {
  await deleteDoc(doc(db, 'questions', questionId));
};