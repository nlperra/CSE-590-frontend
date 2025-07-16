import React, { useState } from 'react';
import { Row, Col, Card, ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { apiService, Standard } from '../services/apiService';
import { useQuiz } from '../contexts/QuizContext';

interface ExtendedStandard extends Standard {
  subSkills?: string[];
  concepts?: string[];
  vocabulary?: string[];
}

const StandardsPage: React.FC = () => {
  const [selectedStandard, setSelectedStandard] = useState<ExtendedStandard | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [quizCreationError, setQuizCreationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { state, setSelectedStandard: setQuizStandard, setCurrentQuiz, setSessionId } = useQuiz();

  const { data: standards, isLoading, error } = useQuery<ExtendedStandard[]>(
    'standards',
    apiService.getAllStandards,
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const handleStandardSelect = (standard: ExtendedStandard): void => {
    setSelectedStandard(standard);
  };

  const handleCreateQuiz = async (standard: ExtendedStandard): Promise<void> => {
    if (!state.studentId) {
      navigate('/auth');
      return;
    }

    try {
      setIsGeneratingQuiz(true);
      setQuizCreationError(null);
      setQuizStandard(standard);
      
      try {
        const sessionRequest = {
          studentId: state.studentId,
          standardCode: standard.code,
          questionCount: 10
        };
        
        const sessionResponse = await apiService.startQuizSession(sessionRequest);
        setSessionId(sessionResponse.sessionId);
        
        const quizRequest = {
          standardCode: standard.code,
          questionCount: 10,
          difficulty: standard.difficulty,
          studentId: state.studentId,
        };
        
        const quiz = await apiService.generateQuiz(quizRequest);
        quiz.sessionId = sessionResponse.sessionId;
        setCurrentQuiz(quiz);
        navigate('/quiz');
      } catch (sessionError: any) {
        const quizRequest = {
          standardCode: standard.code,
          questionCount: 10,
          difficulty: standard.difficulty,
          studentId: state.studentId,
        };
        
        try {
          const quiz = await apiService.generateQuiz(quizRequest);
          
          if (!quiz.questions || quiz.questions.length === 0) {
            throw new Error('Generated quiz has no questions');
          }
          
          setCurrentQuiz(quiz);
          navigate('/quiz');
        } catch (quizError: any) {
          throw quizError;
        }
      }
    } catch (error) {
      setQuizCreationError('Failed to create quiz. Please try again or contact support if the problem persists.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const renderDifficultyStars = (difficulty: number): React.ReactElement[] => {
    const stars: React.ReactElement[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`difficulty-star ${i <= difficulty ? 'filled' : ''}`}
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: i <= difficulty ? '#ffc107' : '#ddd',
            marginRight: '2px',
          }}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading standards...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load standards. Please try again later.';
    return (
      <Alert variant="danger" className="error-message">
        <Alert.Heading>Error Loading Standards</Alert.Heading>
        <p>{errorMessage}</p>
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Create Quiz</h2>
          <p className="text-muted mb-0">Select a standard to generate an AI-powered quiz</p>
        </div>
        {state.studentId && (
          <div className="text-muted text-end">
            <small>Logged in as: <strong>{state.studentId}</strong></small>
          </div>
        )}
      </div>

      {quizCreationError && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Quiz Creation Failed</Alert.Heading>
          <p>{quizCreationError}</p>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => setQuizCreationError(null)}
          >
            Dismiss
          </Button>
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Indiana 5th Grade Math Standards</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {standards && standards.length > 0 ? (
                standards.map((standard) => (
                  <ListGroup.Item
                    key={standard.code}
                    action
                    onClick={() => handleStandardSelect(standard)}
                    className={`standard-card ${selectedStandard?.code === standard.code ? 'selected' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{standard.code}</h6>
                        <p className="mb-1">{standard.title}</p>
                        <small className="text-muted">{standard.description}</small>
                      </div>
                      <div className="text-end">
                        <div className="difficulty-indicator">
                          {renderDifficultyStars(standard.difficulty)}
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>
                  <div className="text-center py-4">
                    <p className="text-muted">No standards available</p>
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Standard Details</h5>
            </Card.Header>
            <Card.Body>
              {selectedStandard ? (
                <div>
                  <h6>{selectedStandard.code}</h6>
                  <p className="mb-2">{selectedStandard.title}</p>
                  <p className="text-muted mb-3">{selectedStandard.description}</p>

                  <div className="mb-3">
                    <strong>Sub-skills:</strong>
                    <ul className="list-unstyled ms-3">
                      {selectedStandard.subSkills && selectedStandard.subSkills.length > 0 ? (
                        selectedStandard.subSkills.map((skill, index) => (
                          <li key={index}>• {skill}</li>
                        ))
                      ) : (
                        <li>No sub-skills listed</li>
                      )}
                    </ul>
                  </div>

                  <div className="mb-3">
                    <strong>Key Concepts:</strong>
                    <div className="mt-1">
                      {selectedStandard.concepts && selectedStandard.concepts.length > 0 ? (
                        selectedStandard.concepts.map((concept, index) => (
                          <Badge key={index} bg="primary" className="me-1 mb-1">
                            {concept}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted">No concepts listed</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Difficulty:</strong>
                    <div className="difficulty-indicator ms-2">
                      {renderDifficultyStars(selectedStandard.difficulty)}
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Key Vocabulary:</strong>
                    <div className="mt-1">
                      {selectedStandard.vocabulary && selectedStandard.vocabulary.length > 0 ? (
                        selectedStandard.vocabulary.map((term, index) => (
                          <Badge key={index} bg="secondary" className="me-1 mb-1">
                            {term}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted">No vocabulary listed</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCreateQuiz(selectedStandard)}
                      disabled={isGeneratingQuiz}
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          AI Generating Quiz...
                        </>
                      ) : (
                        'Create Quiz'
                      )}
                    </Button>
                    {isGeneratingQuiz && (
                      <div className="mt-2">
                        <small className="text-muted">
                          AI is creating personalized questions for this standard. This may take up to 2 minutes.
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted">Select a standard to view details</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StandardsPage;