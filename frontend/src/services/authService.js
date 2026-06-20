import { auth, db } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Register Teacher
export const registerTeacher = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name,
    email,
    role: 'teacher',
    status: 'pending', // pending approval from admin
    createdAt: serverTimestamp(),
  });

  return user;
};

// Login
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Get user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();

  // Check if approved
  if (userData.status === 'pending') {
    await signOut(auth);
    throw new Error('Your account is pending approval from the admin.');
  }

  if (userData.status === 'rejected') {
    await signOut(auth);
    throw new Error('Your account has been rejected. Please contact the admin.');
  }

  return { user, userData };
};

// Logout
export const logoutUser = async () => {
  await signOut(auth);
};

// Get current user data
export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return userDoc.data();
};