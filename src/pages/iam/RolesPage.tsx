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
import 'ace-builds/css/ace.css';
import 'ace-builds/css/theme/dawn.css';
import { iamRoles, iamPolicies } from '@/data/mockData';
import { IAMRole, IAMRoleTrustEntityType } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const trustEntityLabels: Record<IAMRoleTrustEntityType, string> = {
  'AWS service': 'AWS Service',
  'AWS account': 'AWS Account',
  'Web identity': 'Web Identity',
  'SAML 2.0 federation': 'SAML 2.0 Federation',
  'Custom trust policy': 'Custom Trust Policy',
};

export function RolesPage() {
  const [selectedItems, setSelectedItems] = useState<IAMRole[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const pageSize = 10;

  const filteredRoles = iamRoles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(filteringText.toLowerCase()) ||
      role.arn.toLowerCase().includes(filteringText.toLowerCase()) ||
      role.description?.toLowerCase().includes(filteringText.toLowerCase())
  );

  const paginatedRoles = filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPolicyName = (policyArn: string) => {
    const policy = iamPolicies.find((p) => p.arn === policyArn);
    return policy?.policyName || policyArn.split('/').pop() || policyArn;
  };

  const handleDelete = () => {
    console.log('Deleting roles:', selectedItems.map((r) => r.roleName));
    setDeleteModalVisible(false);
    setSelectedItems([]);
  };

  return (
    <SpaceBetween size="l">
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredRoles.length})`}
            description="IAM roles are a secure way to grant permissions to entities that you trust."
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <ButtonDropdown
                  items={[
                    { id: 'delete', text: 'Delete', disabled: selectedItems.length === 0 },
                    { id: 'attach-policy', text: 'Attach policy', disabled: selectedItems.length === 0 },
                    { id: 'edit-trust', text: 'Edit trust relationship', disabled: selectedItems.length !== 1 },
                  ]}
                  onItemClick={({ detail }) => {
                    if (detail.id === 'delete') {
                      setDeleteModalVisible(true);
                    }
                  }}
                >
                  Actions
                </ButtonDropdown>
                <Button variant="primary" href="/iam/roles/create">
                  Create role
                </Button>
              </SpaceBetween>
            }
          >
            Roles
          </Header>
        }
        columnDefinitions={[
          {
            id: 'roleName',
            header: 'Role name',
            cell: (item) => <Link href={`/iam/roles/${item.id}`}>{item.roleName}</Link>,
            sortingField: 'roleName',
            width: 220,
          },
          {
            id: 'trustEntityType',
            header: 'Trusted entities',
            cell: (item) => (
              <SpaceBetween size="xs">
                <Badge color={item.trustEntityType === 'AWS service' ? 'blue' : 'grey'}>
                  {trustEntityLabels[item.trustEntityType]}
                </Badge>
                <Box variant="small" color="text-body-secondary">
                  {item.trustedEntities.slice(0, 2).join(', ')}
                  {item.trustedEntities.length > 2 && ` +${item.trustedEntities.length - 2} more`}
                </Box>
              </SpaceBetween>
            ),
            width: 200,
          },
          {
            id: 'description',
            header: 'Description',
            cell: (item) => item.description || <Box color="text-status-inactive">-</Box>,
            width: 250,
          },
          {
            id: 'policies',
            header: 'Attached policies',
            cell: (item) => (
              <Box>
                {item.attachedPolicies.length} attached, {item.inlinePolicies.length} inline
              </Box>
            ),
            width: 140,
          },
          {
            id: 'lastUsed',
            header: 'Last activity',
            cell: (item) =>
              item.lastUsedAt ? (
                <Box>
                  {formatRelativeTime(item.lastUsedAt)}
                  {item.lastUsedRegion && (
                    <Box variant="small" color="text-body-secondary">
                      in {item.lastUsedRegion}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box color="text-status-inactive">Never</Box>
              ),
            width: 140,
          },
          {
            id: 'maxSession',
            header: 'Max session',
            cell: (item) => `${item.maxSessionDuration / 3600}h`,
            width: 100,
          },
          {
            id: 'createdAt',
            header: 'Created',
            cell: (item) => formatRelativeTime(item.createdAt),
            sortingField: 'createdAt',
            width: 130,
          },
        ]}
        items={paginatedRoles}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="id"
        empty={
          <Box textAlign="center" color="inherit">
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No roles found
            </Box>
            <Button href="/iam/roles/create">Create role</Button>
          </Box>
        }
        filter={
          <TextFilter
            filteringText={filteringText}
            filteringPlaceholder="Find roles"
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
          />
        }
        pagination={
          <Pagination
            currentPageIndex={currentPage}
            pagesCount={Math.ceil(filteredRoles.length / pageSize)}
            onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
          />
        }
      />

      {/* Role Details Panel */}
      {selectedItems.length === 1 && (
        <RoleDetailsPanel role={selectedItems[0]} getPolicyName={getPolicyName} />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        header="Delete roles"
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
            Are you sure you want to delete the following role{selectedItems.length > 1 ? 's' : ''}?
          </Box>
          <Box>
            {selectedItems.map((role) => (
              <Box key={role.id} fontWeight="bold">
                {role.roleName}
              </Box>
            ))}
          </Box>
          <Box color="text-status-warning">
            This action cannot be undone. Any services or users that have assumed{' '}
            {selectedItems.length > 1 ? 'these roles' : 'this role'} will lose access.
          </Box>
        </SpaceBetween>
      </Modal>
    </SpaceBetween>
  );
}

interface RoleDetailsPanelProps {
  role: IAMRole;
  getPolicyName: (arn: string) => string;
}

function RoleDetailsPanel({ role, getPolicyName }: RoleDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('permissions');

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Edit</Button>
              <Button>Attach policies</Button>
            </SpaceBetween>
          }
        >
          {role.roleName}
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
                <ExpandableSection headerText="Attached policies" defaultExpanded>
                  {role.attachedPolicies.length === 0 ? (
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
                      items={role.attachedPolicies}
                      variant="embedded"
                    />
                  )}
                </ExpandableSection>

                <ExpandableSection headerText="Inline policies">
                  {role.inlinePolicies.length === 0 ? (
                    <Box color="text-status-inactive">No inline policies</Box>
                  ) : (
                    <SpaceBetween size="xs">
                      {role.inlinePolicies.map((policy) => (
                        <Box key={policy}>{policy}</Box>
                      ))}
                    </SpaceBetween>
                  )}
                </ExpandableSection>

                {role.permissionsBoundary && (
                  <ExpandableSection headerText="Permissions boundary">
                    <Link href={`/iam/policies/${encodeURIComponent(role.permissionsBoundary)}`}>
                      {getPolicyName(role.permissionsBoundary)}
                    </Link>
                  </ExpandableSection>
                )}
              </SpaceBetween>
            ),
          },
          {
            id: 'trust',
            label: 'Trust relationships',
            content: (
              <SpaceBetween size="l">
                <Box>
                  <Box variant="awsui-key-label">Trusted entity type</Box>
                  <Badge color="blue">{trustEntityLabels[role.trustEntityType]}</Badge>
                </Box>

                <Box>
                  <Box variant="awsui-key-label">Trusted entities</Box>
                  <SpaceBetween size="xs">
                    {role.trustedEntities.map((entity) => (
                      <Box key={entity}>{entity}</Box>
                    ))}
                  </SpaceBetween>
                </Box>

                <ExpandableSection headerText="Trust policy document" defaultExpanded>
                  <CodeEditor
                    ace={undefined}
                    value={JSON.stringify(role.trustPolicy, null, 2)}
                    language="json"
                    preferences={{}}
                    onPreferencesChange={() => {}}
                    loading={false}
                    themes={{
                      light: ['dawn'],
                      dark: ['tomorrow_night_bright'],
                    }}
                    editorContentHeight={200}
                  />
                </ExpandableSection>
              </SpaceBetween>
            ),
          },
          {
            id: 'tags',
            label: 'Tags',
            content: (
              <SpaceBetween size="m">
                <Box>
                  <Header variant="h3" counter={`(${Object.keys(role.tags).length})`}>
                    Tags
                  </Header>
                </Box>
                {Object.keys(role.tags).length === 0 ? (
                  <Box color="text-status-inactive">No tags</Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      { id: 'key', header: 'Key', cell: ([key]) => key },
                      { id: 'value', header: 'Value', cell: ([, value]) => value },
                    ]}
                    items={Object.entries(role.tags)}
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
                    <Box variant="awsui-key-label">Role name</Box>
                    <Box>{role.roleName}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">ARN</Box>
                    <CopyToClipboard
                      copyText={role.arn}
                      copySuccessText="Copied"
                      copyErrorText="Failed to copy"
                      textToCopy={role.arn}
                    />
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Path</Box>
                    <Box>{role.path}</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Description</Box>
                    <Box>{role.description || '-'}</Box>
                  </Box>
                </SpaceBetween>
                <SpaceBetween size="l">
                  <Box>
                    <Box variant="awsui-key-label">Max session duration</Box>
                    <Box>{role.maxSessionDuration / 3600} hours</Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Last used</Box>
                    <Box>
                      {role.lastUsedAt
                        ? `${formatDateTime(role.lastUsedAt)} in ${role.lastUsedRegion}`
                        : 'Never'}
                    </Box>
                  </Box>
                  <Box>
                    <Box variant="awsui-key-label">Created</Box>
                    <Box>{formatDateTime(role.createdAt)}</Box>
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
