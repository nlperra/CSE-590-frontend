import React from 'react';
import { Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { apiService } from '../services/apiService';
import { useQuiz } from '../contexts/QuizContext';

interface SubSkillBreakdown {
  skill: string;
  masteryLevel: 'mastered' | 'developing' | 'struggling';
}

interface Recommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
}

interface ExtendedPerformanceReport {
  studentId: string;
  name: string;
  overallAccuracy: number;
  totalQuestionsAnswered: number;
  currentDifficultyLevel: number;
  masteredStandards: string[];
  strugglingStandards: string[];
  sessions: any[];
  subSkillBreakdown?: SubSkillBreakdown[];
  extendedRecommendations?: Recommendation[];
}

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    getCorrectAnswersCount,
    getAccuracy,
    getTotalTime,
    resetQuiz,
  } = useQuiz();

  React.useEffect(() => {
  }, [state]);

  const { data: report, isLoading, error } = useQuery<ExtendedPerformanceReport>(
    ['performanceReport', state.studentId],
    async () => {
      try {
        const baseReport = await apiService.getPerformanceReport(state.studentId!);
        return {
          ...baseReport,
          subSkillBreakdown: undefined,
          extendedRecommendations: undefined,
        } as ExtendedPerformanceReport;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return {
            studentId: state.studentId!,
            name: state.studentId! || 'Unknown Student',
            overallAccuracy: 0,
            totalQuestionsAnswered: 0,
            currentDifficultyLevel: 1,
            masteredStandards: [],
            strugglingStandards: [],
            sessions: [],
            subSkillBreakdown: undefined,
            extendedRecommendations: undefined,
          } as ExtendedPerformanceReport;
        }
        
        if (error.response?.status === 500) {
          const currentSessionCorrect = state.answers?.filter(a => a.isCorrect).length || 0;
          const currentSessionTotal = state.answers?.length || 0;
          return {
            studentId: state.studentId!,
            name: state.studentId! || 'Unknown Student',
            overallAccuracy: currentSessionTotal > 0 ? (currentSessionCorrect / currentSessionTotal) * 100 : 0,
            totalQuestionsAnswered: currentSessionTotal,
            currentDifficultyLevel: 1,
            masteredStandards: [],
            strugglingStandards: [],
            sessions: [],
            subSkillBreakdown: undefined,
            extendedRecommendations: undefined,
          } as ExtendedPerformanceReport;
        }
        
        throw error;
      }
    },
    {
      enabled: !!state.studentId && state.studentId !== 'anonymous',
      staleTime: 1 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404 || error?.response?.status === 500) return false;
        return failureCount < 3;
      },
    }
  );

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTakeAnotherQuiz = (): void => {
    resetQuiz();
    navigate('/quiz');
  };

  const handleViewStandards = (): void => {
    navigate('/standards');
  };

  const getMasteryBadgeVariant = (masteryLevel: string): string => {
    switch (masteryLevel) {
      case 'mastered':
        return 'success';
      case 'developing':
        return 'warning';
      case 'struggling':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (!state.answers || state.answers.length === 0) {
    return (
      <div className="text-center py-5">
        <Alert variant="info">
          <h4>No Quiz Results</h4>
          <p>Complete a quiz to see your results here.</p>
          <Button variant="primary" onClick={handleTakeAnotherQuiz}>
            Take a Quiz
          </Button>
        </Alert>
      </div>
    );
  }

  const correctAnswers = getCorrectAnswersCount();
  const totalQuestions = state.answers.length;
  const accuracy = getAccuracy();
  const totalTime = getTotalTime();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quiz Results</h2>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="performance-metric">
            <Card.Body>
              <h3>{correctAnswers}/{totalQuestions}</h3>
              <p>Questions Correct</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="performance-metric">
            <Card.Body>
              <h3>{accuracy.toFixed(1)}%</h3>
              <p>Accuracy</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="performance-metric">
            <Card.Body>
              <h3>{formatTime(totalTime)}</h3>
              <p>Total Time</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {report && !isLoading && !error && (
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Sub-skill Performance</h5>
              </Card.Header>
              <Card.Body>
                {report.subSkillBreakdown && report.subSkillBreakdown.length > 0 ? (
                  report.subSkillBreakdown.map((skill: SubSkillBreakdown, index: number) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                      <span>{skill.skill}</span>
                      <Badge bg={getMasteryBadgeVariant(skill.masteryLevel)}>
                        {skill.masteryLevel}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No detailed performance data available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5>Recommendations</h5>
              </Card.Header>
              <Card.Body>
                {report.extendedRecommendations && report.extendedRecommendations.length > 0 ? (
                  report.extendedRecommendations.map((rec: Recommendation, index: number) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong>{rec.type.replace('_', ' ').toUpperCase()}</strong>
                        <Badge bg={getPriorityBadgeVariant(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="mb-0">{rec.message}</p>
                    </div>
                  ))
                ) : (
                  <div>
                    {report.overallAccuracy < 70 && (
                      <div className="mb-3">
                        <p className="mb-0">
                          Consider reviewing the struggling standards: {report.strugglingStandards?.length > 0 ? report.strugglingStandards.join(', ') : 'Focus on areas where you had difficulty.'}
                        </p>
                      </div>
                    )}
                    {report.masteredStandards?.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-0">
                          Great work! You've mastered: {report.masteredStandards.join(', ')}
                        </p>
                      </div>
                    )}
                    {report.totalQuestionsAnswered === 0 && (
                      <div className="mb-3">
                        <p className="mb-0">
                          Take more quizzes to get personalized recommendations and track your progress.
                        </p>
                      </div>
                    )}
                    {report.totalQuestionsAnswered > 0 && (report.strugglingStandards?.length || 0) === 0 && report.overallAccuracy >= 70 && (
                      <div className="mb-3">
                        <p className="mb-0">
                          Excellent progress! Continue practicing to maintain your skills.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>Question Review</h5>
            </Card.Header>
            <Card.Body>
              {state.answers.map((answer, index) => (
                <div key={index} className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6>Question {index + 1}</h6>
                    <Badge bg={answer.isCorrect ? 'success' : 'danger'}>
                      {answer.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                  <p className="mb-2">Question content not available in answer data</p>
                  <div className="small">
                    <div><strong>Your Answer:</strong> {String.fromCharCode(65 + answer.answer)}</div>
                    <div><strong>Time:</strong> {formatTime(answer.timeSpent)}</div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="text-center">
        <Button variant="primary" className="me-2" onClick={handleTakeAnotherQuiz}>
          Take Another Quiz
        </Button>
        <Button variant="outline-primary" onClick={handleViewStandards}>
          View Standards
        </Button>
      </div>
    </div>
  );
};

export default ResultsPage;