import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@cloudscape-design/components/alert';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Cards from '@cloudscape-design/components/cards';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Icon from '@cloudscape-design/components/icon';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import {
  supportCases,
  supportPlans,
  trustedAdvisorChecks,
  serviceHealthEvents,
  knowledgeArticles,
  currentSupportPlan,
} from '@/data/supportMockData';

export function SupportCenterPage() {
  const navigate = useNavigate();

  const openCases = useMemo(
    () => supportCases.filter((c) => !['resolved', 'closed'].includes(c.status)),
    []
  );

  const recentCases = useMemo(
    () => [...supportCases].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    []
  );

  const trustedAdvisorSummary = useMemo(() => {
    const summary = {
      error: 0,
      warning: 0,
      ok: 0,
      total: trustedAdvisorChecks.length,
    };
    trustedAdvisorChecks.forEach((check) => {
      if (check.status === 'error') summary.error++;
      else if (check.status === 'warning') summary.warning++;
      else if (check.status === 'ok') summary.ok++;
    });
    return summary;
  }, []);

  const activeHealthEvents = useMemo(
    () => serviceHealthEvents.filter((e) => e.statusCode === 'open'),
    []
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'urgent':
        return 'red';
      case 'high':
        return 'red';
      case 'normal':
        return 'blue';
      default:
        return 'grey';
    }
  };

  const getStatusIndicator = (status: string) => {
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

  const quickActions = [
    {
      title: 'Create case',
      description: 'Get help from Bhoomi Cloud Support',
      icon: 'add-plus',
      action: () => navigate('/support/cases/create'),
    },
    {
      title: 'View open cases',
      description: `${openCases.length} case${openCases.length !== 1 ? 's' : ''} requiring attention`,
      icon: 'folder-open',
      action: () => navigate('/support/cases'),
    },
    {
      title: 'Trusted Advisor',
      description: 'Review recommendations to optimize your resources',
      icon: 'suggestions',
      action: () => navigate('/support/trusted-advisor'),
    },
    {
      title: 'Service Health',
      description: 'Check the status of Bhoomi Cloud services',
      icon: 'status-positive',
      action: () => navigate('/support/health'),
    },
  ];

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Get help, view cases, and access resources"
        actions={
          <Button variant="primary" onClick={() => navigate('/support/cases/create')}>
            Create case
          </Button>
        }
      >
        Support Center
      </Header>

      {/* Active Service Issues Alert */}
      {activeHealthEvents.length > 0 && (
        <Alert
          type="warning"
          header={`${activeHealthEvents.length} active service issue${activeHealthEvents.length > 1 ? 's' : ''}`}
          action={
            <Button onClick={() => navigate('/support/health')}>View details</Button>
          }
        >
          {activeHealthEvents[0].description}
        </Alert>
      )}

      {/* Support Plan Banner */}
      <Container
        header={
          <Header
            variant="h2"
            actions={
              <Button onClick={() => navigate('/support/plans')}>Change plan</Button>
            }
          >
            Your Support Plan
          </Header>
        }
      >
        <ColumnLayout columns={4} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Current plan</Box>
            <Box variant="p">
              <SpaceBetween size="xs" direction="horizontal">
                <Box fontWeight="bold" fontSize="heading-m">
                  {currentSupportPlan.name}
                </Box>
                <Badge color="blue">Active</Badge>
              </SpaceBetween>
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Response time (Urgent)</Box>
            <Box variant="p">
              {currentSupportPlan.responseTime.urgent || 'N/A'}
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Support channels</Box>
            <Box variant="p">
              {currentSupportPlan.supportChannels.join(', ')}
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Monthly cost</Box>
            <Box variant="p">
              {typeof currentSupportPlan.monthlyPrice === 'number'
                ? `₹${currentSupportPlan.monthlyPrice.toLocaleString()}`
                : currentSupportPlan.monthlyPrice}
            </Box>
          </div>
        </ColumnLayout>
      </Container>

      {/* Quick Actions */}
      <Cards
        cardDefinition={{
          header: (item) => (
            <Link fontSize="heading-m" onFollow={() => item.action()}>
              {item.title}
            </Link>
          ),
          sections: [
            {
              content: (item) => item.description,
            },
          ],
        }}
        items={quickActions}
        cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 2 }, { minWidth: 600, cards: 4 }]}
        header={<Header variant="h2">Quick actions</Header>}
      />

      {/* Two Column Layout */}
      <ColumnLayout columns={2}>
        {/* Recent Cases */}
        <Container
          header={
            <Header
              variant="h2"
              counter={`(${supportCases.length})`}
              actions={
                <Button variant="link" onClick={() => navigate('/support/cases')}>
                  View all cases
                </Button>
              }
            >
              Recent cases
            </Header>
          }
        >
          {recentCases.length === 0 ? (
            <Box textAlign="center" color="text-body-secondary" padding="l">
              No support cases found
            </Box>
          ) : (
            <SpaceBetween size="m">
              {recentCases.map((caseItem) => (
                <Box key={caseItem.id}>
                  <SpaceBetween size="xxs">
                    <SpaceBetween size="xs" direction="horizontal">
                      <Link
                        fontSize="body-m"
                        onFollow={() => navigate(`/support/cases/${caseItem.id}`)}
                      >
                        {caseItem.displayId}
                      </Link>
                      <Badge color={getSeverityColor(caseItem.severity)}>
                        {caseItem.severity.toUpperCase()}
                      </Badge>
                    </SpaceBetween>
                    <Box variant="p">{caseItem.subject}</Box>
                    <SpaceBetween size="xs" direction="horizontal">
                      {getStatusIndicator(caseItem.status)}
                      <Box color="text-body-secondary" fontSize="body-s">
                        Updated {new Date(caseItem.updatedAt).toLocaleDateString()}
                      </Box>
                    </SpaceBetween>
                  </SpaceBetween>
                </Box>
              ))}
            </SpaceBetween>
          )}
        </Container>

        {/* Trusted Advisor Summary */}
        <Container
          header={
            <Header
              variant="h2"
              actions={
                <Button variant="link" onClick={() => navigate('/support/trusted-advisor')}>
                  View all checks
                </Button>
              }
            >
              Trusted Advisor
            </Header>
          }
        >
          <SpaceBetween size="m">
            <ColumnLayout columns={3} variant="text-grid">
              <div>
                <Box variant="awsui-key-label">Action required</Box>
                <Box fontSize="display-l" fontWeight="bold" color="text-status-error">
                  {trustedAdvisorSummary.error}
                </Box>
              </div>
              <div>
                <Box variant="awsui-key-label">Investigation recommended</Box>
                <Box fontSize="display-l" fontWeight="bold" color="text-status-warning">
                  {trustedAdvisorSummary.warning}
                </Box>
              </div>
              <div>
                <Box variant="awsui-key-label">No problems detected</Box>
                <Box fontSize="display-l" fontWeight="bold" color="text-status-success">
                  {trustedAdvisorSummary.ok}
                </Box>
              </div>
            </ColumnLayout>
            <Box variant="p" color="text-body-secondary">
              {trustedAdvisorSummary.total} checks performed across cost optimization, security, fault tolerance, performance, and service limits.
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      {/* Knowledge Base */}
      <Container
        header={
          <Header
            variant="h2"
            description="Browse helpful articles and documentation"
          >
            Knowledge Center
          </Header>
        }
      >
        <ColumnLayout columns={3}>
          {knowledgeArticles.slice(0, 3).map((article) => (
            <Box key={article.id}>
              <SpaceBetween size="xxs">
                <Link fontSize="body-m" href="#">
                  {article.title}
                </Link>
                <Box variant="small" color="text-body-secondary">
                  {article.summary}
                </Box>
                <SpaceBetween size="xs" direction="horizontal">
                  <Badge>{article.category}</Badge>
                  <Box fontSize="body-s" color="text-body-secondary">
                    {article.viewCount.toLocaleString()} views
                  </Box>
                </SpaceBetween>
              </SpaceBetween>
            </Box>
          ))}
        </ColumnLayout>
      </Container>
    </SpaceBetween>
  );
}
