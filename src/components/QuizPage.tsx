import React, { useEffect } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';
import QuizQuestion from './QuizQuestion';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    getCurrentQuestion,
    resetQuiz,
  } = useQuiz();

  useEffect(() => {
    if (!state.studentId) {
      navigate('/auth');
      return;
    }

    if (!state.currentQuiz) {
      navigate('/standards');
      return;
    }

    if (state.currentQuiz && state.currentQuestionIndex >= state.currentQuiz.questions.length) {
      navigate('/results');
    }
  }, [state.studentId, state.currentQuiz, state.currentQuestionIndex, navigate]);

  const handleBackToStandards = (): void => {
    resetQuiz();
    navigate('/standards');
  };

  const currentQuestion = getCurrentQuestion();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quiz</h2>
        <Button variant="outline-secondary" size="sm" onClick={handleBackToStandards}>
          Create New Quiz
        </Button>
      </div>

      {state.error && (
        <Alert variant="danger" className="mb-4">
          {state.error}
        </Alert>
      )}

      {state.isLoading && (
        <div className="loading-spinner">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading quiz...</span>
          </Spinner>
        </div>
      )}

      {state.currentQuiz && !state.isLoading && currentQuestion ? (
        <QuizQuestion
          question={currentQuestion}
          quiz={state.currentQuiz}
          questionIndex={state.currentQuestionIndex}
        />
      ) : (
        !state.isLoading && (
          <Alert variant="info">
            No quiz available. Please create a new quiz to get started.
          </Alert>
        )
      )}
    </div>
  );
};

export default QuizPage;