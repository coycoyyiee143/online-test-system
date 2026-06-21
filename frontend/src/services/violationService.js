import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";

// Log Violation
export const logViolation = async (
  sessionId,
  quizId,
  violationType,
  description
) => {
  try {
    // Get session details
    const sessionRef = doc(db, "quiz_sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error("Quiz session not found.");
    }

    const session = sessionSnap.data();

    console.log("Logging violation:", {
      sessionId,
      quizId,
      studentId: session.studentId,
      studentName: session.studentName,
      section: session.section,
      violationType,
      description,
    });

    // Save violation
    await addDoc(collection(db, "violations"), {
      sessionId,
      quizId,

      studentId: session.studentId,
      studentName: session.studentName,
      section: session.section || "",

      violationType,
      description,

      violatedAt: serverTimestamp(),
    });

    // Increment violation count
    await updateDoc(sessionRef, {
      violationCount: increment(1),
    });

    console.log("Violation saved successfully.");
  } catch (error) {
    console.error("Error logging violation:", error);
  }
};

// Get Violations by Quiz
export const getViolationsByQuiz = async (quizId) => {
  try {
    console.log("Fetching violations for quiz:", quizId);

    const q = query(
      collection(db, "violations"),
      where("quizId", "==", quizId),
      orderBy("violatedAt", "desc")
    );

    const snapshot = await getDocs(q);

    const violations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Violations:", violations);

    return violations;
  } catch (error) {
    console.error("Error fetching violations:", error);
    return [];
  }
};