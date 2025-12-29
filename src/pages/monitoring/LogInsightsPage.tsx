import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Multiselect from '@cloudscape-design/components/multiselect';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import Textarea from '@cloudscape-design/components/textarea';
import { logGroups, logInsightsQueries } from '@/data/mockData';
import { formatDateTime } from '@/utils/formatters';

const sampleQueries = [
  {
    name: '25 most recent log events',
    query: `fields @timestamp, @message
| sort @timestamp desc
| limit 25`,
  },
  {
    name: 'Number of exceptions per hour',
    query: `filter @message like /Exception/
| stats count(*) as exceptionCount by bin(1h)
| sort @timestamp desc`,
  },
  {
    name: 'Top 20 log events by @message',
    query: `stats count(*) as eventCount by @message
| sort eventCount desc
| limit 20`,
  },
];

export function LogInsightsPage() {
  const [selectedLogGroups, setSelectedLogGroups] = useState<{ label: string; value: string }[]>([]);
  const [queryText, setQueryText] = useState(`fields @timestamp, @message
| sort @timestamp desc
| limit 20`);
  const [isRunning, setIsRunning] = useState(false);
  const [queryResults, setQueryResults] = useState<{ timestamp: string; message: string }[]>([]);

  const logGroupOptions = logGroups.map((lg) => ({
    label: lg.name,
    value: lg.name,
  }));

  const handleRunQuery = () => {
    setIsRunning(true);
    // Simulate query execution
    setTimeout(() => {
      setQueryResults([
        { timestamp: '2024-12-28T09:55:00Z', message: 'INFO: Request processed successfully for user-123' },
        { timestamp: '2024-12-28T09:54:45Z', message: 'DEBUG: Database query completed in 23ms' },
        { timestamp: '2024-12-28T09:54:30Z', message: 'INFO: API call to /users endpoint' },
        { timestamp: '2024-12-28T09:54:15Z', message: 'WARN: High memory usage detected: 85%' },
        { timestamp: '2024-12-28T09:54:00Z', message: 'ERROR: Failed to connect to cache server' },
        { timestamp: '2024-12-28T09:53:45Z', message: 'INFO: Background job scheduled: cleanup-task' },
        { timestamp: '2024-12-28T09:53:30Z', message: 'DEBUG: Session token validated for user-456' },
        { timestamp: '2024-12-28T09:53:15Z', message: 'INFO: File upload completed: document.pdf (2.3 MB)' },
        { timestamp: '2024-12-28T09:53:00Z', message: 'ERROR: Invalid JSON payload received' },
        { timestamp: '2024-12-28T09:52:45Z', message: 'INFO: New WebSocket connection established' },
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const handleSampleQuery = (query: string) => {
    setQueryText(query);
  };

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Run queries to interactively search and analyze log data"
      >
        Logs Insights
      </Header>

      <Tabs
        tabs={[
          {
            id: 'query',
            label: 'Query',
            content: (
              <SpaceBetween size="l">
                {/* Query Editor */}
                <Container
                  header={
                    <Header
                      variant="h2"
                      actions={
                        <SpaceBetween size="xs" direction="horizontal">
                          <Button disabled={isRunning || selectedLogGroups.length === 0}>
                            Save query
                          </Button>
                          <Button
                            variant="primary"
                            loading={isRunning}
                            onClick={handleRunQuery}
                            disabled={selectedLogGroups.length === 0}
                          >
                            Run query
                          </Button>
                        </SpaceBetween>
                      }
                    >
                      Query editor
                    </Header>
                  }
                >
                  <SpaceBetween size="m">
                    <FormField label="Select log group(s)">
                      <Multiselect
                        selectedOptions={selectedLogGroups}
                        onChange={({ detail }) =>
                          setSelectedLogGroups(detail.selectedOptions as typeof selectedLogGroups)
                        }
                        options={logGroupOptions}
                        placeholder="Select one or more log groups"
                        filteringType="auto"
                      />
                    </FormField>

                    <FormField label="Query">
                      <Textarea
                        value={queryText}
                        onChange={({ detail }) => setQueryText(detail.value)}
                        rows={6}
                        placeholder="Enter your query..."
                      />
                    </FormField>

                    {/* Sample Queries */}
                    <SpaceBetween size="xs">
                      <Box variant="awsui-key-label">Sample queries</Box>
                      <SpaceBetween size="xs" direction="horizontal">
                        {sampleQueries.map((sq) => (
                          <Button
                            key={sq.name}
                            variant="link"
                            onClick={() => handleSampleQuery(sq.query)}
                          >
                            {sq.name}
                          </Button>
                        ))}
                      </SpaceBetween>
                    </SpaceBetween>
                  </SpaceBetween>
                </Container>

                {/* Results */}
                <Container
                  header={
                    <Header variant="h2" counter={`(${queryResults.length})`}>
                      Results
                    </Header>
                  }
                >
                  {queryResults.length === 0 ? (
                    <Box textAlign="center" padding="l" color="text-body-secondary">
                      Run a query to see results here
                    </Box>
                  ) : (
                    <Table
                      columnDefinitions={[
                        {
                          id: 'timestamp',
                          header: '@timestamp',
                          cell: (item) => (
                            <Box variant="code" fontSize="body-s">
                              {formatDateTime(item.timestamp)}
                            </Box>
                          ),
                          width: 200,
                        },
                        {
                          id: 'message',
                          header: '@message',
                          cell: (item) => {
                            const isError = item.message.includes('ERROR');
                            const isWarn = item.message.includes('WARN');
                            return (
                              <Box
                                variant="code"
                                fontSize="body-s"
                                color={isError ? 'text-status-error' : isWarn ? 'text-status-warning' : undefined}
                              >
                                {item.message}
                              </Box>
                            );
                          },
                        },
                      ]}
                      items={queryResults}
                      variant="embedded"
                      stripedRows
                    />
                  )}
                </Container>
              </SpaceBetween>
            ),
          },
          {
            id: 'saved',
            label: 'Saved queries',
            content: (
              <Container
                header={
                  <Header variant="h2" counter={`(${logInsightsQueries.length})`}>
                    Saved Queries
                  </Header>
                }
              >
                <Table
                  columnDefinitions={[
                    {
                      id: 'name',
                      header: 'Query name',
                      cell: (item) => <Link href="#">{item.name}</Link>,
                      isRowHeader: true,
                    },
                    {
                      id: 'logGroups',
                      header: 'Log groups',
                      cell: (item) => item.logGroups.join(', '),
                    },
                    {
                      id: 'lastRun',
                      header: 'Last run',
                      cell: (item) => (item.lastRunAt ? formatDateTime(item.lastRunAt) : 'Never'),
                    },
                    {
                      id: 'created',
                      header: 'Created',
                      cell: (item) => formatDateTime(item.createdAt),
                    },
                    {
                      id: 'actions',
                      header: 'Actions',
                      cell: (item) => (
                        <SpaceBetween size="xs" direction="horizontal">
                          <Button
                            variant="link"
                            onClick={() => {
                              setQueryText(item.query);
                              setSelectedLogGroups(
                                item.logGroups.map((lg) => ({ label: lg, value: lg }))
                              );
                            }}
                          >
                            Load
                          </Button>
                          <Button variant="link">Delete</Button>
                        </SpaceBetween>
                      ),
                    },
                  ]}
                  items={logInsightsQueries}
                  variant="embedded"
                  empty={
                    <Box textAlign="center" padding="l">
                      No saved queries
                    </Box>
                  }
                />
              </Container>
            ),
          },
          {
            id: 'history',
            label: 'Query history',
            content: (
              <Container header={<Header variant="h2">Query History</Header>}>
                <ColumnLayout columns={1}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} padding="s">
                      <SpaceBetween size="xs">
                        <Box variant="code" fontSize="body-s">
                          {`fields @timestamp, @message | sort @timestamp desc | limit ${20 * i}`}
                        </Box>
                        <Box variant="small" color="text-body-secondary">
                          Run {i * 10} minutes ago • /aws/lambda/api-handler • 156 records matched
                        </Box>
                      </SpaceBetween>
                    </Box>
                  ))}
                </ColumnLayout>
              </Container>
            ),
          },
        ]}
      />
    </SpaceBetween>
  );
}
