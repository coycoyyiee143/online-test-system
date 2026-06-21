import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// Save or Update Answer
export const saveAnswer = async (sessionId, questionId, choiceId, essayAnswer) => {
  // Check if answer already exists
  const q = query(
    collection(db, 'student_answers'),
    where('sessionId', '==', sessionId),
    where('questionId', '==', questionId)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Update existing
    const existingDoc = snapshot.docs[0];
    await updateDoc(existingDoc.ref, {
      choiceId: choiceId || null,
      essayAnswer: essayAnswer || null,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create new
    await addDoc(collection(db, 'student_answers'), {
      sessionId,
      questionId,
      choiceId: choiceId || null,
      essayAnswer: essayAnswer || null,
      createdAt: serverTimestamp(),
    });
  }
};

// Get Answers by Session
export const getAnswersBySession = async (sessionId) => {
  const q = query(collection(db, 'student_answers'), where('sessionId', '==', sessionId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Grade an essay answer with partial credit.
// awardedPoints is clamped between 0 and the question's max points.
// After saving, the teacher should trigger a result recalculation so the
// student's total score reflects this grade (see resultService.js).
export const gradeEssayAnswer = async (answerId, awardedPoints, maxPoints) => {
  const clamped = Math.max(0, Math.min(awardedPoints, maxPoints));
  const answerRef = doc(db, 'student_answers', answerId);
  await updateDoc(answerRef, {
    awardedPoints: clamped,
    graded: true,
    gradedAt: serverTimestamp(),
  });
  return clamped;
};

// Calculate Score
// Multiple-choice / true-false: full points if the choice matches the
// current correct choice, otherwise 0.
// Essay: awarded points if already graded by the teacher (awardedPoints),
// otherwise 0 — ungraded essays don't count toward the score yet.
export const calculateScore = async (sessionId, questions) => {
  const answers = await getAnswersBySession(sessionId);
  let totalPoints = 0;
  let earnedPoints = 0;

  for (const question of questions) {
    totalPoints += question.points;
    const answer = answers.find((a) => a.questionId === question.id);

    if (question.questionType === 'essay') {
      if (answer && answer.graded && typeof answer.awardedPoints === 'number') {
        earnedPoints += answer.awardedPoints;
      }
    } else {
      if (answer && answer.choiceId) {
        const correctChoice = question.choices.find((c) => c.isCorrect);
        if (correctChoice && answer.choiceId === correctChoice.id) {
          earnedPoints += question.points;
        }
      }
    }
  }

  const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  return {
    totalPoints,
    earnedPoints,
    percentage: Math.round(percentage * 100) / 100,
    remarks: percentage >= 60 ? 'Passed' : 'Failed',
  };
};