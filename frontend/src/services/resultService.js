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

// Recalculate and overwrite the score for a single result document.
// Mirrors calculateScore in answerService.js: for choice questions, full
// points only if the student's choiceId matches the current correct choice.
// For essay questions, awarded points only if the teacher has graded it
// (answer.graded === true) — ungraded essays contribute 0 until graded.
const computeScoreFromAnswers = (questions, answers) => {
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

// Recalculate every saved result for a quiz, using its current questions
// (i.e. current correct answers / points). Call this after a question is
// edited so past submissions reflect the corrected answer key.
//
// This intentionally changes scores for students who already submitted —
// that's the point: if the answer key was wrong, the recorded score was wrong.
export const recalculateResultsForQuiz = async (quizId, questions) => {
  const resultsQ = query(collection(db, 'quiz_results'), where('quizId', '==', quizId));
  const resultsSnap = await getDocs(resultsQ);
  const results = resultsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  for (const result of results) {
    if (!result.sessionId) continue;

    const answersQ = query(
      collection(db, 'student_answers'),
      where('sessionId', '==', result.sessionId)
    );
    const answersSnap = await getDocs(answersQ);
    const answers = answersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const score = computeScoreFromAnswers(questions, answers);

    await updateDoc(doc(db, 'quiz_results', result.id), {
      totalPoints: score.totalPoints,
      earnedPoints: score.earnedPoints,
      percentage: score.percentage,
      remarks: score.remarks,
      recalculatedAt: serverTimestamp(),
    });
  }

  return results.length;
};