import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Alert from '@cloudscape-design/components/alert';
import Checkbox from '@cloudscape-design/components/checkbox';
import Tabs from '@cloudscape-design/components/tabs';
import Box from '@cloudscape-design/components/box';
import { useAuth } from '@/contexts/AuthContext';
import { BhoomiLogo } from '@/components/common';
import './LoginPage.css';

type SignInType = 'root' | 'iam';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [signInType, setSignInType] = useState<SignInType>('root');
  const [email, setEmail] = useState('');
  const [accountId, setAccountId] = useState('');
  const [iamUsername, setIamUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signInType === 'root') {
      if (!email) {
        setError('Email address is required');
        return;
      }
    } else {
      if (!accountId) {
        setError('Account ID is required');
        return;
      }
      if (!iamUsername) {
        setError('IAM user name is required');
        return;
      }
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    const loginEmail = signInType === 'root' ? email : `${iamUsername}@${accountId}`;
    const success = await login(loginEmail, password);
    if (success) {
      navigate('/console');
    } else {
      setError('Your authentication information is incorrect. Please try again.');
    }
  };

  const renderRootUserForm = () => (
    <SpaceBetween size="m">
      <FormField label="Root user email address">
        <Input
          type="email"
          value={email}
          onChange={({ detail }) => setEmail(detail.value)}
          placeholder="email@example.com"
          autoFocus
        />
      </FormField>
    </SpaceBetween>
  );

  const renderIAMUserForm = () => (
    <SpaceBetween size="m">
      <FormField
        label="Account ID (12 digits) or account alias"
        description="You can find your Account ID on the account settings page"
      >
        <Input
          value={accountId}
          onChange={({ detail }) => setAccountId(detail.value)}
          placeholder="123456789012"
          autoFocus
        />
      </FormField>

      <FormField label="IAM user name">
        <Input
          value={iamUsername}
          onChange={({ detail }) => setIamUsername(detail.value)}
          placeholder="Enter your IAM user name"
        />
      </FormField>
    </SpaceBetween>
  );

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="login-header-content">
          <div className="logo">
            <BhoomiLogo size={32} />
            <span className="logo-text">bhoomi</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-card">
          <Box padding={{ horizontal: 'l', vertical: 'l' }}>
            <SpaceBetween size="l">
              <Box variant="h1" fontSize="heading-xl" fontWeight="normal">
                Sign in
              </Box>

              <Tabs
                activeTabId={signInType}
                onChange={({ detail }) => {
                  setSignInType(detail.activeTabId as SignInType);
                  setError('');
                }}
                tabs={[
                  {
                    id: 'root',
                    label: 'Root user',
                    content: (
                      <Box padding={{ top: 'm' }}>
                        {renderRootUserForm()}
                      </Box>
                    ),
                  },
                  {
                    id: 'iam',
                    label: 'IAM user',
                    content: (
                      <Box padding={{ top: 'm' }}>
                        {renderIAMUserForm()}
                      </Box>
                    ),
                  },
                ]}
              />

              <form onSubmit={handleSubmit}>
                <SpaceBetween size="l">
                  {error && (
                    <Alert type="error" dismissible onDismiss={() => setError('')}>
                      {error}
                    </Alert>
                  )}

                  <FormField label="Password">
                    <Input
                      type="password"
                      value={password}
                      onChange={({ detail }) => setPassword(detail.value)}
                      placeholder="Enter your password"
                    />
                  </FormField>

                  <Checkbox
                    checked={rememberMe}
                    onChange={({ detail }) => setRememberMe(detail.checked)}
                  >
                    Remember this account
                  </Checkbox>

                  <Button
                    variant="primary"
                    fullWidth
                    formAction="submit"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Sign in
                  </Button>
                </SpaceBetween>
              </form>

              <Box textAlign="center">
                <SpaceBetween size="xs">
                  <Box color="text-body-secondary" fontSize="body-s">
                    New to Bhoomi Cloud?
                  </Box>
                  <Button fullWidth>
                    Create a new Bhoomi Cloud account
                  </Button>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Box>
        </div>

        {/* Help links */}
        <Box textAlign="center" margin={{ top: 'l' }}>
          <SpaceBetween size="xs" direction="horizontal" alignItems="center">
            <Link href="#" fontSize="body-s">Forgot password?</Link>
            <Box color="text-body-secondary">|</Box>
            <Link href="#" fontSize="body-s">Other sign-in issues</Link>
          </SpaceBetween>
        </Box>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <Box textAlign="center">
          <SpaceBetween size="m">
            <SpaceBetween size="l" direction="horizontal" alignItems="center">
              <Link href="#" variant="secondary" fontSize="body-s" color="inverted">Feedback</Link>
              <Link href="#" variant="secondary" fontSize="body-s" color="inverted">Privacy</Link>
              <Link href="#" variant="secondary" fontSize="body-s" color="inverted">Terms</Link>
              <Link href="#" variant="secondary" fontSize="body-s" color="inverted">Cookie preferences</Link>
            </SpaceBetween>
            <Box color="text-body-secondary" fontSize="body-s">
              © 2024, Bhoomi Cloud, Inc. or its affiliates.
            </Box>
          </SpaceBetween>
        </Box>
      </footer>
    </div>
  );
}
