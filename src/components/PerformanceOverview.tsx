import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { StudentAnalytics } from '../services/apiService';

interface PerformanceOverviewProps {
  analytics: StudentAnalytics;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ analytics }) => {
  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const overviewCards = [
    {
      title: 'Quizzes Completed',
      value: analytics.totalQuizzesTaken,
      icon: '📝',
      color: 'primary',
      subtitle: 'Total assessments taken'
    },
    {
      title: 'Overall Accuracy',
      value: `${analytics.overallAccuracy.toFixed(1)}%`,
      icon: '🎯',
      color: analytics.overallAccuracy >= 80 ? 'success' : analytics.overallAccuracy >= 60 ? 'warning' : 'danger',
      subtitle: `${analytics.totalQuestionsAnswered} questions answered`
    },
    {
      title: 'Average Quiz Time',
      value: formatTime(analytics.averageQuizTime),
      icon: '⏱️',
      color: 'info',
      subtitle: 'Time per quiz session'
    },
    {
      title: 'Standards Practiced',
      value: (analytics.strongStandards.length + analytics.strugglingStandards.length),
      icon: '📚',
      color: 'secondary',
      subtitle: 'Unique standards attempted'
    }
  ];

  return (
    <Row className="mb-4">
      <Col>
        <h2 className="mb-3">📈 Performance Overview</h2>
        <Row>
          {overviewCards.map((card, index) => (
            <Col md={6} lg={3} key={index} className="mb-3">
              <Card className={`h-100 border-${card.color}`}>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <span className="fs-2 me-2">{card.icon}</span>
                    <div className="flex-grow-1">
                      <Card.Title className={`text-${card.color} mb-0`}>
                        {card.title}
                      </Card.Title>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className={`display-6 fw-bold text-${card.color} mb-1`}>
                      {card.value}
                    </div>
                    <small className="text-muted">{card.subtitle}</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
};

export default PerformanceOverview;