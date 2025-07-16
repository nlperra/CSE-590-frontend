import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiService, Quiz, QuizQuestion as QuizQuestionType } from '../services/apiService';
import { useQuiz } from '../contexts/QuizContext';

interface QuizQuestionProps {
  question: QuizQuestionType;
  quiz: Quiz;
  questionIndex: number;
}

interface FeedbackResponse {
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  hint?: string;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, quiz, questionIndex }) => {
  const navigate = useNavigate();
  const {
    state,
    addAnswer,
    nextQuestion,
    setQuestionStartTime,
    getQuizProgress,
    getTotalTime,
    setError,
    completeQuiz,
    retryPendingSubmissions,
  } = useQuiz();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  useEffect(() => {
    setQuestionStartTime();
    setSelectedAnswer(null);
    setFeedback(null);
    setShowFeedback(false);
  }, [question.id, setQuestionStartTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (choice: string): void => {
    if (showFeedback) return;
    setSelectedAnswer(choice);
  };

  const handleSubmitAnswer = async (): Promise<void> => {
    if (!selectedAnswer || !state.questionStartTime) return;

    const timeSpent = Date.now() - state.questionStartTime;

    try {
      const answerNumber = selectedAnswer.charCodeAt(0) - 65;
      const isCorrect = selectedAnswer === question.correctAnswer;
      
      try {
        const submitRequest = {
          sessionId: state.sessionId || '',
          studentId: state.studentId || 'anonymous',
          questionId: question.id,
          answer: answerNumber,
          timeSpent,
          quizId: quiz.id,
        };
        
        if (!state.sessionId) {
          throw new Error('No sessionId available for backend submission');
        }
        
        const response = await apiService.submitAnswer(submitRequest);

        addAnswer({
          questionId: question.id,
          answer: answerNumber,
          isCorrect: response.correct,
        });

        setFeedback({
          isCorrect: response.correct,
          correctAnswer: question.correctAnswer,
          explanation: response.explanation || question.explanation,
        });
      } catch (submitError: any) {
        addAnswer({
          questionId: question.id,
          answer: answerNumber,
          isCorrect: isCorrect,
        });

        setFeedback({
          isCorrect: isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || `The correct answer is ${question.correctAnswer}.`,
        });
      }
      
      setShowFeedback(true);

    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Session expired. Please refresh and log in again.');
      } else {
        setError(error.response?.data?.message || 'Failed to submit answer. Please try again.');
      }
    }
  };

  const handleNextQuestion = (): void => {
    if (questionIndex < quiz.questions.length - 1) {
      nextQuestion();
    }
  };

  const getChoiceClass = (choice: string): string => {
    if (!showFeedback) {
      return selectedAnswer === choice ? 'choice-option selected' : 'choice-option';
    }

    if (choice === feedback?.correctAnswer) {
      return 'choice-option correct';
    }

    if (choice === selectedAnswer && !feedback?.isCorrect) {
      return 'choice-option incorrect';
    }

    return 'choice-option';
  };

  const progress = getQuizProgress();
  const totalTime = formatTime(Math.floor(getTotalTime() / 1000));
  const choices: { [key: string]: string } = question.choices || {};
  
  if (!question.choices || Object.keys(question.choices).length === 0) {
    return (
      <div>
        <Alert variant="danger">
          <Alert.Heading>Question Loading Error</Alert.Heading>
          <p>There was an issue loading this question. The quiz data may be malformed.</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>{question.standardCode} - Quiz Question</h5>
          <div>
            <span className="me-3">
              Question {questionIndex + 1} of {quiz.questions.length}
            </span>
            <span>Time: {totalTime}</span>
          </div>
        </Card.Header>
        <Card.Body>
          <ProgressBar now={progress} className="mb-3" />
          
          <div className="question-card">
            <div className="question-text">
              {question.question}
            </div>

            <div className="choices">
              {Object.entries(choices).map(([key, value]) => (
                <div
                  key={key}
                  className={getChoiceClass(key)}
                  onClick={() => handleAnswerSelect(key)}
                  style={{
                    cursor: showFeedback ? 'default' : 'pointer',
                    pointerEvents: showFeedback ? 'none' : 'auto',
                  }}
                >
                  <strong>{key}.</strong> {value}
                </div>
              ))}
            </div>

            {!showFeedback && (
              <div className="mt-3">
                <Button
                  variant="primary"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              </div>
            )}

            {showFeedback && feedback && (
              <div className="mt-3">
                <Alert variant={feedback.isCorrect ? 'success' : 'danger'}>
                  <strong>{feedback.isCorrect ? 'Correct!' : 'Incorrect'}</strong>
                  {feedback.explanation && <p className="mt-2 mb-0">{feedback.explanation}</p>}
                </Alert>

                {feedback.hint && (
                  <Alert variant="warning" className="mt-2">
                    <span className="hint-icon">💡</span>
                    <strong>Hint:</strong> {feedback.hint}
                  </Alert>
                )}

                <div className="mt-3">
                  {questionIndex < quiz.questions.length - 1 ? (
                    <Button variant="primary" onClick={handleNextQuestion}>
                      Next Question
                    </Button>
                  ) : (
                    <Button variant="success" onClick={async () => {
                      try {
                        await retryPendingSubmissions();
                        const completed = await completeQuiz();
                        
                        if (completed) {
                          setTimeout(async () => {
                            try {
                              await apiService.getQuizHistory(state.studentId!);
                            } catch (testError) {
                            }
                          }, 1000);
                        }
                        
                        navigate('/results');
                      } catch (error: any) {
                        setError('Failed to complete quiz. Please try again.');
                      }
                    }}>
                      Finish Quiz
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default QuizQuestion;