import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { logActivity } from './adminActivityService';

// Get all teachers
export const getAllTeachers = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get pending teachers
export const getPendingTeachers = async () => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'teacher'),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Approve Teacher
// adminId/adminName/teacherName are optional — if provided, the action gets
// logged to admin_activity for the Activity Log page.
export const approveTeacher = async (userId, adminId, adminName, teacherName) => {
  await updateDoc(doc(db, 'users', userId), {
    status: 'approved',
    approvedAt: serverTimestamp(),
  });

  if (adminId) {
    try {
      await logActivity({
        adminId,
        adminName,
        action: 'teacher_approved',
        targetType: 'teacher',
        targetName: teacherName || userId,
      });
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  }
};

// Reject Teacher
export const rejectTeacher = async (userId, adminId, adminName, teacherName) => {
  await updateDoc(doc(db, 'users', userId), {
    status: 'rejected',
    rejectedAt: serverTimestamp(),
  });

  if (adminId) {
    try {
      await logActivity({
        adminId,
        adminName,
        action: 'teacher_rejected',
        targetType: 'teacher',
        targetName: teacherName || userId,
      });
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  }
};

// Create Admin account
export const createAdminAccount = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name,
    email,
    role: 'admin',
    status: 'approved',
    createdAt: serverTimestamp(),
  });
  return user;
};

// Get all quizzes (admin view)
// Each quiz comes back with an extra `teacherName` field, resolved from the
// quiz's userId against the users collection — falls back to the userId
// itself if the teacher's account can't be found (e.g. deleted).
export const getAllQuizzes = async () => {
  const snapshot = await getDocs(collection(db, 'quizzes'));
  const quizzes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const teachers = await getAllTeachers();
  const teacherMap = teachers.reduce((acc, t) => {
    acc[t.uid] = t.name;
    return acc;
  }, {});

  return quizzes.map((quiz) => ({
    ...quiz,
    teacherName: teacherMap[quiz.userId] || quiz.userId || 'Unknown',
  }));
};

// Delete a quiz as an admin. Logs the action so it shows up in the
// Activity Log — pass the current admin's uid/name and the quiz title.
export const adminDeleteQuiz = async (quizId, adminId, adminName, quizTitle) => {
  await deleteDoc(doc(db, 'quizzes', quizId));

  if (adminId) {
    try {
      await logActivity({
        adminId,
        adminName,
        action: 'quiz_deleted',
        targetType: 'quiz',
        targetName: quizTitle || quizId,
      });
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  }
};

// Get a de-duplicated list of every student who has taken any quiz,
// platform-wide, with an aggregate summary per student.
// There's no dedicated "students" collection — student identity only
// exists embedded inside quiz_results, so we group those by studentId.
export const getAllStudents = async () => {
  const snapshot = await getDocs(collection(db, 'quiz_results'));
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const grouped = {};
  for (const r of results) {
    if (!r.studentId) continue;
    if (!grouped[r.studentId]) {
      grouped[r.studentId] = {
        studentId: r.studentId,
        studentName: r.studentName,
        section: r.section,
        totalQuizzes: 0,
        totalPercentage: 0,
        passed: 0,
        failed: 0,
      };
    }
    const g = grouped[r.studentId];
    g.totalQuizzes += 1;
    g.totalPercentage += r.percentage || 0;
    if (r.remarks === 'Passed') g.passed += 1;
    if (r.remarks === 'Failed') g.failed += 1;
    // Keep the most recently seen name/section in case they changed
    g.studentName = r.studentName || g.studentName;
    g.section = r.section || g.section;
  }

  return Object.values(grouped).map((g) => ({
    ...g,
    averagePercentage: g.totalQuizzes > 0 ? Math.round((g.totalPercentage / g.totalQuizzes) * 100) / 100 : 0,
  }));
};

// Get every quiz a single student has taken, across all teachers, with the
// quiz title and the teacher's name resolved in for display.
export const getStudentHistory = async (studentId) => {
  const resultsQ = query(collection(db, 'quiz_results'), where('studentId', '==', studentId));
  const resultsSnap = await getDocs(resultsQ);
  const results = resultsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (results.length === 0) return [];

  const quizzesSnap = await getDocs(collection(db, 'quizzes'));
  const quizzes = quizzesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const quizMap = quizzes.reduce((acc, q) => {
    acc[q.id] = q;
    return acc;
  }, {});

  const teachers = await getAllTeachers();
  const teacherMap = teachers.reduce((acc, t) => {
    acc[t.uid] = t.name;
    return acc;
  }, {});

  return results.map((r) => {
    const quiz = quizMap[r.quizId];
    return {
      ...r,
      quizTitle: quiz?.title || 'Unknown Quiz',
      quizCode: quiz?.quizCode || '-',
      teacherName: quiz?.userId ? (teacherMap[quiz.userId] || 'Unknown') : 'Unknown',
    };
  });
};