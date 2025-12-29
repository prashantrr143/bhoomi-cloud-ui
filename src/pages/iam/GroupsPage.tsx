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
import Modal from '@cloudscape-design/components/modal';
import Tabs from '@cloudscape-design/components/tabs';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Badge from '@cloudscape-design/components/badge';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import { iamGroups, iamUsers, iamPolicies } from '@/data/mockData';
import { IAMGroup } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

export function GroupsPage() {
  const [selectedItems, setSelectedItems] = useState<IAMGroup[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const pageSize = 10;

  const filteredGroups = iamGroups.filter(
    (group) =>
      group.groupName.toLowerCase().includes(filteringText.toLowerCase()) ||
      group.arn.toLowerCase().includes(filteringText.toLowerCase())
  );

  const paginatedGroups = filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPolicyName = (policyArn: string) => {
    const policy = iamPolicies.find((p) => p.arn === policyArn);
    return policy?.policyName || policyArn.split('/').pop() || policyArn;
  };

  const getUserName = (userName: string) => {
    const user = iamUsers.find((u) => u.userName === userName);
    return user?.userName || userName;
  };

  const handleDelete = () => {
    console.log('Deleting groups:', selectedItems.map((g) => g.groupName));
    setDeleteModalVisible(false);
    setSelectedItems([]);
  };

  return (
    <SpaceBetween size="l">
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredGroups.length})`}
            description="IAM groups are collections of IAM users. Groups let you specify permissions for multiple users."
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <ButtonDropdown
                  items={[
                    { id: 'delete', text: 'Delete', disabled: selectedItems.length === 0 },
                    { id: 'add-users', text: 'Add users', disabled: selectedItems.length !== 1 },
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
                <Button variant="primary" href="/iam/groups/create">
                  Create group
                </Button>
              </SpaceBetween>
            }
          >
            Groups
          </Header>
        }
        columnDefinitions={[
          {
            id: 'groupName',
            header: 'Group name',
            cell: (item) => <Link href={`/iam/groups/${item.id}`}>{item.groupName}</Link>,
            sortingField: 'groupName',
            width: 200,
          },
          {
            id: 'path',
            header: 'Path',
            cell: (item) => item.path,
            width: 150,
          },
          {
            id: 'users',
            header: 'Users',
            cell: (item) => (
              <Box>
                {item.userCount} user{item.userCount !== 1 ? 's' : ''}
              </Box>
            ),
            width: 100,
          },
          {
            id: 'policies',
            header: 'Attached policies',
            cell: (item) => (
              <SpaceBetween direction="horizontal" size="xs">
                {item.attachedPolicies.length === 0 ? (
                  <Box color="text-status-inactive">None</Box>
                ) : (
                  item.attachedPolicies.slice(0, 2).map((policy) => (
                    <Badge key={policy} color="blue">
                      {getPolicyName(policy)}
                    </Badge>
                  ))
                )}
                {item.attachedPolicies.length > 2 && (
                  <Badge color="grey">+{item.attachedPolicies.length - 2}</Badge>
                )}
              </SpaceBetween>
            ),
            width: 250,
          },
          {
            id: 'inlinePolicies',
            header: 'Inline policies',
            cell: (item) => item.inlinePolicies.length || '0',
            width: 120,
          },
          {
            id: 'createdAt',
            header: 'Created',
            cell: (item) => formatRelativeTime(item.createdAt),
            sortingField: 'createdAt',
            width: 130,
          },
        ]}
        items={paginatedGroups}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="id"
        empty={
          <Box textAlign="center" color="inherit">
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No groups found
            </Box>
            <Button href="/iam/groups/create">Create group</Button>
          </Box>
        }
        filter={
          <TextFilter
            filteringText={filteringText}
            filteringPlaceholder="Find groups"
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
          />
        }
        pagination={
          <Pagination
            currentPageIndex={currentPage}
            pagesCount={Math.ceil(filteredGroups.length / pageSize)}
            onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
          />
        }
      />

      {/* Group Details Panel */}
      {selectedItems.length === 1 && (
        <GroupDetailsPanel
          group={selectedItems[0]}
          getPolicyName={getPolicyName}
          getUserName={getUserName}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        header="Delete groups"
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
            Are you sure you want to delete the following group{selectedItems.length > 1 ? 's' : ''}?
          </Box>
          <Box>
            {selectedItems.map((group) => (
              <Box key={group.id} fontWeight="bold">
                {group.groupName}
              </Box>
            ))}
          </Box>
          <Box color="text-status-warning">
            This action cannot be undone. Users in {selectedItems.length > 1 ? 'these groups' : 'this group'}{' '}
            will lose the permissions granted through {selectedItems.length > 1 ? 'these groups' : 'this group'}.
          </Box>
        </SpaceBetween>
      </Modal>
    </SpaceBetween>
  );
}

interface GroupDetailsPanelProps {
  group: IAMGroup;
  getPolicyName: (arn: string) => string;
  getUserName: (name: string) => string;
}

function GroupDetailsPanel({ group, getPolicyName, getUserName }: GroupDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Add users</Button>
              <Button>Attach policies</Button>
            </SpaceBetween>
          }
        >
          {group.groupName}
        </Header>
      }
    >
      <Tabs
        activeTabId={activeTab}
        onChange={({ detail }) => setActiveTab(detail.activeTabId)}
        tabs={[
          {
            id: 'users',
            label: 'Users',
            content: (
              <SpaceBetween size="m">
                <Box>
                  <Header variant="h3" counter={`(${group.users.length})`}>
                    Group members
                  </Header>
                </Box>
                {group.users.length === 0 ? (
                  <Box color="text-status-inactive">No users in this group</Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      {
                        id: 'userName',
                        header: 'User name',
                        cell: (userName) => (
                          <Link href={`/iam/users/${userName}`}>{getUserName(userName)}</Link>
                        ),
                      },
                    ]}
                    items={group.users}
                    variant="embedded"
                  />
                )}
              </SpaceBetween>
            ),
          },
          {
            id: 'permissions',
            label: 'Permissions',
            content: (
              <SpaceBetween size="l">
                <ExpandableSection headerText="Attached policies" defaultExpanded>
                  {group.attachedPolicies.length === 0 ? (
                    <Box color="text-status-inactive">No policies attached</Box>
                  ) : (
                    <Table
                      columnDefinitions={[
                        {
                          id: 'policyName',
                          header: 'Policy name',
                          cell: (policy) => (
                            <Link href={`/iam/policies/${encodeURIComponent(policy)}`}>
                              {getPolicyName(policy)}
                            </Link>
                          ),
                        },
                        {
                          id: 'arn',
                          header: 'ARN',
                          cell: (policy) => (
                            <CopyToClipboard
                              copyText={policy}
                              copySuccessText="Copied"
                              copyErrorText="Failed to copy"
                              textToCopy={policy}
                            />
                          ),
                        },
                      ]}
                      items={group.attachedPolicies}
                      variant="embedded"
                    />
                  )}
                </ExpandableSection>

                <ExpandableSection headerText="Inline policies">
                  {group.inlinePolicies.length === 0 ? (
                    <Box color="text-status-inactive">No inline policies</Box>
                  ) : (
                    <SpaceBetween size="xs">
                      {group.inlinePolicies.map((policy) => (
                        <Box key={policy}>{policy}</Box>
                      ))}
                    </SpaceBetween>
                  )}
                </ExpandableSection>
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
                    <Box variant="awsui-key-label">Group name</Box>
                    <Box>{group.groupName}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">ARN</Box>
                    <CopyToClipboard
                      copyText={group.arn}
                      copySuccessText="Copied"
                      copyErrorText="Failed to copy"
                      textToCopy={group.arn}
                    />
                  </Box>
                </SpaceBetween>
                <SpaceBetween size="l">
                  <Box>
                    <Box variant="awsui-key-label">Path</Box>
                    <Box>{group.path}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Created</Box>
                    <Box>{formatDateTime(group.createdAt)}</Box>
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
