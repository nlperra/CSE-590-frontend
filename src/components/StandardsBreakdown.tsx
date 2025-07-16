import React from 'react';
import { Row, Col, Card, Table, Form, Badge } from 'react-bootstrap';
import { StudentAnalytics, StandardPerformance } from '../services/apiService';

interface StandardsBreakdownProps {
  analytics: StudentAnalytics;
  selectedStandards: string[];
  onSelectionChange: (selected: string[]) => void;
}

const StandardsBreakdown: React.FC<StandardsBreakdownProps> = ({ 
  analytics, 
  selectedStandards, 
  onSelectionChange 
}) => {
  const getMasteryColor = (level: string): string => {
    switch (level) {
      case 'mastered': return 'success';
      case 'proficient': return 'info';
      case 'developing': return 'warning';
      case 'struggling': return 'danger';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    return `${seconds}s`;
  };

  const handleStandardSelection = (standardCode: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedStandards, standardCode]);
    } else {
      onSelectionChange(selectedStandards.filter(code => code !== standardCode));
    }
  };

  const renderStandardsTable = (standards: StandardPerformance[], title: string, variant: string) => {
    if (!standards || standards.length === 0) {
      return (
        <Card className={`mb-4 border-${variant}`}>
          <Card.Header className={`bg-${variant} text-white`}>
            <h5 className="mb-0">{title}</h5>
          </Card.Header>
          <Card.Body className="text-center py-4">
            <p className="text-muted mb-0">
              {title.includes('Strong') 
                ? 'Complete more quizzes to identify your strong areas!' 
                : 'No struggling areas identified yet. Keep practicing!'}
            </p>
          </Card.Body>
        </Card>
      );
    }

    return (
      <Card className={`mb-4 border-${variant}`}>
        <Card.Header className={`bg-${variant} text-white`}>
          <h5 className="mb-0">{title} ({standards.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '40px' }}>
                  <Form.Check 
                    type="checkbox" 
                    id={`select-all-${variant}`}
                    onChange={(e) => {
                      const allCodes = standards.map(s => s.standardCode);
                      if (e.target.checked) {
                        const newSelected = Array.from(new Set([...selectedStandards, ...allCodes]));
                        onSelectionChange(newSelected);
                      } else {
                        onSelectionChange(selectedStandards.filter(code => !allCodes.includes(code)));
                      }
                    }}
                    checked={standards.every(s => selectedStandards.includes(s.standardCode))}
                  />
                </th>
                <th>Standard</th>
                <th>Performance</th>
                <th>Mastery</th>
                <th>Trend</th>
                <th>Last Attempt</th>
              </tr>
            </thead>
            <tbody>
              {standards.map((standard, index) => (
                <tr key={standard.standardCode} className={index % 2 === 0 ? 'table-light' : ''}>
                  <td>
                    <Form.Check 
                      type="checkbox"
                      id={`standard-${standard.standardCode}`}
                      checked={selectedStandards.includes(standard.standardCode)}
                      onChange={(e) => handleStandardSelection(standard.standardCode, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div>
                      <strong>{standard.standardCode}</strong>
                      <br />
                      <small className="text-muted">{standard.standardTitle}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong className={`text-${getMasteryColor(standard.masteryLevel)}`}>
                        {standard.accuracy.toFixed(1)}%
                      </strong>
                      <br />
                      <small className="text-muted">
                        {standard.correctAnswers}/{standard.totalQuestions} correct
                      </small>
                      <br />
                      <small className="text-muted">
                        Avg: {formatTime(standard.averageTime)}
                      </small>
                    </div>
                  </td>
                  <td>
                    <Badge bg={getMasteryColor(standard.masteryLevel)} className="text-capitalize">
                      {standard.masteryLevel}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <span title={`Trend: ${standard.trend}`}>
                      {getTrendIcon(standard.trend)}
                    </span>
                  </td>
                  <td>
                    <small className="text-muted">
                      {formatDate(standard.lastAttempted)}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Row className="mb-4">
      <Col>
        <h2 className="mb-3">📊 Standards Performance</h2>
        
        {selectedStandards.length > 0 && (
          <div className="alert alert-info mb-3">
            <strong>{selectedStandards.length}</strong> standard{selectedStandards.length !== 1 ? 's' : ''} selected for practice
            <button 
              className="btn btn-sm btn-outline-info ms-2"
              onClick={() => onSelectionChange([])}
            >
              Clear Selection
            </button>
          </div>
        )}

        <Row>
          <Col lg={6}>
            {renderStandardsTable(analytics.strugglingStandards, '🔴 Struggling Standards', 'danger')}
          </Col>
          <Col lg={6}>
            {renderStandardsTable(analytics.strongStandards, '🟢 Strong Standards', 'success')}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default StandardsBreakdown;