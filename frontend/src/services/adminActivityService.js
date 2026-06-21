import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

// Log an admin action. Call this right after the action succeeds.
//
// action: short machine-readable type, e.g. 'teacher_approved', 'teacher_rejected'
// targetType: 'teacher' | 'quiz' | etc.
// targetName: human-readable label for display, e.g. teacher's name or quiz title
// adminId / adminName: who performed the action (from useAuth() in the caller)
export const logActivity = async ({ adminId, adminName, action, targetType, targetName }) => {
  await addDoc(collection(db, 'admin_activity'), {
    adminId,
    adminName,
    action,
    targetType,
    targetName,
    createdAt: serverTimestamp(),
  });
};

// Get all logged activity, most recent first.
export const getActivityLog = async () => {
  const q = query(collection(db, 'admin_activity'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};