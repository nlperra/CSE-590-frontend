import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Alert, Spinner, Nav } from 'react-bootstrap';
import { useQuiz } from '../contexts/QuizContext';
import { apiService } from '../services/apiService';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'register';

interface FormData {
  studentId: string;
  name: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({
    studentId: '',
    name: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setStudentId: setQuizStudentId } = useQuiz();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.studentId.trim()) {
      setError('Student ID is required');
      return false;
    }

    if (authMode === 'register') {
      if (!formData.name.trim()) {
        setError('Name is required for registration');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async (): Promise<void> => {
    
    try {
      const loginResponse = await apiService.loginStudent({
        studentId: formData.studentId.trim()
      });

      if (loginResponse.exists) {
        setQuizStudentId(formData.studentId.trim());
        onLoginSuccess();
      } else {
        setError('Student ID not found. Please register first or check your Student ID.');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Student ID not found. Please register first or check your Student ID.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleRegister = async (): Promise<void> => {
    
    try {
      const exists = await apiService.checkStudentExists(formData.studentId.trim());
      
      if (exists) {
        setError('Student ID already exists. Please use a different ID or try logging in.');
        return;
      }

      await apiService.registerStudent({
        studentId: formData.studentId.trim(),
        name: formData.name.trim()
      });

      setQuizStudentId(formData.studentId.trim());
      onLoginSuccess();
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError('Student ID already exists. Please choose a different ID.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'login') {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode: AuthMode): void => {
    setAuthMode(mode);
    setError('');
    if (mode === 'login') {
      setFormData(prev => ({
        ...prev,
        name: ''
      }));
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={6} lg={4}>
        <Card>
          <Card.Header>
            <Nav variant="tabs" activeKey={authMode}>
              <Nav.Item>
                <Nav.Link 
                  eventKey="login" 
                  onClick={() => switchMode('login')}
                  disabled={isLoading}
                >
                  Login
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="register" 
                  onClick={() => switchMode('register')}
                  disabled={isLoading}
                >
                  Register
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <div className="text-center mb-3">
              <h5>{authMode === 'login' ? 'Student Login' : 'Student Registration'}</h5>
              <p className="text-muted">
                {authMode === 'login' 
                  ? 'Enter your Student ID to continue' 
                  : 'Create a new student account'
                }
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Student ID *</Form.Label>
                <Form.Control
                  type="text"
                  name="studentId"
                  placeholder="Enter your student ID"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  autoFocus
                  required
                  disabled={isLoading}
                />
                <Form.Text className="text-muted">
                  Your unique student identifier
                </Form.Text>
              </Form.Group>

              {authMode === 'register' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </Form.Group>

                </>
              )}

              <div className="d-grid gap-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      {authMode === 'login' ? 'Logging in...' : 'Creating account...'}
                    </>
                  ) : (
                    authMode === 'login' ? 'Login' : 'Create Account'
                  )}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-3">
              <small className="text-muted">
                {authMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0" 
                      onClick={() => switchMode('register')}
                      disabled={isLoading}
                    >
                      Register here
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0" 
                      onClick={() => switchMode('login')}
                      disabled={isLoading}
                    >
                      Login here
                    </Button>
                  </>
                )}
              </small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AuthPage;