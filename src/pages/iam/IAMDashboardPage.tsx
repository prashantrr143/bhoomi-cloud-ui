import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Alert from '@cloudscape-design/components/alert';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import {
  iamAccountSummary,
  iamPasswordPolicy,
  iamUsers,
  iamRoles,
  iamAccessAnalyzerFindings,
} from '@/data/mockData';
import { formatDateTime } from '@/utils/formatters';

export function IAMDashboardPage() {
  // Calculate security recommendations
  const usersWithoutMFA = iamUsers.filter((u) => !u.mfaEnabled && u.consoleAccess);
  const usersWithOldAccessKeys = iamUsers.filter((u) =>
    u.accessKeys.some((key) => {
      const keyAge = Date.now() - new Date(key.createdAt).getTime();
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      return key.status === 'Active' && keyAge > ninetyDays;
    })
  );
  const unusedRoles = iamRoles.filter((r) => {
    if (!r.lastUsedAt) return true;
    const lastUsedAge = Date.now() - new Date(r.lastUsedAt).getTime();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    return lastUsedAge > ninetyDays;
  });

  const activeFindings = iamAccessAnalyzerFindings.filter((f) => f.status === 'Active');
  const criticalFindings = activeFindings.filter((f) => f.isPublic);

  const securityScore = Math.round(
    ((iamUsers.length - usersWithoutMFA.length) / iamUsers.length) * 40 +
      ((iamUsers.length - usersWithOldAccessKeys.length) / iamUsers.length) * 30 +
      ((iamRoles.length - unusedRoles.length) / iamRoles.length) * 30
  );

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Securely manage access to Bhoomi Cloud services and resources"
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button href="/iam/users/create">Add users</Button>
            <Button href="/iam/roles/create">Create role</Button>
          </SpaceBetween>
        }
      >
        Identity and Access Management (IAM)
      </Header>

      {/* Security Alert */}
      {criticalFindings.length > 0 && (
        <Alert
          type="error"
          header={`${criticalFindings.length} critical finding${criticalFindings.length > 1 ? 's' : ''} detected`}
          action={<Button href="/iam/access-analyzer">Review findings</Button>}
        >
          Access Analyzer has detected resources with public or cross-account access. Review and
          remediate these findings to secure your resources.
        </Alert>
      )}

      {usersWithoutMFA.length > 0 && (
        <Alert
          type="warning"
          header="MFA not enabled for all users"
          action={<Button href="/iam/users">Manage users</Button>}
        >
          {usersWithoutMFA.length} user{usersWithoutMFA.length > 1 ? 's' : ''} with console access{' '}
          {usersWithoutMFA.length > 1 ? 'do' : 'does'} not have MFA enabled. Enable MFA to add an
          extra layer of protection for your account.
        </Alert>
      )}

      {/* IAM Resources Summary */}
      <Container
        header={
          <Header variant="h2" description="Summary of IAM resources in your account">
            IAM Resources
          </Header>
        }
      >
        <ColumnLayout columns={5} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Users</Box>
            <Link href="/iam/users" fontSize="display-l">
              {iamAccountSummary.users}
            </Link>
          </div>
          <div>
            <Box variant="awsui-key-label">Groups</Box>
            <Link href="/iam/groups" fontSize="display-l">
              {iamAccountSummary.groups}
            </Link>
          </div>
          <div>
            <Box variant="awsui-key-label">Roles</Box>
            <Link href="/iam/roles" fontSize="display-l">
              {iamAccountSummary.roles}
            </Link>
          </div>
          <div>
            <Box variant="awsui-key-label">Policies</Box>
            <Link href="/iam/policies" fontSize="display-l">
              {iamAccountSummary.policies}
            </Link>
          </div>
          <div>
            <Box variant="awsui-key-label">Identity Providers</Box>
            <Link href="/iam/identity-providers" fontSize="display-l">
              {iamAccountSummary.identityProviders}
            </Link>
          </div>
        </ColumnLayout>
      </Container>

      <ColumnLayout columns={2}>
        {/* Security Status */}
        <Container
          header={
            <Header variant="h2" description="Overview of your account security posture">
              Security Status
            </Header>
          }
        >
          <SpaceBetween size="l">
            <Box>
              <Box variant="awsui-key-label">Security Score</Box>
              <ProgressBar
                value={securityScore}
                label="Overall security score"
                description="Based on MFA adoption, access key rotation, and role usage"
                status={securityScore >= 80 ? 'success' : securityScore >= 50 ? 'in-progress' : 'error'}
                resultText={`${securityScore}%`}
              />
            </Box>

            <SpaceBetween size="m">
              <Box>
                <SpaceBetween size="xs" direction="horizontal" alignItems="center">
                  {usersWithoutMFA.length === 0 ? (
                    <StatusIndicator type="success">MFA enabled for all users</StatusIndicator>
                  ) : (
                    <StatusIndicator type="warning">
                      {usersWithoutMFA.length} user{usersWithoutMFA.length > 1 ? 's' : ''} without MFA
                    </StatusIndicator>
                  )}
                </SpaceBetween>
              </Box>

              <Box>
                <SpaceBetween size="xs" direction="horizontal" alignItems="center">
                  {usersWithOldAccessKeys.length === 0 ? (
                    <StatusIndicator type="success">All access keys rotated within 90 days</StatusIndicator>
                  ) : (
                    <StatusIndicator type="warning">
                      {usersWithOldAccessKeys.length} user{usersWithOldAccessKeys.length > 1 ? 's' : ''}{' '}
                      with old access keys
                    </StatusIndicator>
                  )}
                </SpaceBetween>
              </Box>

              <Box>
                <SpaceBetween size="xs" direction="horizontal" alignItems="center">
                  {iamAccountSummary.mfaEnabled ? (
                    <StatusIndicator type="success">Root account MFA enabled</StatusIndicator>
                  ) : (
                    <StatusIndicator type="error">Root account MFA not enabled</StatusIndicator>
                  )}
                </SpaceBetween>
              </Box>

              <Box>
                <SpaceBetween size="xs" direction="horizontal" alignItems="center">
                  {activeFindings.length === 0 ? (
                    <StatusIndicator type="success">No active Access Analyzer findings</StatusIndicator>
                  ) : (
                    <StatusIndicator type="warning">
                      {activeFindings.length} active Access Analyzer finding
                      {activeFindings.length > 1 ? 's' : ''}
                    </StatusIndicator>
                  )}
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </SpaceBetween>
        </Container>

        {/* Password Policy */}
        <Container
          header={
            <Header
              variant="h2"
              actions={<Button variant="normal">Edit policy</Button>}
              description="Password requirements for IAM users"
            >
              Password Policy
            </Header>
          }
        >
          <SpaceBetween size="s">
            <Box>
              <StatusIndicator type={iamPasswordPolicy.minimumPasswordLength >= 12 ? 'success' : 'warning'}>
                Minimum length: {iamPasswordPolicy.minimumPasswordLength} characters
              </StatusIndicator>
            </Box>
            <Box>
              <StatusIndicator type={iamPasswordPolicy.requireUppercase ? 'success' : 'stopped'}>
                {iamPasswordPolicy.requireUppercase ? 'Requires' : 'Does not require'} uppercase letters
              </StatusIndicator>
            </Box>
            <Box>
              <StatusIndicator type={iamPasswordPolicy.requireLowercase ? 'success' : 'stopped'}>
                {iamPasswordPolicy.requireLowercase ? 'Requires' : 'Does not require'} lowercase letters
              </StatusIndicator>
            </Box>
            <Box>
              <StatusIndicator type={iamPasswordPolicy.requireNumbers ? 'success' : 'stopped'}>
                {iamPasswordPolicy.requireNumbers ? 'Requires' : 'Does not require'} numbers
              </StatusIndicator>
            </Box>
            <Box>
              <StatusIndicator type={iamPasswordPolicy.requireSymbols ? 'success' : 'stopped'}>
                {iamPasswordPolicy.requireSymbols ? 'Requires' : 'Does not require'} symbols
              </StatusIndicator>
            </Box>
            <Box>
              <StatusIndicator type={iamPasswordPolicy.maxPasswordAge ? 'success' : 'warning'}>
                {iamPasswordPolicy.maxPasswordAge
                  ? `Password expires after ${iamPasswordPolicy.maxPasswordAge} days`
                  : 'Passwords do not expire'}
              </StatusIndicator>
            </Box>
            <Box>
              <StatusIndicator type={iamPasswordPolicy.passwordReusePrevention ? 'success' : 'warning'}>
                {iamPasswordPolicy.passwordReusePrevention
                  ? `Prevents reuse of last ${iamPasswordPolicy.passwordReusePrevention} passwords`
                  : 'Password reuse not prevented'}
              </StatusIndicator>
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      {/* Quick Actions */}
      <Container
        header={
          <Header variant="h2" description="Common IAM tasks and resources">
            Quick Actions
          </Header>
        }
      >
        <ColumnLayout columns={4} variant="text-grid">
          <SpaceBetween size="xs">
            <Box variant="h3">User Management</Box>
            <Link href="/iam/users">View all users</Link>
            <Link href="/iam/users/create">Create new user</Link>
            <Link href="/iam/groups">Manage groups</Link>
          </SpaceBetween>
          <SpaceBetween size="xs">
            <Box variant="h3">Role Management</Box>
            <Link href="/iam/roles">View all roles</Link>
            <Link href="/iam/roles/create">Create new role</Link>
            <Link href="/iam/policies">Manage policies</Link>
          </SpaceBetween>
          <SpaceBetween size="xs">
            <Box variant="h3">Security Tools</Box>
            <Link href="/iam/access-analyzer">Access Analyzer</Link>
            <Link href="/iam/credential-report">Credential report</Link>
            <Link href="/iam/account-settings">Account settings</Link>
          </SpaceBetween>
          <SpaceBetween size="xs">
            <Box variant="h3">Identity Federation</Box>
            <Link href="/iam/identity-providers">Identity providers</Link>
            <Link href="/iam/identity-providers/create">Add provider</Link>
          </SpaceBetween>
        </ColumnLayout>
      </Container>

      {/* Recent Activity */}
      <Container
        header={
          <Header variant="h2" description="Recent IAM activity in your account">
            Recent Activity
          </Header>
        }
      >
        <SpaceBetween size="m">
          {iamUsers
            .filter((u) => u.passwordLastUsed)
            .sort((a, b) => new Date(b.passwordLastUsed!).getTime() - new Date(a.passwordLastUsed!).getTime())
            .slice(0, 5)
            .map((user) => (
              <Box key={user.id} padding="xs">
                <SpaceBetween size="xs" direction="horizontal" alignItems="center">
                  <Link href={`/iam/users/${user.id}`}>{user.userName}</Link>
                  <Box variant="small" color="text-body-secondary">
                    signed in {formatDateTime(user.passwordLastUsed!)}
                  </Box>
                </SpaceBetween>
              </Box>
            ))}
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
}
