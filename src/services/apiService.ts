import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface Standard {
  code: string;
  title: string;
  description: string;
  difficulty: number;
  topic: string;
}

interface QuizQuestion {
  id: string;
  standardCode: string;
  question: string;
  choices: { [key: string]: string };
  correctAnswer: string;
  difficulty: number;
  explanation?: string;
  type?: string;
  subSkill?: string;
  generatedAt?: string;
  isFallback?: boolean;
  misconceptions?: { [key: string]: string };
}

interface QuizRequest {
  standardCodes?: string[];
  standardCode?: string;
  numQuestions?: number;
  questionCount?: number;
  difficulty?: number;
  studentId?: string;
}

interface QuizSessionRequest {
  studentId: string;
  standardCode: string;
  questionCount: number;
}

interface QuizSessionResponse {
  sessionId: string;
  quizId: string;
}

interface QuizCompletionRequest {
  sessionId: string;
  studentId: string;
}

interface QuizCompletionResponse {
  sessionId: string;
  results: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    totalTime: number;
  };
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
  studentId?: string;
  sessionId?: string;
  isTargeted?: boolean;
  focusArea?: 'struggling' | 'review' | 'mixed';
  targetedStandards?: string[];
}

interface AnswerRequest {
  sessionId: string;
  quizId: string;
  questionId: string;
  studentId: string;
  answer: number;
  timeSpent: number;
}

interface AnswerResponse {
  correct: boolean;
  nextQuestionId?: string;
  explanation?: string;
  adaptedDifficulty?: number;
}

interface StudentProfile {
  studentId: string;
  masteredStandards: string[];
  currentLevel: number;
  strengths: string[];
  weaknesses: string[];
}

interface StudentRegistrationRequest {
  studentId: string;
  name: string;
}

interface StudentLoginRequest {
  studentId: string;
}

interface StudentLoginResponse {
  studentId: string;
  name: string;
  exists: boolean;
}

interface PerformanceReport {
  studentId: string;
  name: string;
  overallAccuracy: number;
  totalQuestionsAnswered: number;
  currentDifficultyLevel: number;
  masteredStandards: string[];
  strugglingStandards: string[];
  sessions: QuizSession[];
}

interface QuizSession {
  sessionId: string;
  standardCode: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  completedAt: string;
}

interface StandardPerformance {
  standardCode: string;
  standardTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  masteryLevel: 'struggling' | 'developing' | 'proficient' | 'mastered';
  lastAttempted: string;
  trend: 'improving' | 'declining' | 'stable';
}

interface StudentAnalytics {
  studentId: string;
  name: string;
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  averageQuizTime: number;
  strongStandards: StandardPerformance[];
  strugglingStandards: StandardPerformance[];
  recentActivity: {
    date: string;
    standardCode: string;
    accuracy: number;
    questionsAnswered: number;
  }[];
  masteryDistribution: {
    struggling: number;
    developing: number;
    proficient: number;
    mastered: number;
  };
}

interface TargetedQuizRequest {
  studentId: string;
  standardCodes: string[];
  questionCount: number;
  focusArea: 'struggling' | 'review' | 'mixed';
}

interface QuizHistoryItem {
  sessionId: string;
  quizId: string;
  standardCode: string;
  standardTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  totalTimeMs: number;
  startedAt: string;
  completedAt: string;
  isTargeted: boolean;
  focusArea?: 'struggling' | 'review' | 'mixed';
  targetedStandards?: string[];
  questions: QuizQuestionResult[];
}

interface QuizQuestionResult {
  questionId: string;
  question: string;
  choices: { [key: string]: string };
  correctAnswer: string;
  studentAnswer: number;
  isCorrect: boolean;
  timeSpentMs: number;
  explanation?: string;
}

interface QuizHistoryResponse {
  studentId: string;
  totalQuizzes: number;
  quizzes: QuizHistoryItem[];
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

interface QuizHistoryFilters {
  standardCode?: string;
  dateFrom?: string;
  dateTo?: string;
  minAccuracy?: number;
  maxAccuracy?: number;
  isTargeted?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'completedAt' | 'accuracy' | 'totalTime' | 'standardCode';
  sortOrder?: 'asc' | 'desc';
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
);

export const apiService = {
  getAllStandards: async (): Promise<Standard[]> => {
    const response: AxiosResponse<Standard[]> = await apiClient.get('/standards');
    return response.data;
  },

  getStandardByCode: async (code: string): Promise<Standard> => {
    const response: AxiosResponse<Standard> = await apiClient.get(`/standards/${code}`);
    return response.data;
  },

  searchStandardsByTopic: async (topic: string): Promise<Standard[]> => {
    const response: AxiosResponse<Standard[]> = await apiClient.get(`/standards/search?topic=${encodeURIComponent(topic)}`);
    return response.data;
  },

  getStandardsByDifficulty: async (maxDifficulty: number): Promise<Standard[]> => {
    const response: AxiosResponse<Standard[]> = await apiClient.get(`/standards/difficulty/${maxDifficulty}`);
    return response.data;
  },

  getRecommendedSequence: async (code: string): Promise<Standard[]> => {
    const response: AxiosResponse<Standard[]> = await apiClient.get(`/standards/${code}/sequence`);
    return response.data;
  },

  generateQuiz: async (request: QuizRequest): Promise<Quiz> => {
    const response: AxiosResponse<Quiz> = await apiClient.post('/quiz/generate', request);
    return response.data;
  },

  startQuizSession: async (request: QuizSessionRequest): Promise<QuizSessionResponse> => {
    const response: AxiosResponse<QuizSessionResponse> = await apiClient.post('/quiz/session/start', request);
    return response.data;
  },

  completeQuizSession: async (request: QuizCompletionRequest): Promise<QuizCompletionResponse> => {
    const response: AxiosResponse<QuizCompletionResponse> = await apiClient.post('/quiz/session/complete', request);
    return response.data;
  },

  getQuestionById: async (id: string): Promise<QuizQuestion> => {
    const response: AxiosResponse<QuizQuestion> = await apiClient.get(`/quiz/question/${id}`);
    return response.data;
  },

  getQuestionsByStandard: async (standardCode: string): Promise<QuizQuestion[]> => {
    const response: AxiosResponse<QuizQuestion[]> = await apiClient.get(`/quiz/standard/${standardCode}`);
    return response.data;
  },

  submitAnswer: async (request: AnswerRequest): Promise<AnswerResponse> => {
    const response: AxiosResponse<AnswerResponse> = await apiClient.post('/adaptive/submit-answer', request);
    return response.data;
  },

  getStudentProfile: async (studentId: string): Promise<StudentProfile> => {
    const response: AxiosResponse<StudentProfile> = await apiClient.get(`/adaptive/student/${studentId}/profile`);
    return response.data;
  },

  getPerformanceReport: async (studentId: string): Promise<PerformanceReport> => {
    const response: AxiosResponse<PerformanceReport> = await apiClient.get(`/adaptive/student/${studentId}/report`);
    return response.data;
  },

  getStudentAnalytics: async (studentId: string): Promise<StudentAnalytics> => {
    const response: AxiosResponse<StudentAnalytics> = await apiClient.get(`/analytics/student/${studentId}`);
    return response.data;
  },

  generateTargetedQuiz: async (request: TargetedQuizRequest): Promise<Quiz> => {
    const response: AxiosResponse<Quiz> = await apiClient.post('/analytics/quiz/generate/targeted', request);
    return response.data;
  },

  getQuizHistory: async (studentId: string): Promise<QuizHistoryResponse> => {
    try {
      const response: AxiosResponse<QuizHistoryResponse> = await apiClient.get(`/quiz/history/${studentId}`);
      return response.data;
    } catch (error: any) {
      try {
        const performanceResponse: AxiosResponse<PerformanceReport> = await apiClient.get(`/adaptive/student/${studentId}/report`);
        const performanceReport = performanceResponse.data;
        
        const quizHistoryResponse: QuizHistoryResponse = {
          studentId: performanceReport.studentId,
          totalQuizzes: performanceReport.sessions?.length || 0,
          quizzes: (performanceReport.sessions || []).map(session => ({
            sessionId: session.sessionId,
            quizId: session.sessionId,
            standardCode: session.standardCode,
            standardTitle: session.standardCode,
            totalQuestions: session.totalQuestions,
            correctAnswers: session.correctAnswers,
            accuracy: session.accuracy * 100,
            totalTimeMs: 0,
            startedAt: session.completedAt,
            completedAt: session.completedAt,
            isTargeted: false,
            questions: []
          }))
        };
        
        return quizHistoryResponse;
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  loginStudent: async (request: StudentLoginRequest): Promise<StudentLoginResponse> => {
    const response: AxiosResponse<StudentLoginResponse> = await apiClient.post('/auth/login', request);
    return response.data;
  },

  registerStudent: async (request: StudentRegistrationRequest): Promise<StudentProfile> => {
    const response: AxiosResponse<StudentProfile> = await apiClient.post('/auth/register', request);
    return response.data;
  },

  checkStudentExists: async (studentId: string): Promise<boolean> => {
    try {
      const response: AxiosResponse<{exists: boolean}> = await apiClient.get(`/auth/check/${studentId}`);
      return response.data.exists;
    } catch (error: any) {
      return false;
    }
  },
};

export default apiService;

export type {
  Standard,
  QuizQuestion,
  QuizRequest,
  Quiz,
  AnswerRequest,
  AnswerResponse,
  StudentProfile,
  StudentRegistrationRequest,
  StudentLoginRequest,
  StudentLoginResponse,
  PerformanceReport,
  QuizSession,
  QuizSessionRequest,
  QuizSessionResponse,
  QuizCompletionRequest,
  QuizCompletionResponse,
  StandardPerformance,
  StudentAnalytics,
  TargetedQuizRequest,
  QuizHistoryItem,
  QuizQuestionResult,
  QuizHistoryResponse,
  QuizHistoryFilters,
};