import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';

interface MasteryDistributionData {
  struggling: number;
  developing: number;
  proficient: number;
  mastered: number;
}

interface MasteryDistributionProps {
  distribution: MasteryDistributionData;
}

const MasteryDistribution: React.FC<MasteryDistributionProps> = ({ distribution }) => {
  const total = distribution.struggling + distribution.developing + distribution.proficient + distribution.mastered;
  
  if (total === 0) {
    return (
      <Card className="h-100">
        <Card.Header>
          <h5 className="mb-0">📈 Mastery Distribution</h5>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center">
          <div className="text-center text-muted">
            <p className="mb-0">Complete quizzes to see your mastery distribution!</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const getPercentage = (value: number): number => {
    return (value / total) * 100;
  };

  const masteryLevels = [
    {
      label: 'Struggling',
      value: distribution.struggling,
      percentage: getPercentage(distribution.struggling),
      variant: 'danger',
      icon: '🔴'
    },
    {
      label: 'Developing',
      value: distribution.developing,
      percentage: getPercentage(distribution.developing),
      variant: 'warning',
      icon: '🟡'
    },
    {
      label: 'Proficient',
      value: distribution.proficient,
      percentage: getPercentage(distribution.proficient),
      variant: 'info',
      icon: '🔵'
    },
    {
      label: 'Mastered',
      value: distribution.mastered,
      percentage: getPercentage(distribution.mastered),
      variant: 'success',
      icon: '🟢'
    }
  ];

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">📈 Mastery Distribution</h5>
        <small className="text-muted">{total} standards practiced</small>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <ProgressBar className="mb-2" style={{ height: '20px' }}>
            {masteryLevels.map((level, index) => (
              level.percentage > 0 && (
                <ProgressBar
                  key={index}
                  variant={level.variant}
                  now={level.percentage}
                  label={level.percentage > 10 ? `${level.percentage.toFixed(0)}%` : ''}
                />
              )
            ))}
          </ProgressBar>
        </div>

        <div className="d-flex flex-column gap-3">
          {masteryLevels.map((level, index) => (
            <div key={index} className="d-flex align-items-center">
              <span className="me-2">{level.icon}</span>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-medium">{level.label}</span>
                  <span className={`text-${level.variant} fw-bold`}>
                    {level.value} ({level.percentage.toFixed(1)}%)
                  </span>
                </div>
                <ProgressBar 
                  variant={level.variant} 
                  now={level.percentage} 
                  style={{ height: '6px' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-top">
          <small className="text-muted">
            {distribution.mastered > 0 && (
              <div className="mb-1">
                🎉 {distribution.mastered} standard{distribution.mastered !== 1 ? 's' : ''} mastered!
              </div>
            )}
            {distribution.struggling > 0 && (
              <div className="mb-1">
                🎯 Focus on {distribution.struggling} struggling area{distribution.struggling !== 1 ? 's' : ''}
              </div>
            )}
            {distribution.developing > 0 && (
              <div className="mb-1">
                📚 {distribution.developing} standard{distribution.developing !== 1 ? 's' : ''} developing well
              </div>
            )}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MasteryDistribution;