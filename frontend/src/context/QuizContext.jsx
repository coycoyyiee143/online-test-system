import React, { createContext, useContext, useState } from 'react';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentSession(null);
    setQuestions([]);
    setAnswers({});
  };

  return (
    <QuizContext.Provider
      value={{
        currentQuiz,
        setCurrentQuiz,
        currentSession,
        setCurrentSession,
        questions,
        setQuestions,
        answers,
        setAnswers,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => useContext(QuizContext);