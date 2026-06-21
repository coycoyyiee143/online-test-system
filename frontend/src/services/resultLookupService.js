import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Look up a student's result using the quiz code + their student ID.
// Used by the student-facing "Check My Result" page — no login required,
// reuses the same identifiers students already enter when joining a quiz.
//
// Returns one of:
//   { status: 'not_found' }                 - no quiz with that code
//   { status: 'no_submission' }              - quiz exists, but no result for this studentId
//   { status: 'review_disabled', quiz }       - result exists, but teacher hasn't enabled review
//   { status: 'ok', quiz, result, questions, answers }
export const getResultByCodeAndStudentId = async (quizCode, studentId) => {
  // 1. Find the quiz by code (any quiz that ever existed with this code,
  // not just active ones — students should still be able to review past quizzes)
  const quizQ = query(
    collection(db, 'quizzes'),
    where('quizCode', '==', quizCode.toUpperCase())
  );
  const quizSnap = await getDocs(quizQ);
  if (quizSnap.empty) {
    return { status: 'not_found' };
  }
  const quiz = { id: quizSnap.docs[0].id, ...quizSnap.docs[0].data() };

  // 2. Find this student's result for that quiz
  const resultQ = query(
    collection(db, 'quiz_results'),
    where('quizId', '==', quiz.id),
    where('studentId', '==', studentId)
  );
  const resultSnap = await getDocs(resultQ);
  if (resultSnap.empty) {
    return { status: 'no_submission' };
  }
  const result = { id: resultSnap.docs[0].id, ...resultSnap.docs[0].data() };

  // 3. Check teacher's review toggle
  if (!quiz.allowReviewAnswers) {
    return { status: 'review_disabled', quiz };
  }

  // 4. Pull the questions + this session's answers so the UI can show a breakdown
  const questionsQ = query(
    collection(db, 'questions'),
    where('quizId', '==', quiz.id)
  );
  const questionsSnap = await getDocs(questionsQ);
  const questions = questionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const answersQ = query(
    collection(db, 'student_answers'),
    where('sessionId', '==', result.sessionId)
  );
  const answersSnap = await getDocs(answersQ);
  const answers = answersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return { status: 'ok', quiz, result, questions, answers };
};