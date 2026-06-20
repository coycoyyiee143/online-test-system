import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';

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
export const approveTeacher = async (userId) => {
  await updateDoc(doc(db, 'users', userId), {
    status: 'approved',
    approvedAt: serverTimestamp(),
  });
};

// Reject Teacher
export const rejectTeacher = async (userId) => {
  await updateDoc(doc(db, 'users', userId), {
    status: 'rejected',
    rejectedAt: serverTimestamp(),
  });
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
export const getAllQuizzes = async () => {
  const snapshot = await getDocs(collection(db, 'quizzes'));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};