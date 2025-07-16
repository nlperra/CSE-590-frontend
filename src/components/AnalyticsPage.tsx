import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useQuiz } from '../contexts/QuizContext';
import { apiService, StudentAnalytics, TargetedQuizRequest } from '../services/apiService';
import PerformanceOverview from './PerformanceOverview';
import StandardsBreakdown from './StandardsBreakdown';
import MasteryDistribution from './MasteryDistribution';
import RecentActivity from './RecentActivity';
import PracticeActions from './PracticeActions';
import { useNavigate } from 'react-router-dom';

const AnalyticsPage: React.FC = () => {
  const { state, setCurrentQuiz, setError } = useQuiz();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, [state.studentId]);

  const fetchAnalytics = async () => {
    if (!state.studentId) {
      setAnalyticsError('Please log in to view analytics');
      setLoadingAnalytics(false);
      return;
    }

    try {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      
      const data = await apiService.getStudentAnalytics(state.studentId);
      setAnalytics(data);
    } catch (error: any) {
      
      if (error.response?.status === 404) {
        setAnalyticsError('No analytics data available. Complete some quizzes to see your performance!');
      } else if (error.response?.status === 500) {
        setAnalyticsError('Analytics system is not yet available. Complete more quizzes and check back later.');
      } else {
        setAnalyticsError('Failed to load analytics. Please try again.');
      }
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const generateAndStartTargetedQuiz = async (request: Omit<TargetedQuizRequest, 'studentId'>) => {
    if (!state.studentId) {
      setError('Please log in to generate quizzes');
      return;
    }

    if (request.standardCodes.length === 0) {
      setError('Please select at least one standard to practice');
      return;
    }

    try {
      setGeneratingQuiz(true);
      setError('');
      
      const targetedRequest: TargetedQuizRequest = {
        ...request,
        studentId: state.studentId
      };

      const quiz = await apiService.generateTargetedQuiz(targetedRequest);
      
      setCurrentQuiz({
        ...quiz,
        isTargeted: true,
        focusArea: request.focusArea,
        targetedStandards: request.standardCodes
      });
      
      navigate('/quiz');
      
    } catch (error: any) {
      setError('Failed to generate targeted quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handlePracticeStrugglingAreas = async () => {
    if (!analytics?.strugglingStandards?.length) {
      setError('No struggling areas identified. Complete more quizzes for better analysis.');
      return;
    }

    const strugglingCodes = analytics.strugglingStandards.map(s => s.standardCode);
    await generateAndStartTargetedQuiz({
      standardCodes: strugglingCodes,
      questionCount: 10,
      focusArea: 'struggling'
    });
  };

  const handlePracticeSelected = async () => {
    if (selectedStandards.length === 0) {
      setError('Please select standards to practice');
      return;
    }

    await generateAndStartTargetedQuiz({
      standardCodes: selectedStandards,
      questionCount: 10,
      focusArea: 'mixed'
    });
  };

  const handleReviewStrongAreas = async () => {
    if (!analytics?.strongStandards?.length) {
      setError('No strong areas identified. Complete more quizzes for better analysis.');
      return;
    }

    const strongCodes = analytics.strongStandards.map(s => s.standardCode);
    await generateAndStartTargetedQuiz({
      standardCodes: strongCodes,
      questionCount: 10,
      focusArea: 'review'
    });
  };

  if (!state.studentId) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <Alert.Heading>Authentication Required</Alert.Heading>
          <p>Please log in to view your analytics dashboard.</p>
        </Alert>
      </Container>
    );
  }

  if (loadingAnalytics) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status" className="me-2" />
        <span>Loading your analytics...</span>
      </Container>
    );
  }

  if (analyticsError) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          <Alert.Heading>No Analytics Available</Alert.Heading>
          <p>{analyticsError}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <button className="btn btn-outline-info" onClick={fetchAnalytics}>
              Refresh
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="analytics-dashboard py-4">
      <Row>
        <Col>
          <h1 className="mb-4">📊 Analytics Dashboard</h1>
          {state.studentId && (
            <p className="text-muted mb-4">
              Performance overview for {state.studentId}
            </p>
          )}
        </Col>
      </Row>

      {state.error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {state.error}
            </Alert>
          </Col>
        </Row>
      )}

      {analytics && (
        <>
          <PerformanceOverview analytics={analytics} />
          
          <StandardsBreakdown 
            analytics={analytics}
            selectedStandards={selectedStandards}
            onSelectionChange={setSelectedStandards}
          />
          
          <Row className="mb-4">
            <Col lg={6}>
              <MasteryDistribution distribution={analytics.masteryDistribution} />
            </Col>
            <Col lg={6}>
              <RecentActivity activities={analytics.recentActivity} />
            </Col>
          </Row>
          
          <PracticeActions 
            onPracticeStruggling={handlePracticeStrugglingAreas}
            onPracticeSelected={handlePracticeSelected}
            onReviewStrong={handleReviewStrongAreas}
            selectedCount={selectedStandards.length}
            strugglingCount={analytics.strugglingStandards?.length || 0}
            strongCount={analytics.strongStandards?.length || 0}
            loading={generatingQuiz}
          />
        </>
      )}
    </Container>
  );
};

export default AnalyticsPage;