import React from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';

interface PracticeActionsProps {
  onPracticeStruggling: () => void;
  onPracticeSelected: () => void;
  onReviewStrong: () => void;
  selectedCount: number;
  strugglingCount: number;
  strongCount: number;
  loading: boolean;
}

const PracticeActions: React.FC<PracticeActionsProps> = ({
  onPracticeStruggling,
  onPracticeSelected,
  onReviewStrong,
  selectedCount,
  strugglingCount,
  strongCount,
  loading
}) => {
  return (
    <Row className="mb-4">
      <Col>
        <h2 className="mb-3">🎯 Targeted Practice</h2>
        <Row>
          <Col md={4} className="mb-3">
            <Card className="h-100 border-danger">
              <Card.Header className="bg-danger text-white">
                <h6 className="mb-0">🔴 Focus on Weak Areas</h6>
              </Card.Header>
              <Card.Body className="d-flex flex-column">
                <p className="text-muted mb-3">
                  Practice standards where you're struggling to improve your performance.
                </p>
                <div className="mt-auto">
                  <Button
                    variant="danger"
                    onClick={onPracticeStruggling}
                    disabled={strugglingCount === 0 || loading}
                    className="w-100"
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        Practice Struggling Areas
                        {strugglingCount > 0 && (
                          <span className="badge bg-light text-danger ms-2">
                            {strugglingCount}
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                  {strugglingCount === 0 && (
                    <small className="text-muted d-block mt-2">
                      No struggling areas identified yet
                    </small>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="h-100 border-primary">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">🎲 Practice Selected</h6>
              </Card.Header>
              <Card.Body className="d-flex flex-column">
                <p className="text-muted mb-3">
                  Create a custom quiz with standards you've selected from the tables above.
                </p>
                <div className="mt-auto">
                  <Button
                    variant="primary"
                    onClick={onPracticeSelected}
                    disabled={selectedCount === 0 || loading}
                    className="w-100"
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        Practice Selected Standards
                        {selectedCount > 0 && (
                          <span className="badge bg-light text-primary ms-2">
                            {selectedCount}
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                  {selectedCount === 0 && (
                    <small className="text-muted d-block mt-2">
                      Select standards from the tables above
                    </small>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="h-100 border-success">
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0">🟢 Review Strong Areas</h6>
              </Card.Header>
              <Card.Body className="d-flex flex-column">
                <p className="text-muted mb-3">
                  Reinforce your strengths with review questions from areas you've mastered.
                </p>
                <div className="mt-auto">
                  <Button
                    variant="success"
                    onClick={onReviewStrong}
                    disabled={strongCount === 0 || loading}
                    className="w-100"
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        Review Strong Areas
                        {strongCount > 0 && (
                          <span className="badge bg-light text-success ms-2">
                            {strongCount}
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                  {strongCount === 0 && (
                    <small className="text-muted d-block mt-2">
                      No strong areas identified yet
                    </small>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="alert alert-info mt-3">
          <div className="d-flex align-items-start">
            <span className="me-2">💡</span>
            <div>
              <strong>Practice Tips:</strong>
              <ul className="mb-0 mt-2">
                <li>Focus on struggling areas to see the biggest improvement</li>
                <li>Review strong areas periodically to maintain your skills</li>
                <li>Mix different standards to challenge your understanding</li>
                <li>Each targeted quiz contains 10 questions tailored to your needs</li>
              </ul>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default PracticeActions;