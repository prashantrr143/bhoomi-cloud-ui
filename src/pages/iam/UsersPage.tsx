import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Pagination from '@cloudscape-design/components/pagination';
import TextFilter from '@cloudscape-design/components/text-filter';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Link from '@cloudscape-design/components/link';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import Modal from '@cloudscape-design/components/modal';
import Tabs from '@cloudscape-design/components/tabs';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Badge from '@cloudscape-design/components/badge';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import { iamUsers, iamPolicies, iamGroups } from '@/data/mockData';
import { IAMUser } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

export function UsersPage() {
  const [selectedItems, setSelectedItems] = useState<IAMUser[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const pageSize = 10;

  const filteredUsers = iamUsers.filter(
    (user) =>
      user.userName.toLowerCase().includes(filteringText.toLowerCase()) ||
      user.arn.toLowerCase().includes(filteringText.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPolicyName = (policyArn: string) => {
    const policy = iamPolicies.find((p) => p.arn === policyArn);
    return policy?.policyName || policyArn.split('/').pop() || policyArn;
  };

  const getGroupName = (groupName: string) => {
    const group = iamGroups.find((g) => g.groupName === groupName);
    return group?.groupName || groupName;
  };

  const handleDelete = () => {
    // In real app, this would call an API
    console.log('Deleting users:', selectedItems.map((u) => u.userName));
    setDeleteModalVisible(false);
    setSelectedItems([]);
  };

  return (
    <SpaceBetween size="l">
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredUsers.length})`}
            description="IAM users are entities that you create to represent a person or application that interacts with Bhoomi Cloud"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <ButtonDropdown
                  items={[
                    { id: 'delete', text: 'Delete', disabled: selectedItems.length === 0 },
                    { id: 'add-to-group', text: 'Add to group', disabled: selectedItems.length === 0 },
                    { id: 'remove-from-group', text: 'Remove from group', disabled: selectedItems.length === 0 },
                    { id: 'attach-policy', text: 'Attach policy', disabled: selectedItems.length === 0 },
                  ]}
                  onItemClick={({ detail }) => {
                    if (detail.id === 'delete') {
                      setDeleteModalVisible(true);
                    }
                  }}
                >
                  Actions
                </ButtonDropdown>
                <Button variant="primary" href="/iam/users/create">
                  Create user
                </Button>
              </SpaceBetween>
            }
          >
            Users
          </Header>
        }
        columnDefinitions={[
          {
            id: 'userName',
            header: 'User name',
            cell: (item) => <Link href={`/iam/users/${item.id}`}>{item.userName}</Link>,
            sortingField: 'userName',
            width: 200,
          },
          {
            id: 'path',
            header: 'Path',
            cell: (item) => item.path,
            width: 120,
          },
          {
            id: 'groups',
            header: 'Groups',
            cell: (item) => (
              <SpaceBetween direction="horizontal" size="xs">
                {item.groups.length === 0 ? (
                  <Box color="text-status-inactive">None</Box>
                ) : (
                  item.groups.slice(0, 2).map((group) => (
                    <Badge key={group} color="blue">
                      {getGroupName(group)}
                    </Badge>
                  ))
                )}
                {item.groups.length > 2 && (
                  <Badge color="grey">+{item.groups.length - 2}</Badge>
                )}
              </SpaceBetween>
            ),
            width: 200,
          },
          {
            id: 'consoleAccess',
            header: 'Console access',
            cell: (item) =>
              item.consoleAccess ? (
                <StatusIndicator type="success">Enabled</StatusIndicator>
              ) : (
                <StatusIndicator type="stopped">Disabled</StatusIndicator>
              ),
            width: 130,
          },
          {
            id: 'mfa',
            header: 'MFA',
            cell: (item) =>
              item.mfaEnabled ? (
                <StatusIndicator type="success">Active</StatusIndicator>
              ) : item.consoleAccess ? (
                <StatusIndicator type="warning">Not enabled</StatusIndicator>
              ) : (
                <Box color="text-status-inactive">N/A</Box>
              ),
            width: 120,
          },
          {
            id: 'accessKeys',
            header: 'Access keys',
            cell: (item) => {
              const activeKeys = item.accessKeys.filter((k) => k.status === 'Active');
              return (
                <Box>
                  {activeKeys.length} active / {item.accessKeys.length} total
                </Box>
              );
            },
            width: 130,
          },
          {
            id: 'passwordLastUsed',
            header: 'Last activity',
            cell: (item) =>
              item.passwordLastUsed ? (
                formatRelativeTime(item.passwordLastUsed)
              ) : (
                <Box color="text-status-inactive">Never</Box>
              ),
            width: 140,
          },
          {
            id: 'createdAt',
            header: 'Created',
            cell: (item) => formatRelativeTime(item.createdAt),
            sortingField: 'createdAt',
            width: 130,
          },
        ]}
        items={paginatedUsers}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="id"
        empty={
          <Box textAlign="center" color="inherit">
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No users found
            </Box>
            <Button href="/iam/users/create">Create user</Button>
          </Box>
        }
        filter={
          <TextFilter
            filteringText={filteringText}
            filteringPlaceholder="Find users"
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
          />
        }
        pagination={
          <Pagination
            currentPageIndex={currentPage}
            pagesCount={Math.ceil(filteredUsers.length / pageSize)}
            onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
          />
        }
      />

      {/* User Details Panel */}
      {selectedItems.length === 1 && (
        <UserDetailsPanel user={selectedItems[0]} getPolicyName={getPolicyName} getGroupName={getGroupName} />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        header="Delete users"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setDeleteModalVisible(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleDelete}>
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box>
            Are you sure you want to delete the following user{selectedItems.length > 1 ? 's' : ''}?
          </Box>
          <Box>
            {selectedItems.map((user) => (
              <Box key={user.id} fontWeight="bold">
                {user.userName}
              </Box>
            ))}
          </Box>
          <Box color="text-status-warning">
            This action cannot be undone. All access keys, MFA devices, and permissions associated
            with {selectedItems.length > 1 ? 'these users' : 'this user'} will be permanently
            deleted.
          </Box>
        </SpaceBetween>
      </Modal>
    </SpaceBetween>
  );
}

interface UserDetailsPanelProps {
  user: IAMUser;
  getPolicyName: (arn: string) => string;
  getGroupName: (name: string) => string;
}

function UserDetailsPanel({ user, getPolicyName, getGroupName }: UserDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('permissions');

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Edit</Button>
              <Button>Security credentials</Button>
            </SpaceBetween>
          }
        >
          {user.userName}
        </Header>
      }
    >
      <Tabs
        activeTabId={activeTab}
        onChange={({ detail }) => setActiveTab(detail.activeTabId)}
        tabs={[
          {
            id: 'permissions',
            label: 'Permissions',
            content: (
              <SpaceBetween size="l">
                <ExpandableSection headerText="Groups" defaultExpanded>
                  {user.groups.length === 0 ? (
                    <Box color="text-status-inactive">Not a member of any groups</Box>
                  ) : (
                    <SpaceBetween size="xs">
                      {user.groups.map((group) => (
                        <Link key={group} href={`/iam/groups/${group}`}>
                          {getGroupName(group)}
                        </Link>
                      ))}
                    </SpaceBetween>
                  )}
                </ExpandableSection>

                <ExpandableSection headerText="Attached policies" defaultExpanded>
                  {user.attachedPolicies.length === 0 ? (
                    <Box color="text-status-inactive">No policies attached directly</Box>
                  ) : (
                    <SpaceBetween size="xs">
                      {user.attachedPolicies.map((policy) => (
                        <Link key={policy} href={`/iam/policies/${encodeURIComponent(policy)}`}>
                          {getPolicyName(policy)}
                        </Link>
                      ))}
                    </SpaceBetween>
                  )}
                </ExpandableSection>

                <ExpandableSection headerText="Inline policies">
                  {user.inlinePolicies.length === 0 ? (
                    <Box color="text-status-inactive">No inline policies</Box>
                  ) : (
                    <SpaceBetween size="xs">
                      {user.inlinePolicies.map((policy) => (
                        <Box key={policy}>{policy}</Box>
                      ))}
                    </SpaceBetween>
                  )}
                </ExpandableSection>

                {user.permissionsBoundary && (
                  <ExpandableSection headerText="Permissions boundary">
                    <Link href={`/iam/policies/${encodeURIComponent(user.permissionsBoundary)}`}>
                      {getPolicyName(user.permissionsBoundary)}
                    </Link>
                  </ExpandableSection>
                )}
              </SpaceBetween>
            ),
          },
          {
            id: 'groups',
            label: 'Groups',
            content: (
              <SpaceBetween size="m">
                <Box>
                  <Header variant="h3" counter={`(${user.groups.length})`}>
                    Group memberships
                  </Header>
                </Box>
                {user.groups.length === 0 ? (
                  <Box color="text-status-inactive">This user is not a member of any groups</Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      {
                        id: 'name',
                        header: 'Group name',
                        cell: (group) => <Link href={`/iam/groups/${group}`}>{getGroupName(group)}</Link>,
                      },
                    ]}
                    items={user.groups}
                    variant="embedded"
                  />
                )}
              </SpaceBetween>
            ),
          },
          {
            id: 'security',
            label: 'Security credentials',
            content: (
              <SpaceBetween size="l">
                <ColumnLayout columns={2}>
                  <Box>
                    <Box variant="awsui-key-label">Console access</Box>
                    {user.consoleAccess ? (
                      <StatusIndicator type="success">Enabled</StatusIndicator>
                    ) : (
                      <StatusIndicator type="stopped">Disabled</StatusIndicator>
                    )}
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">MFA</Box>
                    {user.mfaEnabled ? (
                      <StatusIndicator type="success">
                        {user.mfaDevices.length} device{user.mfaDevices.length > 1 ? 's' : ''} registered
                      </StatusIndicator>
                    ) : (
                      <StatusIndicator type="warning">Not enabled</StatusIndicator>
                    )}
                  </Box>
                </ColumnLayout>

                <ExpandableSection headerText="Access keys" defaultExpanded>
                  {user.accessKeys.length === 0 ? (
                    <Box color="text-status-inactive">No access keys</Box>
                  ) : (
                    <Table
                      columnDefinitions={[
                        {
                          id: 'accessKeyId',
                          header: 'Access key ID',
                          cell: (key) => (
                            <CopyToClipboard
                              copyText={key.accessKeyId}
                              copySuccessText="Copied"
                              copyErrorText="Failed to copy"
                              textToCopy={key.accessKeyId}
                            />
                          ),
                        },
                        {
                          id: 'status',
                          header: 'Status',
                          cell: (key) =>
                            key.status === 'Active' ? (
                              <StatusIndicator type="success">Active</StatusIndicator>
                            ) : (
                              <StatusIndicator type="stopped">Inactive</StatusIndicator>
                            ),
                        },
                        {
                          id: 'created',
                          header: 'Created',
                          cell: (key) => formatDateTime(key.createdAt),
                        },
                        {
                          id: 'lastUsed',
                          header: 'Last used',
                          cell: (key) =>
                            key.lastUsedAt ? (
                              <Box>
                                {formatRelativeTime(key.lastUsedAt)}
                                {key.lastUsedService && (
                                  <Box variant="small" color="text-body-secondary">
                                    {key.lastUsedService} in {key.lastUsedRegion}
                                  </Box>
                                )}
                              </Box>
                            ) : (
                              <Box color="text-status-inactive">Never</Box>
                            ),
                        },
                      ]}
                      items={user.accessKeys}
                      variant="embedded"
                    />
                  )}
                </ExpandableSection>

                {user.mfaDevices.length > 0 && (
                  <ExpandableSection headerText="MFA devices">
                    <Table
                      columnDefinitions={[
                        { id: 'serialNumber', header: 'Serial number', cell: (mfa) => mfa.serialNumber },
                        { id: 'type', header: 'Type', cell: (mfa) => mfa.type },
                        { id: 'enabledAt', header: 'Enabled', cell: (mfa) => formatDateTime(mfa.enabledAt) },
                      ]}
                      items={user.mfaDevices}
                      variant="embedded"
                    />
                  </ExpandableSection>
                )}
              </SpaceBetween>
            ),
          },
          {
            id: 'tags',
            label: 'Tags',
            content: (
              <SpaceBetween size="m">
                <Box>
                  <Header variant="h3" counter={`(${Object.keys(user.tags).length})`}>
                    Tags
                  </Header>
                </Box>
                {Object.keys(user.tags).length === 0 ? (
                  <Box color="text-status-inactive">No tags</Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      { id: 'key', header: 'Key', cell: ([key]) => key },
                      { id: 'value', header: 'Value', cell: ([, value]) => value },
                    ]}
                    items={Object.entries(user.tags)}
                    variant="embedded"
                  />
                )}
              </SpaceBetween>
            ),
          },
          {
            id: 'summary',
            label: 'Summary',
            content: (
              <ColumnLayout columns={2} variant="text-grid">
                <SpaceBetween size="l">
                  <Box>
                    <Box variant="awsui-key-label">User name</Box>
                    <Box>{user.userName}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">ARN</Box>
                    <CopyToClipboard
                      copyText={user.arn}
                      copySuccessText="Copied"
                      copyErrorText="Failed to copy"
                      textToCopy={user.arn}
                    />
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Path</Box>
                    <Box>{user.path}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Created</Box>
                    <Box>{formatDateTime(user.createdAt)}</Box>
                  </Box>
                </SpaceBetween>
                <SpaceBetween size="l">
                  <Box>
                    <Box variant="awsui-key-label">Password last used</Box>
                    <Box>
                      {user.passwordLastUsed ? formatDateTime(user.passwordLastUsed) : 'Never'}
                    </Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Console access</Box>
                    <Box>{user.consoleAccess ? 'Enabled' : 'Disabled'}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Programmatic access</Box>
                    <Box>{user.programmaticAccess ? 'Enabled' : 'Disabled'}</Box>
                  </Box>
                </SpaceBetween>
              </ColumnLayout>
            ),
          },
        ]}
      />
    </Container>
  );
}
