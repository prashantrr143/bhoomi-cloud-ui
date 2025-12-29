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
import CodeEditor from '@cloudscape-design/components/code-editor';
import Select from '@cloudscape-design/components/select';
import 'ace-builds/css/ace.css';
import 'ace-builds/css/theme/dawn.css';
import { iamPolicies, iamUsers, iamGroups, iamRoles } from '@/data/mockData';
import { IAMPolicy, IAMPolicyType } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const policyTypeLabels: Record<IAMPolicyType, string> = {
  'AWS managed': 'AWS Managed',
  'Customer managed': 'Customer Managed',
};

const policyTypeColors: Record<IAMPolicyType, 'blue' | 'green'> = {
  'AWS managed': 'blue',
  'Customer managed': 'green',
};

export function PoliciesPage() {
  const [selectedItems, setSelectedItems] = useState<IAMPolicy[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [policyTypeFilter, setPolicyTypeFilter] = useState<{ value: string; label: string } | null>(null);
  const pageSize = 10;

  const filteredPolicies = iamPolicies.filter((policy) => {
    const matchesText =
      policy.policyName.toLowerCase().includes(filteringText.toLowerCase()) ||
      policy.arn.toLowerCase().includes(filteringText.toLowerCase()) ||
      policy.description?.toLowerCase().includes(filteringText.toLowerCase());
    const matchesType = !policyTypeFilter || policy.type === policyTypeFilter.value;
    return matchesText && matchesType;
  });

  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getUserName = (userId: string) => {
    const user = iamUsers.find((u) => u.id === userId || u.userName === userId);
    return user?.userName || userId;
  };

  const getGroupName = (groupId: string) => {
    const group = iamGroups.find((g) => g.id === groupId || g.groupName === groupId);
    return group?.groupName || groupId;
  };

  const getRoleName = (roleId: string) => {
    const role = iamRoles.find((r) => r.id === roleId || r.roleName === roleId);
    return role?.roleName || roleId;
  };

  const handleDelete = () => {
    console.log(
      'Deleting policies:',
      selectedItems.map((p) => p.policyName)
    );
    setDeleteModalVisible(false);
    setSelectedItems([]);
  };

  const canDelete = selectedItems.every((p) => p.type === 'Customer managed');

  return (
    <SpaceBetween size="l">
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredPolicies.length})`}
            description="IAM policies define permissions for an action regardless of the method that you use to perform the operation."
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <ButtonDropdown
                  items={[
                    {
                      id: 'delete',
                      text: 'Delete',
                      disabled: selectedItems.length === 0 || !canDelete,
                    },
                    { id: 'create-version', text: 'Create version', disabled: selectedItems.length !== 1 },
                    { id: 'attach', text: 'Attach', disabled: selectedItems.length !== 1 },
                  ]}
                  onItemClick={({ detail }) => {
                    if (detail.id === 'delete') {
                      setDeleteModalVisible(true);
                    }
                  }}
                >
                  Actions
                </ButtonDropdown>
                <Button variant="primary" href="/iam/policies/create">
                  Create policy
                </Button>
              </SpaceBetween>
            }
          >
            Policies
          </Header>
        }
        columnDefinitions={[
          {
            id: 'policyName',
            header: 'Policy name',
            cell: (item) => <Link href={`/iam/policies/${item.id}`}>{item.policyName}</Link>,
            sortingField: 'policyName',
            width: 250,
          },
          {
            id: 'type',
            header: 'Type',
            cell: (item) => (
              <Badge color={policyTypeColors[item.type]}>{policyTypeLabels[item.type]}</Badge>
            ),
            width: 140,
          },
          {
            id: 'description',
            header: 'Description',
            cell: (item) => item.description || <Box color="text-status-inactive">-</Box>,
            width: 300,
          },
          {
            id: 'attachmentCount',
            header: 'Entities attached',
            cell: (item) => item.attachmentCount,
            width: 130,
          },
          {
            id: 'versions',
            header: 'Versions',
            cell: (item) => (
              <Box>
                {item.versions.length} (default: {item.defaultVersionId})
              </Box>
            ),
            width: 140,
          },
          {
            id: 'updatedAt',
            header: 'Last modified',
            cell: (item) => formatRelativeTime(item.updatedAt),
            sortingField: 'updatedAt',
            width: 130,
          },
        ]}
        items={paginatedPolicies}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="id"
        empty={
          <Box textAlign="center" color="inherit">
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No policies found
            </Box>
            <Button href="/iam/policies/create">Create policy</Button>
          </Box>
        }
        filter={
          <SpaceBetween direction="horizontal" size="xs">
            <TextFilter
              filteringText={filteringText}
              filteringPlaceholder="Find policies"
              onChange={({ detail }) => setFilteringText(detail.filteringText)}
            />
            <Select
              selectedOption={policyTypeFilter}
              onChange={({ detail }) =>
                setPolicyTypeFilter(detail.selectedOption as { value: string; label: string } | null)
              }
              options={[
                { value: 'AWS managed', label: 'AWS Managed' },
                { value: 'Customer managed', label: 'Customer Managed' },
              ]}
              placeholder="Filter by type"
              expandToViewport
            />
          </SpaceBetween>
        }
        pagination={
          <Pagination
            currentPageIndex={currentPage}
            pagesCount={Math.ceil(filteredPolicies.length / pageSize)}
            onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
          />
        }
      />

      {/* Policy Details Panel */}
      {selectedItems.length === 1 && (
        <PolicyDetailsPanel
          policy={selectedItems[0]}
          getUserName={getUserName}
          getGroupName={getGroupName}
          getRoleName={getRoleName}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        header="Delete policies"
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
            Are you sure you want to delete the following polic{selectedItems.length > 1 ? 'ies' : 'y'}?
          </Box>
          <Box>
            {selectedItems.map((policy) => (
              <Box key={policy.id} fontWeight="bold">
                {policy.policyName}
              </Box>
            ))}
          </Box>
          <Box color="text-status-warning">
            This action cannot be undone. Any entities attached to{' '}
            {selectedItems.length > 1 ? 'these policies' : 'this policy'} will lose the associated
            permissions.
          </Box>
        </SpaceBetween>
      </Modal>
    </SpaceBetween>
  );
}

interface PolicyDetailsPanelProps {
  policy: IAMPolicy;
  getUserName: (id: string) => string;
  getGroupName: (id: string) => string;
  getRoleName: (id: string) => string;
}

function PolicyDetailsPanel({ policy, getUserName, getGroupName, getRoleName }: PolicyDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('permissions');
  const [selectedVersion, setSelectedVersion] = useState(policy.defaultVersionId);

  const currentVersion = policy.versions.find((v) => v.versionId === selectedVersion);

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {policy.type === 'Customer managed' && <Button>Edit policy</Button>}
              <Button>Attach entities</Button>
            </SpaceBetween>
          }
        >
          {policy.policyName}
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
                <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                  <Box variant="awsui-key-label">Policy version:</Box>
                  <Select
                    selectedOption={{ value: selectedVersion, label: selectedVersion }}
                    onChange={({ detail }) => setSelectedVersion(detail.selectedOption.value || policy.defaultVersionId)}
                    options={policy.versions.map((v) => ({
                      value: v.versionId,
                      label: `${v.versionId}${v.isDefaultVersion ? ' (default)' : ''}`,
                    }))}
                  />
                </SpaceBetween>

                <ExpandableSection headerText="Policy document" defaultExpanded>
                  {currentVersion && (
                    <CodeEditor
                      ace={undefined}
                      value={JSON.stringify(currentVersion.document, null, 2)}
                      language="json"
                      preferences={{}}
                      onPreferencesChange={() => {}}
                      loading={false}
                      themes={{
                        light: ['dawn'],
                        dark: ['tomorrow_night_bright'],
                      }}
                      editorContentHeight={300}
                    />
                  )}
                </ExpandableSection>

                <Box variant="small" color="text-body-secondary">
                  Version created: {currentVersion && formatDateTime(currentVersion.createdAt)}
                </Box>
              </SpaceBetween>
            ),
          },
          {
            id: 'entities',
            label: 'Entities attached',
            content: (
              <SpaceBetween size="l">
                <ExpandableSection
                  headerText={`Users (${policy.attachedUsers.length})`}
                  defaultExpanded={policy.attachedUsers.length > 0}
                >
                  {policy.attachedUsers.length === 0 ? (
                    <Box color="text-status-inactive">No users attached</Box>
                  ) : (
                    <Table
                      columnDefinitions={[
                        {
                          id: 'userName',
                          header: 'User name',
                          cell: (userId) => (
                            <Link href={`/iam/users/${userId}`}>{getUserName(userId)}</Link>
                          ),
                        },
                      ]}
                      items={policy.attachedUsers}
                      variant="embedded"
                    />
                  )}
                </ExpandableSection>

                <ExpandableSection
                  headerText={`Groups (${policy.attachedGroups.length})`}
                  defaultExpanded={policy.attachedGroups.length > 0}
                >
                  {policy.attachedGroups.length === 0 ? (
                    <Box color="text-status-inactive">No groups attached</Box>
                  ) : (
                    <Table
                      columnDefinitions={[
                        {
                          id: 'groupName',
                          header: 'Group name',
                          cell: (groupId) => (
                            <Link href={`/iam/groups/${groupId}`}>{getGroupName(groupId)}</Link>
                          ),
                        },
                      ]}
                      items={policy.attachedGroups}
                      variant="embedded"
                    />
                  )}
                </ExpandableSection>

                <ExpandableSection
                  headerText={`Roles (${policy.attachedRoles.length})`}
                  defaultExpanded={policy.attachedRoles.length > 0}
                >
                  {policy.attachedRoles.length === 0 ? (
                    <Box color="text-status-inactive">No roles attached</Box>
                  ) : (
                    <Table
                      columnDefinitions={[
                        {
                          id: 'roleName',
                          header: 'Role name',
                          cell: (roleId) => (
                            <Link href={`/iam/roles/${roleId}`}>{getRoleName(roleId)}</Link>
                          ),
                        },
                      ]}
                      items={policy.attachedRoles}
                      variant="embedded"
                    />
                  )}
                </ExpandableSection>
              </SpaceBetween>
            ),
          },
          {
            id: 'versions',
            label: 'Policy versions',
            content: (
              <SpaceBetween size="m">
                <Box>
                  <Header variant="h3" counter={`(${policy.versions.length})`}>
                    Versions
                  </Header>
                </Box>
                <Table
                  columnDefinitions={[
                    {
                      id: 'versionId',
                      header: 'Version ID',
                      cell: (version) => (
                        <SpaceBetween direction="horizontal" size="xs">
                          <Box>{version.versionId}</Box>
                          {version.isDefaultVersion && <Badge color="blue">Default</Badge>}
                        </SpaceBetween>
                      ),
                    },
                    {
                      id: 'createdAt',
                      header: 'Created',
                      cell: (version) => formatDateTime(version.createdAt),
                    },
                  ]}
                  items={policy.versions}
                  variant="embedded"
                />
              </SpaceBetween>
            ),
          },
          {
            id: 'tags',
            label: 'Tags',
            content: (
              <SpaceBetween size="m">
                <Box>
                  <Header variant="h3" counter={`(${Object.keys(policy.tags).length})`}>
                    Tags
                  </Header>
                </Box>
                {Object.keys(policy.tags).length === 0 ? (
                  <Box color="text-status-inactive">No tags</Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      { id: 'key', header: 'Key', cell: ([key]) => key },
                      { id: 'value', header: 'Value', cell: ([, value]) => value },
                    ]}
                    items={Object.entries(policy.tags)}
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
                    <Box variant="awsui-key-label">Policy name</Box>
                    <Box>{policy.policyName}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">ARN</Box>
                    <CopyToClipboard
                      copyText={policy.arn}
                      copySuccessText="Copied"
                      copyErrorText="Failed to copy"
                      textToCopy={policy.arn}
                    />
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Path</Box>
                    <Box>{policy.path}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Description</Box>
                    <Box>{policy.description || '-'}</Box>
                  </Box>
                </SpaceBetween>
                <SpaceBetween size="l">
                  <Box>
                    <Box variant="awsui-key-label">Type</Box>
                    <Badge color={policyTypeColors[policy.type]}>{policyTypeLabels[policy.type]}</Badge>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Default version</Box>
                    <Box>{policy.defaultVersionId}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Attachment count</Box>
                    <Box>{policy.attachmentCount}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Created</Box>
                    <Box>{formatDateTime(policy.createdAt)}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Last modified</Box>
                    <Box>{formatDateTime(policy.updatedAt)}</Box>
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
