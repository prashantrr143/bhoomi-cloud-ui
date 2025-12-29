import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Cards from '@cloudscape-design/components/cards';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Tabs from '@cloudscape-design/components/tabs';
import { AlarmStateIndicator, ServiceHealthIndicator } from '@/components/indicators';
import {
  cloudWatchAlarms,
  cloudWatchDashboards,
  logGroups,
  serviceHealth,
  healthEvents,
} from '@/data/mockData';
import { formatDateTime, formatBytes } from '@/utils/formatters';

export function MonitoringDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const alarmsByState = {
    ALARM: cloudWatchAlarms.filter((a) => a.state === 'ALARM'),
    OK: cloudWatchAlarms.filter((a) => a.state === 'OK'),
    INSUFFICIENT_DATA: cloudWatchAlarms.filter((a) => a.state === 'INSUFFICIENT_DATA'),
  };

  const openHealthEvents = healthEvents.filter((e) => e.status === 'open' || e.status === 'upcoming');

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Monitor your cloud resources, view metrics, manage alarms, and analyze logs"
      >
        CloudWatch Monitoring
      </Header>

      {/* Quick Stats */}
      <ColumnLayout columns={4} variant="text-grid">
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Total Alarms</Box>
            <Box variant="h1">{cloudWatchAlarms.length}</Box>
            <SpaceBetween size="xs" direction="horizontal">
              <StatusIndicator type="error">{alarmsByState.ALARM.length} in alarm</StatusIndicator>
            </SpaceBetween>
          </SpaceBetween>
        </Container>
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Dashboards</Box>
            <Box variant="h1">{cloudWatchDashboards.length}</Box>
            <Link href="/monitoring/dashboards">View all dashboards</Link>
          </SpaceBetween>
        </Container>
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Log Groups</Box>
            <Box variant="h1">{logGroups.length}</Box>
            <Box variant="small" color="text-body-secondary">
              {formatBytes(logGroups.reduce((acc, lg) => acc + lg.storedBytes, 0))} stored
            </Box>
          </SpaceBetween>
        </Container>
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Health Events</Box>
            <Box variant="h1">{openHealthEvents.length}</Box>
            <StatusIndicator type={openHealthEvents.length > 0 ? 'warning' : 'success'}>
              {openHealthEvents.length > 0 ? 'Active events' : 'All systems operational'}
            </StatusIndicator>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      <Tabs
        activeTabId={activeTab}
        onChange={({ detail }) => setActiveTab(detail.activeTabId)}
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <SpaceBetween size="l">
                {/* Alarms in ALARM State */}
                <Container
                  header={
                    <Header
                      variant="h2"
                      counter={`(${alarmsByState.ALARM.length})`}
                      actions={<Link href="/monitoring/alarms">View all alarms</Link>}
                    >
                      Alarms in ALARM State
                    </Header>
                  }
                >
                  {alarmsByState.ALARM.length === 0 ? (
                    <Box textAlign="center" padding="l" color="text-status-success">
                      <StatusIndicator type="success">No alarms in ALARM state</StatusIndicator>
                    </Box>
                  ) : (
                    <Cards
                      cardDefinition={{
                        header: (item) => (
                          <Link href={`/monitoring/alarms/${item.id}`} fontSize="heading-m">
                            {item.name}
                          </Link>
                        ),
                        sections: [
                          {
                            id: 'metric',
                            header: 'Metric',
                            content: (item) => `${item.namespace} / ${item.metricName}`,
                          },
                          {
                            id: 'state',
                            header: 'State',
                            content: (item) => <AlarmStateIndicator state={item.state} />,
                          },
                          {
                            id: 'reason',
                            header: 'State Reason',
                            content: (item) => (
                              <Box variant="small" color="text-body-secondary">
                                {item.stateReason}
                              </Box>
                            ),
                          },
                          {
                            id: 'updated',
                            header: 'Last Updated',
                            content: (item) => formatDateTime(item.stateUpdatedAt),
                          },
                        ],
                      }}
                      items={alarmsByState.ALARM}
                      cardsPerRow={[{ cards: 1 }, { minWidth: 600, cards: 2 }]}
                    />
                  )}
                </Container>

                {/* Recent Dashboards */}
                <Container
                  header={
                    <Header
                      variant="h2"
                      counter={`(${cloudWatchDashboards.length})`}
                      actions={<Link href="/monitoring/dashboards">View all</Link>}
                    >
                      Recent Dashboards
                    </Header>
                  }
                >
                  <ColumnLayout columns={3} variant="text-grid">
                    {cloudWatchDashboards.slice(0, 3).map((dashboard) => (
                      <Box key={dashboard.id}>
                        <SpaceBetween size="xs">
                          <Link href={`/monitoring/dashboards/${dashboard.id}`} fontSize="heading-s">
                            {dashboard.name}
                          </Link>
                          <Box variant="small" color="text-body-secondary">
                            {dashboard.widgets.length} widgets
                          </Box>
                          <Box variant="small" color="text-body-secondary">
                            Last updated: {formatDateTime(dashboard.updatedAt)}
                          </Box>
                        </SpaceBetween>
                      </Box>
                    ))}
                  </ColumnLayout>
                </Container>
              </SpaceBetween>
            ),
          },
          {
            id: 'service-health',
            label: 'Service Health',
            content: (
              <SpaceBetween size="l">
                {/* Open Health Events */}
                {openHealthEvents.length > 0 && (
                  <Container
                    header={
                      <Header variant="h2" counter={`(${openHealthEvents.length})`}>
                        Active Events
                      </Header>
                    }
                  >
                    <SpaceBetween size="m">
                      {openHealthEvents.map((event) => (
                        <Box key={event.id} padding="s" backgroundColor={event.eventType === 'issue' ? 'background-status-error' : 'background-status-info'}>
                          <SpaceBetween size="xs">
                            <Box fontWeight="bold">{event.service} - {event.region}</Box>
                            <Box>{event.description}</Box>
                            <Box variant="small" color="text-body-secondary">
                              Started: {formatDateTime(event.startTime)}
                              {event.endTime && ` | Ends: ${formatDateTime(event.endTime)}`}
                            </Box>
                          </SpaceBetween>
                        </Box>
                      ))}
                    </SpaceBetween>
                  </Container>
                )}

                {/* Service Status */}
                <Container
                  header={
                    <Header variant="h2">Service Status</Header>
                  }
                >
                  <ColumnLayout columns={2}>
                    {serviceHealth.map((service) => (
                      <Box key={`${service.service}-${service.region}`} padding="s">
                        <SpaceBetween size="xs" direction="horizontal" alignItems="center">
                          <ServiceHealthIndicator status={service.status} />
                          <Box fontWeight="bold">{service.service}</Box>
                          <Box variant="small" color="text-body-secondary">({service.region})</Box>
                        </SpaceBetween>
                        {service.message && (
                          <Box variant="small" color="text-body-secondary" padding={{ top: 'xs' }}>
                            {service.message}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </ColumnLayout>
                </Container>
              </SpaceBetween>
            ),
          },
          {
            id: 'quick-links',
            label: 'Quick Links',
            content: (
              <ColumnLayout columns={3} variant="text-grid">
                <Container header={<Header variant="h3">Metrics</Header>}>
                  <SpaceBetween size="xs">
                    <Link href="/monitoring/metrics">Metrics Explorer</Link>
                    <Link href="/monitoring/alarms">All Alarms</Link>
                    <Link href="/monitoring/dashboards">Dashboards</Link>
                  </SpaceBetween>
                </Container>
                <Container header={<Header variant="h3">Logs</Header>}>
                  <SpaceBetween size="xs">
                    <Link href="/monitoring/logs">Log Groups</Link>
                    <Link href="/monitoring/logs/insights">Logs Insights</Link>
                  </SpaceBetween>
                </Container>
                <Container header={<Header variant="h3">Events</Header>}>
                  <SpaceBetween size="xs">
                    <Link href="/monitoring/events">EventBridge Rules</Link>
                    <Link href="/monitoring/synthetics">Synthetics Canaries</Link>
                  </SpaceBetween>
                </Container>
              </ColumnLayout>
            ),
          },
        ]}
      />
    </SpaceBetween>
  );
}
