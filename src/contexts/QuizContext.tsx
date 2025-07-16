import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { Quiz, QuizQuestion, Standard, StudentLoginResponse, apiService, QuizCompletionRequest } from '../services/apiService';

interface QuizSettings {
  difficulty: number;
  questionCount: number;
}

interface QuizAnswer {
  questionId: string;
  answer: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;
  accuracy: number;
  answers: QuizAnswer[];
}

interface PendingSubmission {
  questionId: string;
  answer: number;
  timeSpent: number;
  retryCount: number;
}

interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  studentId: string | null;
  currentStudent: StudentLoginResponse | null;
  sessionId: string | null;
  answers: QuizAnswer[];
  pendingSubmissions: PendingSubmission[];
  startTime: number | null;
  questionStartTime: number | null;
  selectedStandard: Standard | null;
  quizSettings: QuizSettings;
  quizResults: QuizResults | null;
  isLoading: boolean;
  error: string | null;
}

type QuizAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_STUDENT_ID'; payload: string }
  | { type: 'SET_CURRENT_STUDENT'; payload: StudentLoginResponse }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'SET_SELECTED_STANDARD'; payload: Standard }
  | { type: 'SET_QUIZ_SETTINGS'; payload: Partial<QuizSettings> }
  | { type: 'SET_CURRENT_QUIZ'; payload: Quiz }
  | { type: 'SET_QUESTION_START_TIME' }
  | { type: 'ADD_ANSWER'; payload: Omit<QuizAnswer, 'timeSpent'> }
  | { type: 'ADD_PENDING_SUBMISSION'; payload: PendingSubmission }
  | { type: 'REMOVE_PENDING_SUBMISSION'; payload: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'SET_QUIZ_RESULTS'; payload: QuizResults }
  | { type: 'RESET_QUIZ' }
  | { type: 'CLEAR_ERROR' };

interface QuizContextType {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setStudentId: (studentId: string) => void;
  setCurrentStudent: (student: StudentLoginResponse) => void;
  setSessionId: (sessionId: string) => void;
  setSelectedStandard: (standard: Standard) => void;
  setQuizSettings: (settings: Partial<QuizSettings>) => void;
  setCurrentQuiz: (quiz: Quiz) => void;
  setQuestionStartTime: () => void;
  addAnswer: (answer: Omit<QuizAnswer, 'timeSpent'>) => void;
  nextQuestion: () => void;
  setQuizResults: (results: QuizResults) => void;
  resetQuiz: () => void;
  completeQuiz: () => Promise<boolean>;
  retryPendingSubmissions: () => Promise<void>;
  getCurrentQuestion: () => QuizQuestion | null;
  isQuizComplete: () => boolean;
  getQuizProgress: () => number;
  getTotalTime: () => number;
  getCorrectAnswersCount: () => number;
  getAccuracy: () => number;
}

interface QuizProviderProps {
  children: ReactNode;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const loadStateFromStorage = (): Partial<QuizState> => {
  try {
    const savedStudentId = localStorage.getItem('quiz_studentId');
    const savedAnswers = localStorage.getItem('quiz_answers');
    const savedCurrentQuiz = localStorage.getItem('quiz_currentQuiz');
    const savedSessionId = localStorage.getItem('quiz_sessionId');
    const savedCurrentStudent = localStorage.getItem('quiz_currentStudent');
    
    return {
      studentId: savedStudentId || null,
      answers: savedAnswers ? JSON.parse(savedAnswers) : [],
      currentQuiz: savedCurrentQuiz ? JSON.parse(savedCurrentQuiz) : null,
      currentStudent: savedCurrentStudent ? JSON.parse(savedCurrentStudent) : null,
      sessionId: savedSessionId || null,
    };
  } catch (error) {
    return {};
  }
};

const saveStateToStorage = (state: QuizState) => {
  try {
    if (state.studentId) {
      localStorage.setItem('quiz_studentId', state.studentId);
    }
    if (state.answers && state.answers.length > 0) {
      localStorage.setItem('quiz_answers', JSON.stringify(state.answers));
    }
    if (state.currentQuiz) {
      localStorage.setItem('quiz_currentQuiz', JSON.stringify(state.currentQuiz));
    }
    if (state.currentStudent) {
      localStorage.setItem('quiz_currentStudent', JSON.stringify(state.currentStudent));
    }
    if (state.sessionId) {
      localStorage.setItem('quiz_sessionId', state.sessionId);
    }
  } catch (error) {
  }
};

const persistedState = loadStateFromStorage();

const initialState: QuizState = {
  currentQuiz: null,
  currentQuestionIndex: 0,
  studentId: null,
  currentStudent: null,
  sessionId: null,
  answers: [],
  pendingSubmissions: [],
  startTime: null,
  questionStartTime: null,
  selectedStandard: null,
  quizSettings: {
    difficulty: 3,
    questionCount: 10,
  },
  quizResults: null,
  isLoading: false,
  error: null,
  ...persistedState,
};

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  let newState: QuizState;
  
  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, isLoading: action.payload, error: null };
      break;
    
    case 'SET_ERROR':
      newState = { ...state, error: action.payload, isLoading: false };
      break;
    
    case 'SET_STUDENT_ID':
      if (state.studentId && (!action.payload || action.payload === '')) {
        localStorage.removeItem('quiz_studentId');
        localStorage.removeItem('quiz_answers');
        localStorage.removeItem('quiz_currentQuiz');
        localStorage.removeItem('quiz_currentStudent');
        localStorage.removeItem('quiz_sessionId');
      }
      
      newState = { ...state, studentId: action.payload || null };
      break;
      
    case 'SET_CURRENT_STUDENT':
      newState = { ...state, currentStudent: action.payload };
      break;
      
    case 'SET_SESSION_ID':
      newState = { ...state, sessionId: action.payload };
      break;
    
    case 'SET_SELECTED_STANDARD':
      newState = { ...state, selectedStandard: action.payload };
      break;
    
    case 'SET_QUIZ_SETTINGS':
      newState = { 
        ...state, 
        quizSettings: { ...state.quizSettings, ...action.payload }
      };
      break;
    
    case 'SET_CURRENT_QUIZ':
      newState = {
        ...state,
        currentQuiz: action.payload,
        currentQuestionIndex: 0,
        answers: [],
        startTime: Date.now(),
        questionStartTime: Date.now(),
        quizResults: null,
        sessionId: action.payload.sessionId || null,
      };
      break;
    
    case 'SET_QUESTION_START_TIME':
      newState = { ...state, questionStartTime: Date.now() };
      break;
    
    case 'ADD_ANSWER':
      const newAnswer: QuizAnswer = {
        ...action.payload,
        timeSpent: Date.now() - (state.questionStartTime || 0),
      };
      newState = {
        ...state,
        answers: [...state.answers, newAnswer],
      };
      break;
    
    case 'ADD_PENDING_SUBMISSION':
      newState = {
        ...state,
        pendingSubmissions: [...state.pendingSubmissions, action.payload],
      };
      break;
    
    case 'REMOVE_PENDING_SUBMISSION':
      newState = {
        ...state,
        pendingSubmissions: state.pendingSubmissions.filter(
          submission => submission.questionId !== action.payload
        ),
      };
      break;
    
    case 'NEXT_QUESTION':
      newState = {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        questionStartTime: Date.now(),
      };
      break;
    
    case 'SET_QUIZ_RESULTS':
      newState = {
        ...state,
        quizResults: action.payload,
      };
      break;
    
    case 'RESET_QUIZ':
      localStorage.removeItem('quiz_answers');
      localStorage.removeItem('quiz_currentQuiz');
      localStorage.removeItem('quiz_sessionId');
      
      newState = {
        ...state,
        currentQuiz: null,
        currentQuestionIndex: 0,
        answers: [],
        pendingSubmissions: [],
        startTime: null,
        questionStartTime: null,
        quizResults: null,
        sessionId: null,
      };
      break;
    
    case 'CLEAR_ERROR':
      newState = { ...state, error: null };
      break;
    
    default:
      newState = state;
      break;
  }
  
  saveStateToStorage(newState);
  return newState;
};

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  

  const setLoading = useCallback((loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }), [dispatch]);
  const setError = useCallback((error: string) => dispatch({ type: 'SET_ERROR', payload: error }), [dispatch]);
  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [dispatch]);
  const setStudentId = useCallback((studentId: string) => {
    dispatch({ type: 'SET_STUDENT_ID', payload: studentId });
  }, [dispatch]);
  const setCurrentStudent = useCallback((student: StudentLoginResponse) => {
    dispatch({ type: 'SET_CURRENT_STUDENT', payload: student });
  }, [dispatch]);
  const setSessionId = useCallback((sessionId: string) => {
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
  }, [dispatch]);
  const setSelectedStandard = useCallback((standard: Standard) => dispatch({ type: 'SET_SELECTED_STANDARD', payload: standard }), [dispatch]);
  const setQuizSettings = useCallback((settings: Partial<QuizSettings>) => dispatch({ type: 'SET_QUIZ_SETTINGS', payload: settings }), [dispatch]);
  const setCurrentQuiz = useCallback((quiz: Quiz) => dispatch({ type: 'SET_CURRENT_QUIZ', payload: quiz }), [dispatch]);
  const setQuestionStartTime = useCallback(() => dispatch({ type: 'SET_QUESTION_START_TIME' }), [dispatch]);
  const addAnswer = useCallback((answer: Omit<QuizAnswer, 'timeSpent'>) => {
    dispatch({ type: 'ADD_ANSWER', payload: answer });
  }, [dispatch]);
  const nextQuestion = useCallback(() => dispatch({ type: 'NEXT_QUESTION' }), [dispatch]);
  const setQuizResults = useCallback((results: QuizResults) => dispatch({ type: 'SET_QUIZ_RESULTS', payload: results }), [dispatch]);
  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
  }, [dispatch]);

  const completeQuiz = useCallback(async (): Promise<boolean> => {
    if (!state.sessionId || !state.studentId) {
      return false;
    }

    try {
      const completionRequest: QuizCompletionRequest = {
        sessionId: state.sessionId,
        studentId: state.studentId
      };

      const response = await apiService.completeQuizSession(completionRequest);

      if (!response || !response.results) {
        throw new Error('Invalid completion response from backend');
      }

      const results: QuizResults = {
        totalQuestions: response.results.totalQuestions,
        correctAnswers: response.results.correctAnswers,
        totalTime: response.results.totalTime,
        accuracy: response.results.accuracy * 100,
        answers: state.answers
      };
      
      setQuizResults(results);
      return true;
    } catch (error: any) {

      const currentTimeMs = Date.now();
      const totalTimeMs = state.startTime ? currentTimeMs - state.startTime : 0;
      const correctCount = state.answers.filter(a => a.isCorrect).length;
      const totalCount = state.answers.length;
      
      const fallbackResults: QuizResults = {
        totalQuestions: totalCount,
        correctAnswers: correctCount,
        totalTime: totalTimeMs,
        accuracy: totalCount > 0 ? (correctCount / totalCount) * 100 : 0,
        answers: state.answers
      };
      
      setQuizResults(fallbackResults);
      return false;
    }
  }, [state.sessionId, state.studentId, state.startTime, state.answers, state.pendingSubmissions, setQuizResults]);

  const retryPendingSubmissions = useCallback(async (): Promise<void> => {
    if (!state.sessionId || !state.studentId || state.pendingSubmissions.length === 0) {
      return;
    }

    for (const submission of state.pendingSubmissions) {
      if (submission.retryCount >= 3) {
        continue;
      }

      try {
        const submitRequest = {
          sessionId: state.sessionId,
          studentId: state.studentId,
          questionId: submission.questionId,
          answer: submission.answer,
          timeSpent: submission.timeSpent,
          quizId: state.currentQuiz?.id || '',
        };

        await apiService.submitAnswer(submitRequest);
        
        dispatch({ type: 'REMOVE_PENDING_SUBMISSION', payload: submission.questionId });
      } catch (error: any) {
        
        const updatedSubmission = { ...submission, retryCount: submission.retryCount + 1 };
        dispatch({ type: 'REMOVE_PENDING_SUBMISSION', payload: submission.questionId });
        dispatch({ type: 'ADD_PENDING_SUBMISSION', payload: updatedSubmission });
      }
    }
  }, [state.sessionId, state.studentId, state.pendingSubmissions, state.currentQuiz?.id, dispatch]);

  const value: QuizContextType = {
    state,
    dispatch,
    
    setLoading,
    setError,
    clearError,
    setStudentId,
    setCurrentStudent,
    setSessionId,
    setSelectedStandard,
    setQuizSettings,
    setCurrentQuiz,
    setQuestionStartTime,
    addAnswer,
    nextQuestion,
    setQuizResults,
    resetQuiz,
    completeQuiz,
    retryPendingSubmissions,
    
    getCurrentQuestion: useCallback((): QuizQuestion | null => {
      if (!state.currentQuiz || !state.currentQuiz.questions) return null;
      return state.currentQuiz.questions[state.currentQuestionIndex] || null;
    }, [state.currentQuiz, state.currentQuestionIndex]),
    
    isQuizComplete: useCallback((): boolean => {
      if (!state.currentQuiz) return false;
      return state.currentQuestionIndex >= state.currentQuiz.questions.length;
    }, [state.currentQuiz, state.currentQuestionIndex]),
    
    getQuizProgress: useCallback((): number => {
      if (!state.currentQuiz) return 0;
      return ((state.currentQuestionIndex + 1) / state.currentQuiz.questions.length) * 100;
    }, [state.currentQuiz, state.currentQuestionIndex]),
    
    getTotalTime: useCallback((): number => {
      if (!state.startTime) return 0;
      return Date.now() - state.startTime;
    }, [state.startTime]),
    
    getCorrectAnswersCount: useCallback((): number => {
      return state.answers.filter(answer => answer.isCorrect).length;
    }, [state.answers]),
    
    getAccuracy: useCallback((): number => {
      if (state.answers.length === 0) return 0;
      return (state.answers.filter(answer => answer.isCorrect).length / state.answers.length) * 100;
    }, [state.answers]),
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export default QuizContext;

export type {
  QuizState,
  QuizAction,
  QuizSettings,
  QuizAnswer,
  QuizResults,
  QuizContextType,
};