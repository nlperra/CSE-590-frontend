import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const { state, setStudentId, resetQuiz } = useQuiz();

  const handleLogout = () => {
    resetQuiz();
    setStudentId('');
    
    localStorage.removeItem('quiz_studentId');
    localStorage.removeItem('quiz_answers');
    localStorage.removeItem('quiz_currentQuiz');
    localStorage.removeItem('quiz_sessionId');
    
    navigate('/auth');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <LinkContainer to={state.studentId ? "/standards" : "/"}>
          <Navbar.Brand style={{ cursor: 'pointer' }}>
            <strong>Quiz Generator</strong>
            <small className="ms-2 text-light">5th Grade Math</small>
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {state.studentId && (
              <>
                <LinkContainer to="/standards">
                  <Nav.Link>Create Quiz</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/analytics">
                  <Nav.Link>Analytics</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/history">
                  <Nav.Link>History</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/results">
                  <Nav.Link>Results</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
          <Nav className="ms-auto">
            {state.studentId ? (
              <>
                <Navbar.Text className="me-3">
                  Welcome, <strong>{state.studentId}</strong>
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <LinkContainer to="/auth">
                <Button variant="outline-light" size="sm">
                  Login
                </Button>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;