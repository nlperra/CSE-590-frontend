import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavigationBar from './components/NavigationBar';
import StandardsPage from './components/StandardsPage';
import QuizPage from './components/QuizPage';
import ResultsPage from './components/ResultsPage';
import AnalyticsPage from './components/AnalyticsPage';
import QuizHistory from './components/QuizHistory';
import AuthPage from './components/AuthPage';
import { QuizProvider, useQuiz } from './contexts/QuizContext';

const AuthWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <AuthPage onLoginSuccess={() => {
    navigate('/standards');
  }} />;
};

const NavigationTracker: React.FC = () => {
  const location = useLocation();
  const { state } = useQuiz();
  
  useEffect(() => {
  }, [location.pathname, state.studentId, state.answers, state.currentQuiz, state.sessionId]);
  
  return null;
};

function App(): React.ReactElement {
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    };
    
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  return (
    <QuizProvider>
      <div className="App">
        <NavigationTracker />
        <NavigationBar />
        <Container fluid>
          <Routes>
            <Route path="/" element={<AuthWrapper />} />
            <Route path="/login" element={<AuthWrapper />} />
            <Route path="/auth" element={<AuthWrapper />} />
            <Route path="/standards" element={<StandardsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/history" element={<QuizHistory />} />
          </Routes>
        </Container>
      </div>
    </QuizProvider>
  );
}

export default App;