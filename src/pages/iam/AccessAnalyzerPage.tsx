import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Pagination from '@cloudscape-design/components/pagination';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import Tabs from '@cloudscape-design/components/tabs';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Badge from '@cloudscape-design/components/badge';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Alert from '@cloudscape-design/components/alert';
import Select from '@cloudscape-design/components/select';
import {
  iamAccessAnalyzers,
  iamAccessAnalyzerFindings,
} from '@/data/mockData';
import {
  IAMAccessAnalyzerFinding,
  IAMAccessAnalyzerFindingStatus,
  IAMAccessAnalyzerFindingResourceType,
} from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const findingStatusColors: Record<IAMAccessAnalyzerFindingStatus, 'red' | 'blue' | 'grey' | 'green'> = {
  Active: 'red',
  Archived: 'grey',
  Resolved: 'green',
};

const resourceTypeLabels: Record<IAMAccessAnalyzerFindingResourceType, string> = {
  'AWS::S3::Bucket': 'S3 Bucket',
  'AWS::IAM::Role': 'IAM Role',
  'AWS::SQS::Queue': 'SQS Queue',
  'AWS::Lambda::Function': 'Lambda Function',
  'AWS::Lambda::LayerVersion': 'Lambda Layer',
  'AWS::KMS::Key': 'KMS Key',
  'AWS::SecretsManager::Secret': 'Secrets Manager Secret',
  'AWS::EFS::FileSystem': 'EFS File System',
  'AWS::EC2::Snapshot': 'EC2 Snapshot',
  'AWS::ECR::Repository': 'ECR Repository',
  'AWS::RDS::DBSnapshot': 'RDS Snapshot',
  'AWS::RDS::DBClusterSnapshot': 'RDS Cluster Snapshot',
  'AWS::SNS::Topic': 'SNS Topic',
};

export function AccessAnalyzerPage() {
  const [selectedFindings, setSelectedFindings] = useState<IAMAccessAnalyzerFinding[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('findings');
  const [statusFilter, setStatusFilter] = useState<{ value: string; label: string } | null>({
    value: 'Active',
    label: 'Active',
  });
  const pageSize = 10;

  const activeAnalyzer = iamAccessAnalyzers.find((a) => a.status === 'Active');

  const filteredFindings = iamAccessAnalyzerFindings.filter((finding) => {
    const matchesText =
      finding.resourceArn.toLowerCase().includes(filteringText.toLowerCase()) ||
      finding.principal.type.toLowerCase().includes(filteringText.toLowerCase());
    const matchesStatus = !statusFilter || finding.status === statusFilter.value;
    return matchesText && matchesStatus;
  });

  const paginatedFindings = filteredFindings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeFindings = iamAccessAnalyzerFindings.filter((f) => f.status === 'Active');
  const publicFindings = activeFindings.filter((f) => f.isPublic);

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Identify resources in your organization and accounts that are shared with an external entity"
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="primary" href="/iam/access-analyzer/create">
              Create analyzer
            </Button>
          </SpaceBetween>
        }
      >
        IAM Access Analyzer
      </Header>

      {/* Summary Alert */}
      {publicFindings.length > 0 && (
        <Alert
          type="error"
          header={`${publicFindings.length} resource${publicFindings.length > 1 ? 's' : ''} with public access detected`}
        >
          Access Analyzer has detected resources that are publicly accessible. Review and remediate
          these findings to secure your resources.
        </Alert>
      )}

      {/* Quick Stats */}
      <ColumnLayout columns={4} variant="text-grid">
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Analyzers</Box>
            <Box variant="h1">{iamAccessAnalyzers.length}</Box>
            <StatusIndicator type={activeAnalyzer ? 'success' : 'warning'}>
              {activeAnalyzer ? '1 active' : 'No active analyzer'}
            </StatusIndicator>
          </SpaceBetween>
        </Container>
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Active Findings</Box>
            <Box variant="h1">{activeFindings.length}</Box>
            <Link href="#" onClick={() => setStatusFilter({ value: 'Active', label: 'Active' })}>
              View active findings
            </Link>
          </SpaceBetween>
        </Container>
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Public Access</Box>
            <Box variant="h1" color={publicFindings.length > 0 ? 'text-status-error' : undefined}>
              {publicFindings.length}
            </Box>
            {publicFindings.length > 0 ? (
              <StatusIndicator type="error">Requires attention</StatusIndicator>
            ) : (
              <StatusIndicator type="success">No public access</StatusIndicator>
            )}
          </SpaceBetween>
        </Container>
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Resolved</Box>
            <Box variant="h1">
              {iamAccessAnalyzerFindings.filter((f) => f.status === 'Resolved').length}
            </Box>
            <Box variant="small" color="text-body-secondary">
              {iamAccessAnalyzerFindings.filter((f) => f.status === 'Archived').length} archived
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      <Tabs
        activeTabId={activeTab}
        onChange={({ detail }) => setActiveTab(detail.activeTabId)}
        tabs={[
          {
            id: 'findings',
            label: `Findings (${filteredFindings.length})`,
            content: (
              <Table
                header={
                  <Header
                    variant="h2"
                    counter={`(${filteredFindings.length})`}
                    actions={
                      <SpaceBetween direction="horizontal" size="xs">
                        <ButtonDropdown
                          items={[
                            { id: 'archive', text: 'Archive', disabled: selectedFindings.length === 0 },
                            { id: 'resolve', text: 'Resolve', disabled: selectedFindings.length === 0 },
                            { id: 'rescan', text: 'Rescan', disabled: selectedFindings.length === 0 },
                          ]}
                        >
                          Actions
                        </ButtonDropdown>
                      </SpaceBetween>
                    }
                  >
                    Findings
                  </Header>
                }
                columnDefinitions={[
                  {
                    id: 'finding',
                    header: 'Finding',
                    cell: (item) => (
                      <SpaceBetween size="xs">
                        <Link href={`/iam/access-analyzer/findings/${item.id}`}>
                          {item.resourceArn.split(':').pop()}
                        </Link>
                        <Box variant="small" color="text-body-secondary">
                          {resourceTypeLabels[item.resourceType] || item.resourceType}
                        </Box>
                      </SpaceBetween>
                    ),
                    width: 250,
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (item) => (
                      <Badge color={findingStatusColors[item.status]}>{item.status}</Badge>
                    ),
                    width: 100,
                  },
                  {
                    id: 'public',
                    header: 'Public',
                    cell: (item) =>
                      item.isPublic ? (
                        <StatusIndicator type="error">Yes</StatusIndicator>
                      ) : (
                        <StatusIndicator type="success">No</StatusIndicator>
                      ),
                    width: 80,
                  },
                  {
                    id: 'principal',
                    header: 'External principal',
                    cell: (item) => (
                      <Box>
                        <Box>{item.principal.type}</Box>
                        <Box variant="small" color="text-body-secondary">
                          {item.principal.identifier}
                        </Box>
                      </Box>
                    ),
                    width: 200,
                  },
                  {
                    id: 'access',
                    header: 'Access level',
                    cell: (item) => (
                      <SpaceBetween direction="horizontal" size="xs">
                        {item.actions.slice(0, 2).map((action) => (
                          <Badge key={action}>{action.split(':').pop()}</Badge>
                        ))}
                        {item.actions.length > 2 && (
                          <Badge color="grey">+{item.actions.length - 2}</Badge>
                        )}
                      </SpaceBetween>
                    ),
                    width: 200,
                  },
                  {
                    id: 'analyzedAt',
                    header: 'Analyzed',
                    cell: (item) => formatRelativeTime(item.analyzedAt),
                    sortingField: 'analyzedAt',
                    width: 130,
                  },
                ]}
                items={paginatedFindings}
                selectionType="multi"
                selectedItems={selectedFindings}
                onSelectionChange={({ detail }) => setSelectedFindings(detail.selectedItems)}
                trackBy="id"
                empty={
                  <Box textAlign="center" color="inherit">
                    <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                      No findings found
                    </Box>
                  </Box>
                }
                filter={
                  <SpaceBetween direction="horizontal" size="xs">
                    <TextFilter
                      filteringText={filteringText}
                      filteringPlaceholder="Find findings"
                      onChange={({ detail }) => setFilteringText(detail.filteringText)}
                    />
                    <Select
                      selectedOption={statusFilter}
                      onChange={({ detail }) =>
                        setStatusFilter(detail.selectedOption as { value: string; label: string } | null)
                      }
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Archived', label: 'Archived' },
                        { value: 'Resolved', label: 'Resolved' },
                      ]}
                      placeholder="Filter by status"
                      expandToViewport
                    />
                  </SpaceBetween>
                }
                pagination={
                  <Pagination
                    currentPageIndex={currentPage}
                    pagesCount={Math.ceil(filteredFindings.length / pageSize)}
                    onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                  />
                }
              />
            ),
          },
          {
            id: 'analyzers',
            label: `Analyzers (${iamAccessAnalyzers.length})`,
            content: (
              <Table
                header={
                  <Header
                    variant="h2"
                    counter={`(${iamAccessAnalyzers.length})`}
                    actions={
                      <Button variant="primary" href="/iam/access-analyzer/create">
                        Create analyzer
                      </Button>
                    }
                  >
                    Analyzers
                  </Header>
                }
                columnDefinitions={[
                  {
                    id: 'name',
                    header: 'Analyzer name',
                    cell: (item) => (
                      <Link href={`/iam/access-analyzer/analyzers/${item.id}`}>{item.name}</Link>
                    ),
                    width: 250,
                  },
                  {
                    id: 'type',
                    header: 'Type',
                    cell: (item) => <Badge>{item.type}</Badge>,
                    width: 150,
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (item) =>
                      item.status === 'Active' ? (
                        <StatusIndicator type="success">Active</StatusIndicator>
                      ) : item.status === 'Creating' ? (
                        <StatusIndicator type="in-progress">Creating</StatusIndicator>
                      ) : (
                        <StatusIndicator type="stopped">{item.status}</StatusIndicator>
                      ),
                    width: 120,
                  },
                  {
                    id: 'findings',
                    header: 'Active findings',
                    cell: (item) => item.findingsCount,
                    width: 130,
                  },
                  {
                    id: 'lastScan',
                    header: 'Last resource analyzed',
                    cell: (item) =>
                      item.lastResourceAnalyzed
                        ? formatRelativeTime(item.lastResourceAnalyzed)
                        : 'Never',
                    width: 180,
                  },
                  {
                    id: 'createdAt',
                    header: 'Created',
                    cell: (item) => formatDateTime(item.createdAt),
                    width: 180,
                  },
                ]}
                items={iamAccessAnalyzers}
                trackBy="id"
                empty={
                  <Box textAlign="center" color="inherit">
                    <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                      No analyzers found
                    </Box>
                    <Button href="/iam/access-analyzer/create">Create analyzer</Button>
                  </Box>
                }
              />
            ),
          },
        ]}
      />

      {/* Finding Details Panel */}
      {selectedFindings.length === 1 && (
        <FindingDetailsPanel finding={selectedFindings[0]} />
      )}
    </SpaceBetween>
  );
}

interface FindingDetailsPanelProps {
  finding: IAMAccessAnalyzerFinding;
}

function FindingDetailsPanel({ finding }: FindingDetailsPanelProps) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Archive</Button>
              <Button>Rescan</Button>
            </SpaceBetween>
          }
        >
          Finding Details
        </Header>
      }
    >
      <ColumnLayout columns={2} variant="text-grid">
        <SpaceBetween size="l">
          <Box>
            <Box variant="awsui-key-label">Resource ARN</Box>
            <Box>{finding.resourceArn}</Box>
          </Box>
          <Box>
            <Box variant="awsui-key-label">Resource type</Box>
            <Box>{resourceTypeLabels[finding.resourceType] || finding.resourceType}</Box>
          </Box>
          <Box>
            <Box variant="awsui-key-label">Status</Box>
            <Badge color={findingStatusColors[finding.status]}>{finding.status}</Badge>
          </Box>
          <Box>
            <Box variant="awsui-key-label">Public access</Box>
            {finding.isPublic ? (
              <StatusIndicator type="error">Yes - Resource is publicly accessible</StatusIndicator>
            ) : (
              <StatusIndicator type="success">No</StatusIndicator>
            )}
          </Box>
        </SpaceBetween>
        <SpaceBetween size="l">
          <Box>
            <Box variant="awsui-key-label">External principal</Box>
            <Box>
              {finding.principal.type}: {finding.principal.identifier}
            </Box>
          </Box>
          <Box>
            <Box variant="awsui-key-label">Actions</Box>
            <SpaceBetween direction="horizontal" size="xs">
              {finding.actions.map((action) => (
                <Badge key={action}>{action}</Badge>
              ))}
            </SpaceBetween>
          </Box>
          <Box>
            <Box variant="awsui-key-label">Condition</Box>
            <Box>{JSON.stringify(finding.condition) || 'None'}</Box>
          </Box>
          <Box>
            <Box variant="awsui-key-label">Analyzed at</Box>
            <Box>{formatDateTime(finding.analyzedAt)}</Box>
          </Box>
          {finding.updatedAt && (
            <Box>
              <Box variant="awsui-key-label">Last updated</Box>
              <Box>{formatDateTime(finding.updatedAt)}</Box>
            </Box>
          )}
        </SpaceBetween>
      </ColumnLayout>
    </Container>
  );
}
