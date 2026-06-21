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
  orderBy,
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
  try {
    console.log("Quiz ID:", quizId);

    const q = query(
      collection(db, "questions"),
      where("quizId", "==", quizId),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);  

    snapshot.forEach((doc) => {
      console.log(doc.id, doc.data());
    });

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("ERROR CODE:", err.code);
    console.error("ERROR MESSAGE:", err.message);
    console.error(err);
  }
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