import React, { useState } from 'react';
import { 
  Container, Row, Col, Card, Table, Badge, Button, 
  Modal, Spinner, Alert 
} from 'react-bootstrap';
import { useQuery } from 'react-query';
import { 
  apiService, 
  QuizHistoryItem
} from '../services/apiService';
import { useQuiz } from '../contexts/QuizContext';

const QuizHistory: React.FC = () => {
  const { state } = useQuiz();
  const [selectedQuiz, setSelectedQuiz] = useState<QuizHistoryItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: historyData, isLoading, error, refetch } = useQuery(
    ['quizHistory', state.studentId],
    async () => {
      if (!state.studentId) {
        throw new Error('No student ID available');
      }
      
      try {
        const result = await apiService.getQuizHistory(state.studentId);
        return result;
      } catch (error: any) {
        if (error.response?.status === 404 || error.response?.status === 500) {
          return {
            studentId: state.studentId,
            totalQuizzes: 0,
            quizzes: []
          };
        }
        throw error;
      }
    },
    {
      enabled: !!state.studentId,
      staleTime: 2 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404 || error?.response?.status === 500) return false;
        return failureCount < 3;
      },
    }
  );


  const handleShowDetails = (quiz: QuizHistoryItem) => {
    setSelectedQuiz(quiz);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'success';
    if (accuracy >= 80) return 'primary';
    if (accuracy >= 70) return 'info';
    if (accuracy >= 60) return 'warning';
    return 'danger';
  };

  if (!state.studentId) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <Alert.Heading>Authentication Required</Alert.Heading>
          <p>Please log in to view your quiz history.</p>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status" className="me-2" />
        <span>Loading your quiz history...</span>
      </Container>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.status === 500 
      ? 'Quiz history system is not yet available. This feature will be enabled once the backend is updated.'
      : 'Failed to load your quiz history. Please try again.';
      
    return (
      <Container className="mt-4">
        <Alert variant={(error as any)?.response?.status === 500 ? 'info' : 'danger'}>
          <Alert.Heading>Quiz History Unavailable</Alert.Heading>
          <p>{errorMessage}</p>
          {(error as any)?.response?.status !== 500 && (
            <Button variant="outline-danger" onClick={() => refetch()}>
              Retry
            </Button>
          )}
        </Alert>
      </Container>
    );
  }

  const quizzes = historyData?.quizzes || [];

  return (
    <Container fluid className="quiz-history py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>📚 Quiz History</h1>
              <p className="text-muted mb-0">
                {historyData?.totalQuizzes || quizzes.length} quizzes completed
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quiz Results</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {quizzes.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No quiz results found. Take some quizzes to see your history!</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Standard</th>
                      <th>Questions</th>
                      <th>Accuracy</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((quiz) => (
                      <tr key={quiz.sessionId}>
                        <td>
                          <div>
                            <strong>{formatDate(quiz.completedAt).split(',')[0]}</strong>
                            <br />
                            <small className="text-muted">
                              {formatDate(quiz.completedAt).split(',')[1]}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{quiz.standardCode}</strong>
                            <br />
                            <small className="text-muted">{quiz.standardTitle}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{quiz.correctAnswers}/{quiz.totalQuestions}</strong>
                            <br />
                            <small className="text-muted">questions</small>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getAccuracyColor(quiz.accuracy)} className="fs-6">
                            {quiz.accuracy.toFixed(1)}%
                          </Badge>
                        </td>
                        <td>
                          <span className="text-muted">
                            {quiz.totalTimeMs > 0 ? formatDuration(quiz.totalTimeMs) : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <Badge bg="secondary">
                            📝 Practice
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowDetails(quiz)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>


      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Quiz Details - {selectedQuiz?.standardCode}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuiz && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">📊 Performance Summary</h6>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Standard:</strong> {selectedQuiz.standardCode}</p>
                      <p><strong>Completed:</strong> {formatDate(selectedQuiz.completedAt)}</p>
                      <p><strong>Score:</strong> {selectedQuiz.correctAnswers}/{selectedQuiz.totalQuestions}</p>
                      <p><strong>Accuracy:</strong> 
                        <Badge bg={getAccuracyColor(selectedQuiz.accuracy)} className="ms-2">
                          {selectedQuiz.accuracy.toFixed(1)}%
                        </Badge>
                      </p>
                      {selectedQuiz.totalTimeMs > 0 && (
                        <p><strong>Total Time:</strong> {formatDuration(selectedQuiz.totalTimeMs)}</p>
                      )}
                      <p><strong>Quiz Type:</strong> 
                        <Badge bg="secondary" className="ms-2">📝 Standard Practice</Badge>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">📈 Question Breakdown</h6>
                    </Card.Header>
                    <Card.Body>
                      <div>
                        <p><strong>Total Questions:</strong> {selectedQuiz.totalQuestions}</p>
                        <p><strong>Correct Answers:</strong> {selectedQuiz.correctAnswers}</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default QuizHistory;