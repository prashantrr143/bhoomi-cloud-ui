import { useState, useCallback, useMemo } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Icon from '@cloudscape-design/components/icon';
import Input from '@cloudscape-design/components/input';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import Modal from '@cloudscape-design/components/modal';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import Toggle from '@cloudscape-design/components/toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { formatDateTime } from '@/utils/formatters';

// Mock data for access keys
const mockAccessKeys = [
  {
    id: 'AKIA1234567890ABCDEF',
    status: 'Active',
    createdAt: '2024-01-15T10:30:00Z',
    lastUsed: '2024-12-28T14:22:00Z',
    lastUsedService: 'S3',
    lastUsedRegion: 'ap-south-1',
  },
  {
    id: 'AKIA0987654321ZYXWVU',
    status: 'Inactive',
    createdAt: '2023-06-20T08:15:00Z',
    lastUsed: '2024-06-15T09:45:00Z',
    lastUsedService: 'EC2',
    lastUsedRegion: 'us-east-1',
  },
];

// Mock data for MFA devices
const mockMFADevices = [
  {
    id: 'arn:bhoomi:iam::123456789012:mfa/admin-virtual',
    name: 'Virtual MFA Device',
    type: 'Virtual',
    enabledAt: '2024-01-10T09:00:00Z',
  },
];

// Mock data for sessions
const mockActiveSessions = [
  {
    id: 'sess-001',
    ipAddress: '192.168.1.100',
    browser: 'Chrome 120.0.0',
    os: 'macOS 14.2',
    location: 'Mumbai, India',
    startedAt: '2024-12-29T08:00:00Z',
    isCurrent: true,
  },
  {
    id: 'sess-002',
    ipAddress: '10.0.0.50',
    browser: 'Firefox 121.0',
    os: 'Windows 11',
    location: 'Bangalore, India',
    startedAt: '2024-12-28T14:30:00Z',
    isCurrent: false,
  },
];

// Timezone options
const timezoneOptions = [
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
  { label: 'America/New_York (EST)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'Europe/London (GMT)', value: 'Europe/London' },
  { label: 'Europe/Paris (CET)', value: 'Europe/Paris' },
  { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Asia/Singapore (SGT)', value: 'Asia/Singapore' },
];

// Language options
const languageOptions = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Hindi', value: 'hi' },
  { label: 'German', value: 'de' },
  { label: 'French', value: 'fr' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Chinese (Simplified)', value: 'zh-CN' },
];

function ProfileTab() {
  const { user } = useAuth();
  const { currentAccount, currentRole } = useTenant();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');

  const handleSave = useCallback(() => {
    // In a real app, this would call an API
    setIsEditing(false);
  }, []);

  const formatRole = (role: string | null): string => {
    if (!role) return 'Unknown';
    return role
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <SpaceBetween size="l">
      {/* User Information */}
      <Container
        header={
          <Header
            variant="h2"
            actions={
              isEditing ? (
                <SpaceBetween size="xs" direction="horizontal">
                  <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleSave}>
                    Save changes
                  </Button>
                </SpaceBetween>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              )
            }
          >
            User information
          </Header>
        }
      >
        {isEditing ? (
          <SpaceBetween size="l">
            <FormField label="Full name">
              <Input value={editName} onChange={({ detail }) => setEditName(detail.value)} />
            </FormField>
            <FormField label="Email address" description="Contact your administrator to change your email">
              <Input value={user?.email || ''} disabled />
            </FormField>
          </SpaceBetween>
        ) : (
          <ColumnLayout columns={2} variant="text-grid">
            <KeyValuePairs
              items={[
                { label: 'Full name', value: user?.name || '-' },
                { label: 'Email address', value: user?.email || '-' },
                { label: 'User ID', value: user?.id || '-' },
              ]}
            />
            <KeyValuePairs
              items={[
                { label: 'Organization ID', value: user?.organizationId || '-' },
                { label: 'Default account', value: user?.defaultAccountId || '-' },
                {
                  label: 'Account status',
                  value: <StatusIndicator type="success">Active</StatusIndicator>,
                },
              ]}
            />
          </ColumnLayout>
        )}
      </Container>

      {/* Current Session */}
      <Container header={<Header variant="h2">Current session</Header>}>
        <ColumnLayout columns={3} variant="text-grid">
          <KeyValuePairs
            items={[
              { label: 'Current account', value: currentAccount?.name || '-' },
              { label: 'Account ID', value: currentAccount?.id || '-' },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Current role', value: formatRole(currentRole) },
              {
                label: 'Role type',
                value: (
                  <Badge color={currentRole === 'ORGANIZATION_ADMIN' ? 'blue' : 'grey'}>
                    {currentRole === 'ORGANIZATION_ADMIN' ? 'Administrator' : 'User'}
                  </Badge>
                ),
              },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Session started', value: formatDateTime(new Date().toISOString()) },
              {
                label: 'Session status',
                value: <StatusIndicator type="success">Active</StatusIndicator>,
              },
            ]}
          />
        </ColumnLayout>
      </Container>

      {/* Account Permissions Summary */}
      <Container header={<Header variant="h2">Permissions summary</Header>}>
        <Alert type="info">
          Your permissions are determined by your role in the current account. Contact your
          administrator if you need additional access.
        </Alert>
        <Box padding={{ top: 'm' }}>
          <ColumnLayout columns={2} variant="text-grid">
            <KeyValuePairs
              items={[
                {
                  label: 'EC2 Access',
                  value: <StatusIndicator type="success">Full access</StatusIndicator>,
                },
                {
                  label: 'S3 Access',
                  value: <StatusIndicator type="success">Full access</StatusIndicator>,
                },
                {
                  label: 'IAM Access',
                  value:
                    currentRole === 'ORGANIZATION_ADMIN' ? (
                      <StatusIndicator type="success">Full access</StatusIndicator>
                    ) : (
                      <StatusIndicator type="warning">Read only</StatusIndicator>
                    ),
                },
              ]}
            />
            <KeyValuePairs
              items={[
                {
                  label: 'Billing Access',
                  value:
                    currentRole === 'ORGANIZATION_ADMIN' ? (
                      <StatusIndicator type="success">Full access</StatusIndicator>
                    ) : (
                      <StatusIndicator type="stopped">No access</StatusIndicator>
                    ),
                },
                {
                  label: 'Organization Access',
                  value:
                    currentRole === 'ORGANIZATION_ADMIN' ? (
                      <StatusIndicator type="success">Full access</StatusIndicator>
                    ) : (
                      <StatusIndicator type="stopped">No access</StatusIndicator>
                    ),
                },
                {
                  label: 'CloudWatch Access',
                  value: <StatusIndicator type="success">Full access</StatusIndicator>,
                },
              ]}
            />
          </ColumnLayout>
        </Box>
      </Container>
    </SpaceBetween>
  );
}

function SecurityTab() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [accessKeys] = useState(mockAccessKeys);
  const [mfaDevices] = useState(mockMFADevices);

  return (
    <SpaceBetween size="l">
      {/* Password */}
      <Container
        header={
          <Header variant="h2" actions={<Button onClick={() => setShowPasswordModal(true)}>Change password</Button>}>
            Password
          </Header>
        }
      >
        <KeyValuePairs
          items={[
            { label: 'Password status', value: <StatusIndicator type="success">Set</StatusIndicator> },
            { label: 'Last changed', value: '30 days ago' },
            {
              label: 'Password policy',
              value: 'Minimum 12 characters, requires uppercase, lowercase, number, and special character',
            },
          ]}
        />
      </Container>

      {/* MFA */}
      <Container
        header={
          <Header
            variant="h2"
            counter={`(${mfaDevices.length})`}
            actions={<Button onClick={() => setShowMFAModal(true)}>Assign MFA device</Button>}
            description="Multi-factor authentication adds an extra layer of security"
          >
            Multi-factor authentication (MFA)
          </Header>
        }
      >
        {mfaDevices.length > 0 ? (
          <Table
            columnDefinitions={[
              { id: 'name', header: 'Device name', cell: (item) => item.name },
              { id: 'type', header: 'Type', cell: (item) => item.type },
              {
                id: 'enabled',
                header: 'Enabled',
                cell: (item) => formatDateTime(item.enabledAt),
              },
              {
                id: 'actions',
                header: 'Actions',
                cell: () => (
                  <SpaceBetween size="xs" direction="horizontal">
                    <Button variant="link">Resync</Button>
                    <Button variant="link">Remove</Button>
                  </SpaceBetween>
                ),
              },
            ]}
            items={mfaDevices}
            variant="embedded"
          />
        ) : (
          <Box textAlign="center" padding="l" color="text-body-secondary">
            <SpaceBetween size="s">
              <Icon name="lock-private" size="big" />
              <Box>No MFA devices assigned. Enable MFA for enhanced security.</Box>
            </SpaceBetween>
          </Box>
        )}
      </Container>

      {/* Access Keys */}
      <Container
        header={
          <Header
            variant="h2"
            counter={`(${accessKeys.length})`}
            actions={<Button onClick={() => setShowCreateKeyModal(true)}>Create access key</Button>}
            description="Access keys are used for programmatic access to Bhoomi Cloud APIs"
          >
            Access keys
          </Header>
        }
      >
        <Alert type="warning" header="Security best practice">
          Rotate your access keys regularly and never share them. Consider using IAM roles instead
          of access keys when possible.
        </Alert>
        <Box padding={{ top: 'm' }}>
          <Table
            columnDefinitions={[
              {
                id: 'id',
                header: 'Access key ID',
                cell: (item) => <Box fontFamily="monospace">{item.id}</Box>,
              },
              {
                id: 'status',
                header: 'Status',
                cell: (item) => (
                  <StatusIndicator type={item.status === 'Active' ? 'success' : 'stopped'}>
                    {item.status}
                  </StatusIndicator>
                ),
              },
              { id: 'created', header: 'Created', cell: (item) => formatDateTime(item.createdAt) },
              {
                id: 'lastUsed',
                header: 'Last used',
                cell: (item) => `${formatDateTime(item.lastUsed)} (${item.lastUsedService})`,
              },
              {
                id: 'actions',
                header: 'Actions',
                cell: (item) => (
                  <SpaceBetween size="xs" direction="horizontal">
                    <Button variant="link">
                      {item.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="link">Delete</Button>
                  </SpaceBetween>
                ),
              },
            ]}
            items={accessKeys}
            variant="embedded"
          />
        </Box>
      </Container>

      {/* Active Sessions */}
      <Container
        header={
          <Header variant="h2" counter={`(${mockActiveSessions.length})`}>
            Active sessions
          </Header>
        }
      >
        <Table
          columnDefinitions={[
            {
              id: 'location',
              header: 'Location',
              cell: (item) => (
                <SpaceBetween size="xs" direction="horizontal">
                  <span>{item.location}</span>
                  {item.isCurrent && <Badge color="green">Current</Badge>}
                </SpaceBetween>
              ),
            },
            { id: 'ip', header: 'IP Address', cell: (item) => item.ipAddress },
            {
              id: 'device',
              header: 'Device',
              cell: (item) => `${item.browser} on ${item.os}`,
            },
            { id: 'started', header: 'Started', cell: (item) => formatDateTime(item.startedAt) },
            {
              id: 'actions',
              header: 'Actions',
              cell: (item) =>
                !item.isCurrent && (
                  <Button variant="link">Revoke</Button>
                ),
            },
          ]}
          items={mockActiveSessions}
          variant="embedded"
        />
      </Container>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        onDismiss={() => setShowPasswordModal(false)}
        header="Change password"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button onClick={() => setShowPasswordModal(false)}>Cancel</Button>
              <Button variant="primary">Change password</Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <FormField label="Current password">
            <Input type="password" value="" onChange={() => {}} />
          </FormField>
          <FormField label="New password">
            <Input type="password" value="" onChange={() => {}} />
          </FormField>
          <FormField label="Confirm new password">
            <Input type="password" value="" onChange={() => {}} />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* MFA Setup Modal */}
      <Modal
        visible={showMFAModal}
        onDismiss={() => setShowMFAModal(false)}
        header="Assign MFA device"
        size="medium"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button onClick={() => setShowMFAModal(false)}>Cancel</Button>
              <Button variant="primary">Assign MFA device</Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <Alert type="info">
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </Alert>
          <Box textAlign="center" padding="l">
            <Box
              padding="xl"
              display="inline-block"
              border="solid 1px"
              borderColor="border-divider-default"
            >
              [QR Code Placeholder]
            </Box>
          </Box>
          <FormField label="Enter two consecutive MFA codes">
            <SpaceBetween size="xs" direction="horizontal">
              <Input placeholder="Code 1" value="" onChange={() => {}} />
              <Input placeholder="Code 2" value="" onChange={() => {}} />
            </SpaceBetween>
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* Create Access Key Modal */}
      <Modal
        visible={showCreateKeyModal}
        onDismiss={() => setShowCreateKeyModal(false)}
        header="Create access key"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button onClick={() => setShowCreateKeyModal(false)}>Cancel</Button>
              <Button variant="primary">Create access key</Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <Alert type="warning">
            This is the only time you can view or download the secret access key. You cannot recover
            it later. Save your access key in a secure location.
          </Alert>
          <FormField label="Description tag (optional)">
            <Input placeholder="e.g., CLI access for development" value="" onChange={() => {}} />
          </FormField>
        </SpaceBetween>
      </Modal>
    </SpaceBetween>
  );
}

function PreferencesTab() {
  const [timezone, setTimezone] = useState({ label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' });
  const [language, setLanguage] = useState({ label: 'English (US)', value: 'en-US' });
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [costAlerts, setCostAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  return (
    <SpaceBetween size="l">
      {/* Regional Settings */}
      <Container header={<Header variant="h2">Regional settings</Header>}>
        <SpaceBetween size="l">
          <FormField label="Timezone" description="All timestamps will be displayed in this timezone">
            <Select
              selectedOption={timezone}
              onChange={({ detail }) =>
                setTimezone(detail.selectedOption as { label: string; value: string })
              }
              options={timezoneOptions}
            />
          </FormField>
          <FormField label="Language" description="Console display language">
            <Select
              selectedOption={language}
              onChange={({ detail }) =>
                setLanguage(detail.selectedOption as { label: string; value: string })
              }
              options={languageOptions}
            />
          </FormField>
        </SpaceBetween>
      </Container>

      {/* Display Settings */}
      <Container header={<Header variant="h2">Display settings</Header>}>
        <SpaceBetween size="l">
          <Toggle checked={darkMode} onChange={({ detail }) => setDarkMode(detail.checked)}>
            Dark mode
          </Toggle>
          <Toggle checked={compactMode} onChange={({ detail }) => setCompactMode(detail.checked)}>
            Compact density
          </Toggle>
        </SpaceBetween>
      </Container>

      {/* Notification Preferences */}
      <Container header={<Header variant="h2">Notification preferences</Header>}>
        <SpaceBetween size="l">
          <FormField label="Notification channels">
            <SpaceBetween size="m">
              <Toggle
                checked={emailNotifications}
                onChange={({ detail }) => setEmailNotifications(detail.checked)}
              >
                Email notifications
              </Toggle>
              <Toggle
                checked={browserNotifications}
                onChange={({ detail }) => setBrowserNotifications(detail.checked)}
              >
                Browser notifications
              </Toggle>
            </SpaceBetween>
          </FormField>
          <FormField label="Alert types">
            <SpaceBetween size="m">
              <Toggle checked={costAlerts} onChange={({ detail }) => setCostAlerts(detail.checked)}>
                Cost and billing alerts
              </Toggle>
              <Toggle
                checked={securityAlerts}
                onChange={({ detail }) => setSecurityAlerts(detail.checked)}
              >
                Security alerts
              </Toggle>
            </SpaceBetween>
          </FormField>
        </SpaceBetween>
      </Container>

      {/* Default Console Settings */}
      <Container header={<Header variant="h2">Console defaults</Header>}>
        <SpaceBetween size="l">
          <FormField label="Default region" description="Region selected by default when launching resources">
            <Select
              selectedOption={{ label: 'Asia Pacific (Mumbai) - ap-south-1', value: 'ap-south-1' }}
              options={[
                { label: 'Asia Pacific (Mumbai) - ap-south-1', value: 'ap-south-1' },
                { label: 'US East (N. Virginia) - us-east-1', value: 'us-east-1' },
                { label: 'US West (Oregon) - us-west-2', value: 'us-west-2' },
                { label: 'Europe (Ireland) - eu-west-1', value: 'eu-west-1' },
              ]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="Default page size" description="Number of items shown per page in tables">
            <Select
              selectedOption={{ label: '10 items', value: '10' }}
              options={[
                { label: '10 items', value: '10' },
                { label: '20 items', value: '20' },
                { label: '50 items', value: '50' },
                { label: '100 items', value: '100' },
              ]}
              onChange={() => {}}
            />
          </FormField>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
}

export function ProfilePage() {
  const { user } = useAuth();

  const tabs = useMemo(
    () => [
      {
        id: 'profile',
        label: 'Profile',
        content: <ProfileTab />,
      },
      {
        id: 'security',
        label: 'Security credentials',
        content: <SecurityTab />,
      },
      {
        id: 'preferences',
        label: 'Preferences',
        content: <PreferencesTab />,
      },
    ],
    []
  );

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Manage your account settings, security credentials, and preferences"
        >
          My Profile
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* User Summary Banner */}
        <Container>
          <ColumnLayout columns={4} variant="text-grid">
            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Signed in as
              </Box>
              <Box fontSize="heading-m" fontWeight="bold">
                {user?.name}
              </Box>
            </SpaceBetween>
            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                Email
              </Box>
              <Box>{user?.email}</Box>
            </SpaceBetween>
            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                User ID
              </Box>
              <Box fontFamily="monospace">{user?.id}</Box>
            </SpaceBetween>
            <SpaceBetween size="xxs">
              <Box color="text-body-secondary" fontSize="body-s">
                MFA Status
              </Box>
              <StatusIndicator type="success">Enabled</StatusIndicator>
            </SpaceBetween>
          </ColumnLayout>
        </Container>

        {/* Tabs */}
        <Tabs tabs={tabs} />
      </SpaceBetween>
    </ContentLayout>
  );
}
