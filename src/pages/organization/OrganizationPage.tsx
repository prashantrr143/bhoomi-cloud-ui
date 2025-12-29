import {
  Container,
  Header,
  SpaceBetween,
  Table,
  Box,
  Badge,
  ColumnLayout,
  StatusIndicator,
  Tabs,
  ContentLayout,
  Link,
  BreadcrumbGroup,
} from '@cloudscape-design/components';
import { useTenant } from '@/contexts/TenantContext';
import { organizationalUnits, organizationRoots } from '@/data/organizationMockData';
import type { Account, OrganizationalUnit } from '@/types/organization';

export function OrganizationPage() {
  const {
    currentOrganization,
    availableAccounts,
    currentAccount,
    getAllOUs,
    canManageOrganization,
  } = useTenant();

  if (!canManageOrganization()) {
    return (
      <ContentLayout
        header={
          <Header variant="h1">Organization</Header>
        }
      >
        <Container>
          <Box textAlign="center" padding="xl">
            <StatusIndicator type="warning">
              You do not have permission to view organization details.
            </StatusIndicator>
          </Box>
        </Container>
      </ContentLayout>
    );
  }

  if (!currentOrganization) {
    return (
      <ContentLayout
        header={
          <Header variant="h1">Organization</Header>
        }
      >
        <Container>
          <Box textAlign="center" padding="xl">
            <StatusIndicator type="info">No organization selected</StatusIndicator>
          </Box>
        </Container>
      </ContentLayout>
    );
  }

  const allOUs = getAllOUs();
  const root = organizationRoots.find((r) => r.arn.includes(currentOrganization.id));

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <StatusIndicator type="success">Active</StatusIndicator>;
      case 'SUSPENDED':
        return <StatusIndicator type="warning">Suspended</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{status}</StatusIndicator>;
    }
  };

  const getParentName = (parentId: string): string => {
    if (parentId.startsWith('r-')) {
      return 'Root';
    }
    const ou = organizationalUnits.find((o) => o.id === parentId);
    return ou?.name || parentId;
  };

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <BreadcrumbGroup
            items={[
              { text: 'Console', href: '/console' },
              { text: 'Organization', href: '/organization' },
            ]}
          />
          <Header
            variant="h1"
            description={`Organization ID: ${currentOrganization.id}`}
            info={<Badge color="green">{currentOrganization.featureSet}</Badge>}
          >
            Organization Overview
          </Header>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        {/* Organization Details */}
        <Container header={<Header variant="h2">Organization Details</Header>}>
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Organization ID</Box>
              <div>{currentOrganization.id}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Master Account</Box>
              <div>{currentOrganization.masterAccountId}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Master Account Email</Box>
              <div>{currentOrganization.masterAccountEmail}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Feature Set</Box>
              <Badge>{currentOrganization.featureSet}</Badge>
            </div>
            <div>
              <Box variant="awsui-key-label">Status</Box>
              {getStatusIndicator(currentOrganization.status)}
            </div>
            <div>
              <Box variant="awsui-key-label">Created</Box>
              <div>{new Date(currentOrganization.createdAt).toLocaleDateString()}</div>
            </div>
          </ColumnLayout>
        </Container>

        {/* Tabs for Accounts and OUs */}
        <Tabs
          tabs={[
            {
              id: 'accounts',
              label: `Accounts (${availableAccounts.length})`,
              content: (
                <Table<Account>
                  columnDefinitions={[
                    {
                      id: 'name',
                      header: 'Account Name',
                      cell: (item) => (
                        <SpaceBetween direction="horizontal" size="xs">
                          <Link href={`/organization/accounts/${item.id}`}>{item.name}</Link>
                          {item.id === currentAccount?.id && (
                            <Badge color="blue">Current</Badge>
                          )}
                          {item.id === currentOrganization.masterAccountId && (
                            <Badge color="grey">Master</Badge>
                          )}
                        </SpaceBetween>
                      ),
                      sortingField: 'name',
                    },
                    {
                      id: 'id',
                      header: 'Account ID',
                      cell: (item) => item.id,
                      sortingField: 'id',
                    },
                    {
                      id: 'email',
                      header: 'Email',
                      cell: (item) => item.email,
                    },
                    {
                      id: 'status',
                      header: 'Status',
                      cell: (item) => getStatusIndicator(item.status),
                    },
                    {
                      id: 'parent',
                      header: 'Parent',
                      cell: (item) => getParentName(item.parentId),
                    },
                    {
                      id: 'joinedMethod',
                      header: 'Joined Method',
                      cell: (item) => (
                        <Badge color={item.joinedMethod === 'CREATED' ? 'green' : 'blue'}>
                          {item.joinedMethod}
                        </Badge>
                      ),
                    },
                  ]}
                  items={availableAccounts}
                  sortingDisabled={false}
                  stripedRows
                  variant="embedded"
                  empty={
                    <Box textAlign="center">
                      <b>No accounts</b>
                      <Box variant="p" color="text-body-secondary">
                        No accounts found in this organization.
                      </Box>
                    </Box>
                  }
                />
              ),
            },
            {
              id: 'ous',
              label: `Organizational Units (${allOUs.length})`,
              content: (
                <SpaceBetween size="m">
                  {/* Root info */}
                  {root && (
                    <Container header={<Header variant="h3">Root</Header>}>
                      <ColumnLayout columns={3} variant="text-grid">
                        <div>
                          <Box variant="awsui-key-label">Root ID</Box>
                          <div>{root.id}</div>
                        </div>
                        <div>
                          <Box variant="awsui-key-label">Name</Box>
                          <div>{root.name}</div>
                        </div>
                        <div>
                          <Box variant="awsui-key-label">Policy Types</Box>
                          <SpaceBetween direction="horizontal" size="xs">
                            {root.policyTypes.map((pt) => (
                              <Badge key={pt.type} color={pt.status === 'ENABLED' ? 'green' : 'grey'}>
                                {pt.type.replace('_', ' ')}
                              </Badge>
                            ))}
                            {root.policyTypes.length === 0 && <span>None</span>}
                          </SpaceBetween>
                        </div>
                      </ColumnLayout>
                    </Container>
                  )}

                  {/* OUs Table */}
                  <Table<OrganizationalUnit>
                    columnDefinitions={[
                      {
                        id: 'name',
                        header: 'OU Name',
                        cell: (item) => (
                          <Link href={`/organization/ous/${item.id}`}>{item.name}</Link>
                        ),
                        sortingField: 'name',
                      },
                      {
                        id: 'id',
                        header: 'OU ID',
                        cell: (item) => item.id,
                        sortingField: 'id',
                      },
                      {
                        id: 'parent',
                        header: 'Parent',
                        cell: (item) => getParentName(item.parentId),
                      },
                      {
                        id: 'status',
                        header: 'Status',
                        cell: (item) => getStatusIndicator(item.status),
                      },
                      {
                        id: 'created',
                        header: 'Created',
                        cell: (item) => new Date(item.createdAt).toLocaleDateString(),
                      },
                    ]}
                    items={allOUs}
                    sortingDisabled={false}
                    stripedRows
                    variant="embedded"
                    empty={
                      <Box textAlign="center">
                        <b>No organizational units</b>
                        <Box variant="p" color="text-body-secondary">
                          No OUs found in this organization.
                        </Box>
                      </Box>
                    }
                  />
                </SpaceBetween>
              ),
            },
            {
              id: 'policies',
              label: 'Policies',
              content: (
                <Container>
                  <SpaceBetween size="m">
                    <Header variant="h3">Available Policy Types</Header>
                    {currentOrganization.availablePolicyTypes.length > 0 ? (
                      <Table
                        columnDefinitions={[
                          {
                            id: 'type',
                            header: 'Policy Type',
                            cell: (item) => item.type.replace(/_/g, ' '),
                          },
                          {
                            id: 'status',
                            header: 'Status',
                            cell: (item) => (
                              <StatusIndicator type={item.status === 'ENABLED' ? 'success' : 'stopped'}>
                                {item.status}
                              </StatusIndicator>
                            ),
                          },
                        ]}
                        items={currentOrganization.availablePolicyTypes}
                        variant="embedded"
                      />
                    ) : (
                      <Box textAlign="center" color="text-body-secondary">
                        No policy types enabled for this organization.
                      </Box>
                    )}
                  </SpaceBetween>
                </Container>
              ),
            },
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
