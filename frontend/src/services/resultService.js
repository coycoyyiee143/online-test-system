import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// Save Result
export const saveResult = async (resultData) => {
  const docRef = await addDoc(collection(db, 'quiz_results'), {
    ...resultData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get Results by Quiz
export const getResultsByQuiz = async (quizId) => {
  const q = query(collection(db, 'quiz_results'), where('quizId', '==', quizId));
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const total = results.length;
  const average = total > 0 ? results.reduce((acc, r) => acc + r.percentage, 0) / total : 0;
  const highest = total > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;
  const lowest = total > 0 ? Math.min(...results.map((r) => r.percentage)) : 0;
  const passed = results.filter((r) => r.remarks === 'Passed').length;
  const failed = results.filter((r) => r.remarks === 'Failed').length;

  return {
    results,
    stats: {
      total_takers: total,
      average_score: Math.round(average * 100) / 100,
      highest_score: highest,
      lowest_score: lowest,
      passed,
      failed,
    },
  };
};

// Get detailed result with answers
export const getResultDetail = async (sessionId) => {
  const answersQ = query(
    collection(db, 'student_answers'),
    where('sessionId', '==', sessionId)
  );
  const answersSnap = await getDocs(answersQ);
  const answers = answersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return answers;
};