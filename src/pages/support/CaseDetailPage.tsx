import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '@cloudscape-design/components/alert';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Textarea from '@cloudscape-design/components/textarea';
import { supportCases } from '@/data/supportMockData';
import type { SupportCaseSeverity, SupportCaseStatus, SupportCaseCommunication } from '@/types';

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [closeModalVisible, setCloseModalVisible] = useState(false);

  const caseData = useMemo(
    () => supportCases.find((c) => c.id === caseId),
    [caseId]
  );

  if (!caseData) {
    return (
      <SpaceBetween size="l">
        <BreadcrumbGroup
          items={[
            { text: 'Support Center', href: '/support' },
            { text: 'Cases', href: '/support/cases' },
            { text: 'Case not found', href: '#' },
          ]}
          onFollow={(e) => {
            e.preventDefault();
            navigate(e.detail.href);
          }}
        />
        <Alert type="error" header="Case not found">
          The support case you are looking for does not exist.
        </Alert>
      </SpaceBetween>
    );
  }

  const getStatusIndicator = (status: SupportCaseStatus) => {
    switch (status) {
      case 'open':
        return <StatusIndicator type="pending">Open</StatusIndicator>;
      case 'pending-customer-action':
        return <StatusIndicator type="warning">Pending your action</StatusIndicator>;
      case 'pending-bhoomi-action':
        return <StatusIndicator type="in-progress">Pending Bhoomi action</StatusIndicator>;
      case 'resolved':
        return <StatusIndicator type="success">Resolved</StatusIndicator>;
      case 'closed':
        return <StatusIndicator type="stopped">Closed</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{status}</StatusIndicator>;
    }
  };

  const getSeverityBadge = (severity: SupportCaseSeverity) => {
    const colors: Record<SupportCaseSeverity, 'red' | 'blue' | 'grey'> = {
      critical: 'red',
      urgent: 'red',
      high: 'red',
      normal: 'blue',
      low: 'grey',
    };
    return <Badge color={colors[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const formatCategory = (category: string) =>
    category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReply = () => {
    // Simulate sending reply
    setReplyModalVisible(false);
    setReplyText('');
  };

  const handleClose = () => {
    // Simulate closing case
    setCloseModalVisible(false);
    navigate('/support/cases');
  };

  const isOpen = !['resolved', 'closed'].includes(caseData.status);

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: 'Support Center', href: '/support' },
          { text: 'Cases', href: '/support/cases' },
          { text: caseData.displayId, href: '#' },
        ]}
        onFollow={(e) => {
          e.preventDefault();
          navigate(e.detail.href);
        }}
      />

      <Header
        variant="h1"
        actions={
          isOpen && (
            <SpaceBetween size="xs" direction="horizontal">
              <Button onClick={() => setReplyModalVisible(true)}>Add reply</Button>
              <Button onClick={() => setCloseModalVisible(true)}>Close case</Button>
            </SpaceBetween>
          )
        }
      >
        {caseData.displayId}
      </Header>

      {caseData.status === 'pending-customer-action' && (
        <Alert type="warning" header="Action required">
          Bhoomi Cloud Support has requested additional information. Please reply to continue with your case.
        </Alert>
      )}

      {/* Case Summary */}
      <Container header={<Header variant="h2">Case details</Header>}>
        <ColumnLayout columns={3} variant="text-grid">
          <KeyValuePairs
            items={[
              { label: 'Case ID', value: caseData.displayId },
              { label: 'Status', value: getStatusIndicator(caseData.status) },
              { label: 'Severity', value: getSeverityBadge(caseData.severity) },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Service', value: caseData.service },
              { label: 'Category', value: formatCategory(caseData.category) },
              { label: 'Submitted by', value: caseData.submittedBy },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Created', value: formatDateTime(caseData.createdAt) },
              { label: 'Last updated', value: formatDateTime(caseData.updatedAt) },
              {
                label: 'Resolved',
                value: caseData.resolvedAt ? formatDateTime(caseData.resolvedAt) : '-',
              },
            ]}
          />
        </ColumnLayout>
      </Container>

      {/* Subject and Description */}
      <Container header={<Header variant="h2">Subject</Header>}>
        <SpaceBetween size="m">
          <Box variant="h3">{caseData.subject}</Box>
          <Box>{caseData.description}</Box>
        </SpaceBetween>
      </Container>

      {/* Correspondence */}
      <Container header={<Header variant="h2">Correspondence ({caseData.communications.length})</Header>}>
        {caseData.communications.length === 0 ? (
          <Box textAlign="center" color="text-body-secondary" padding="l">
            No communications yet
          </Box>
        ) : (
          <SpaceBetween size="l">
            {caseData.communications.map((comm: SupportCaseCommunication) => (
              <Box
                key={comm.id}
                padding="m"
                borderRadius="m"
                backgroundColor={
                  comm.submitterType === 'bhoomi-support'
                    ? 'grey-100'
                    : 'blue-100'
                }
              >
                <SpaceBetween size="xs">
                  <SpaceBetween size="xs" direction="horizontal">
                    <Box fontWeight="bold">
                      {comm.submitterType === 'bhoomi-support'
                        ? `Bhoomi Support (${comm.submittedBy})`
                        : comm.submittedBy}
                    </Box>
                    <Box color="text-body-secondary" fontSize="body-s">
                      {formatDateTime(comm.submittedAt)}
                    </Box>
                  </SpaceBetween>
                  <Box style={{ whiteSpace: 'pre-wrap' }}>{comm.body}</Box>
                  {comm.attachments && comm.attachments.length > 0 && (
                    <Box>
                      <Box variant="awsui-key-label">Attachments</Box>
                      <SpaceBetween size="xs" direction="horizontal">
                        {comm.attachments.map((att) => (
                          <Badge key={att.id}>{att.fileName}</Badge>
                        ))}
                      </SpaceBetween>
                    </Box>
                  )}
                </SpaceBetween>
              </Box>
            ))}
          </SpaceBetween>
        )}
      </Container>

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        onDismiss={() => setReplyModalVisible(false)}
        header="Add reply"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setReplyModalVisible(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleReply}
                disabled={replyText.trim().length < 10}
              >
                Send reply
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Textarea
          value={replyText}
          onChange={({ detail }) => setReplyText(detail.value)}
          placeholder="Enter your reply..."
          rows={6}
        />
      </Modal>

      {/* Close Case Modal */}
      <Modal
        visible={closeModalVisible}
        onDismiss={() => setCloseModalVisible(false)}
        header="Close case"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setCloseModalVisible(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Close case
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box>
            Are you sure you want to close this case? You can reopen it later if needed.
          </Box>
          <Alert type="info">
            If your issue has been resolved, please consider leaving feedback to help us improve our support.
          </Alert>
        </SpaceBetween>
      </Modal>
    </SpaceBetween>
  );
}
