import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

interface RecentActivityData {
  date: string;
  standardCode: string;
  accuracy: number;
  questionsAnswered: number;
}

interface RecentActivityProps {
  activities: RecentActivityData[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getAccuracyVariant = (accuracy: number): string => {
    if (accuracy >= 80) return 'success';
    if (accuracy >= 60) return 'warning';
    return 'danger';
  };

  if (!activities || activities.length === 0) {
    return (
      <Card className="h-100">
        <Card.Header>
          <h5 className="mb-0">📅 Recent Activity</h5>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center">
          <div className="text-center text-muted">
            <p className="mb-0">No recent activity to display.</p>
            <small>Complete some quizzes to see your activity history!</small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">📅 Recent Activity</h5>
        <small className="text-muted">Latest quiz attempts</small>
      </Card.Header>
      <Card.Body className="p-0">
        <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {activities.slice(0, 10).map((activity, index) => (
            <ListGroup.Item 
              key={index} 
              className="d-flex justify-content-between align-items-start py-3"
            >
              <div className="me-auto">
                <div className="fw-bold">{activity.standardCode}</div>
                <small className="text-muted">
                  {formatDate(activity.date)}
                </small>
              </div>
              <div className="text-end">
                <Badge 
                  bg={getAccuracyVariant(activity.accuracy)} 
                  className="mb-1"
                >
                  {activity.accuracy.toFixed(1)}%
                </Badge>
                <br />
                <small className="text-muted">
                  {activity.questionsAnswered} question{activity.questionsAnswered !== 1 ? 's' : ''}
                </small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        
        {activities.length > 10 && (
          <div className="p-3 text-center border-top">
            <small className="text-muted">
              Showing latest 10 activities ({activities.length} total)
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecentActivity;