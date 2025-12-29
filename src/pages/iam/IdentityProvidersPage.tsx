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
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import { iamIdentityProviders, iamRoles } from '@/data/mockData';
import { IAMIdentityProvider, IAMIdentityProviderType } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const providerTypeLabels: Record<IAMIdentityProviderType, string> = {
  SAML: 'SAML',
  OIDC: 'OpenID Connect',
};

const providerTypeColors: Record<IAMIdentityProviderType, 'blue' | 'green'> = {
  SAML: 'blue',
  OIDC: 'green',
};

export function IdentityProvidersPage() {
  const [selectedItems, setSelectedItems] = useState<IAMIdentityProvider[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const pageSize = 10;

  const filteredProviders = iamIdentityProviders.filter(
    (provider) =>
      provider.name.toLowerCase().includes(filteringText.toLowerCase()) ||
      provider.arn.toLowerCase().includes(filteringText.toLowerCase())
  );

  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = () => {
    console.log(
      'Deleting identity providers:',
      selectedItems.map((p) => p.name)
    );
    setDeleteModalVisible(false);
    setSelectedItems([]);
  };

  return (
    <SpaceBetween size="l">
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredProviders.length})`}
            description="Identity providers allow users to authenticate using external identity systems like SAML 2.0 or OpenID Connect."
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <ButtonDropdown
                  items={[
                    { id: 'delete', text: 'Delete', disabled: selectedItems.length === 0 },
                    {
                      id: 'update-thumbprints',
                      text: 'Update thumbprints',
                      disabled: selectedItems.length !== 1 || selectedItems[0]?.type !== 'OIDC',
                    },
                  ]}
                  onItemClick={({ detail }) => {
                    if (detail.id === 'delete') {
                      setDeleteModalVisible(true);
                    }
                  }}
                >
                  Actions
                </ButtonDropdown>
                <Button variant="primary" href="/iam/identity-providers/create">
                  Add provider
                </Button>
              </SpaceBetween>
            }
          >
            Identity Providers
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Provider name',
            cell: (item) => <Link href={`/iam/identity-providers/${item.id}`}>{item.name}</Link>,
            sortingField: 'name',
            width: 250,
          },
          {
            id: 'type',
            header: 'Type',
            cell: (item) => (
              <Badge color={providerTypeColors[item.type]}>{providerTypeLabels[item.type]}</Badge>
            ),
            width: 150,
          },
          {
            id: 'providerUrl',
            header: 'Provider URL / Issuer',
            cell: (item) => (
              <Box>
                {item.type === 'OIDC' ? item.oidcConfig?.issuerUrl : item.samlConfig?.metadataUrl || '-'}
              </Box>
            ),
            width: 300,
          },
          {
            id: 'audiences',
            header: 'Audiences / Client IDs',
            cell: (item) => {
              if (item.type === 'OIDC' && item.oidcConfig?.clientIds) {
                return (
                  <Box>
                    {item.oidcConfig.clientIds.slice(0, 2).join(', ')}
                    {item.oidcConfig.clientIds.length > 2 &&
                      ` +${item.oidcConfig.clientIds.length - 2} more`}
                  </Box>
                );
              }
              return <Box color="text-status-inactive">-</Box>;
            },
            width: 200,
          },
          {
            id: 'createdAt',
            header: 'Created',
            cell: (item) => formatRelativeTime(item.createdAt),
            sortingField: 'createdAt',
            width: 130,
          },
        ]}
        items={paginatedProviders}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="id"
        empty={
          <Box textAlign="center" color="inherit">
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No identity providers found
            </Box>
            <Button href="/iam/identity-providers/create">Add provider</Button>
          </Box>
        }
        filter={
          <TextFilter
            filteringText={filteringText}
            filteringPlaceholder="Find identity providers"
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
          />
        }
        pagination={
          <Pagination
            currentPageIndex={currentPage}
            pagesCount={Math.ceil(filteredProviders.length / pageSize)}
            onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
          />
        }
      />

      {/* Identity Provider Details Panel */}
      {selectedItems.length === 1 && <IdentityProviderDetailsPanel provider={selectedItems[0]} />}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        header="Delete identity providers"
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
            Are you sure you want to delete the following identity provider
            {selectedItems.length > 1 ? 's' : ''}?
          </Box>
          <Box>
            {selectedItems.map((provider) => (
              <Box key={provider.id} fontWeight="bold">
                {provider.name}
              </Box>
            ))}
          </Box>
          <Box color="text-status-warning">
            This action cannot be undone. Users authenticating through{' '}
            {selectedItems.length > 1 ? 'these providers' : 'this provider'} will no longer be able
            to access your account.
          </Box>
        </SpaceBetween>
      </Modal>
    </SpaceBetween>
  );
}

interface IdentityProviderDetailsPanelProps {
  provider: IAMIdentityProvider;
}

function IdentityProviderDetailsPanel({ provider }: IdentityProviderDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('details');

  const associatedRoles = iamRoles.filter(
    (role) =>
      role.trustEntityType === 'SAML 2.0 federation' ||
      role.trustEntityType === 'Web identity'
  );

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {provider.type === 'OIDC' && <Button>Update thumbprints</Button>}
              {provider.type === 'SAML' && <Button>Update metadata</Button>}
            </SpaceBetween>
          }
        >
          {provider.name}
        </Header>
      }
    >
      <Tabs
        activeTabId={activeTab}
        onChange={({ detail }) => setActiveTab(detail.activeTabId)}
        tabs={[
          {
            id: 'details',
            label: 'Details',
            content: (
              <SpaceBetween size="l">
                <ColumnLayout columns={2} variant="text-grid">
                  <SpaceBetween size="l">
                    <Box>
                      <Box variant="awsui-key-label">Provider name</Box>
                      <Box>{provider.name}</Box>
                    </Box>
                    <Box>
                      <Box variant="awsui-key-label">ARN</Box>
                      <CopyToClipboard
                        copyText={provider.arn}
                        copySuccessText="Copied"
                        copyErrorText="Failed to copy"
                        textToCopy={provider.arn}
                      />
                    </Box>
                    <Box>
                      <Box variant="awsui-key-label">Type</Box>
                      <Badge color={providerTypeColors[provider.type]}>
                        {providerTypeLabels[provider.type]}
                      </Badge>
                    </Box>
                  </SpaceBetween>
                  <SpaceBetween size="l">
                    <Box>
                      <Box variant="awsui-key-label">Created</Box>
                      <Box>{formatDateTime(provider.createdAt)}</Box>
                    </Box>
                    {provider.updatedAt && (
                      <Box>
                        <Box variant="awsui-key-label">Last updated</Box>
                        <Box>{formatDateTime(provider.updatedAt)}</Box>
                      </Box>
                    )}
                  </SpaceBetween>
                </ColumnLayout>

                {/* SAML Configuration */}
                {provider.type === 'SAML' && provider.samlConfig && (
                  <ExpandableSection headerText="SAML Configuration" defaultExpanded>
                    <ColumnLayout columns={1}>
                      <Box>
                        <Box variant="awsui-key-label">Metadata URL</Box>
                        <Box>{provider.samlConfig.metadataUrl || '-'}</Box>
                      </Box>
                      <Box>
                        <Box variant="awsui-key-label">Metadata document</Box>
                        <Box variant="small" color="text-body-secondary">
                          {provider.samlConfig.metadataDocument
                            ? 'Metadata document uploaded'
                            : 'No metadata document'}
                        </Box>
                      </Box>
                      <Box>
                        <Box variant="awsui-key-label">Valid until</Box>
                        <Box>
                          {provider.samlConfig.validUntil
                            ? formatDateTime(provider.samlConfig.validUntil)
                            : '-'}
                        </Box>
                      </Box>
                    </ColumnLayout>
                  </ExpandableSection>
                )}

                {/* OIDC Configuration */}
                {provider.type === 'OIDC' && provider.oidcConfig && (
                  <ExpandableSection headerText="OIDC Configuration" defaultExpanded>
                    <SpaceBetween size="m">
                      <Box>
                        <Box variant="awsui-key-label">Issuer URL</Box>
                        <CopyToClipboard
                          copyText={provider.oidcConfig.issuerUrl}
                          copySuccessText="Copied"
                          copyErrorText="Failed to copy"
                          textToCopy={provider.oidcConfig.issuerUrl}
                        />
                      </Box>
                      <Box>
                        <Box variant="awsui-key-label">Client IDs / Audiences</Box>
                        <SpaceBetween size="xs">
                          {provider.oidcConfig.clientIds.map((clientId) => (
                            <Badge key={clientId}>{clientId}</Badge>
                          ))}
                        </SpaceBetween>
                      </Box>
                      <Box>
                        <Box variant="awsui-key-label">Thumbprints</Box>
                        <SpaceBetween size="xs">
                          {provider.oidcConfig.thumbprints.map((thumbprint) => (
                            <CopyToClipboard
                              key={thumbprint}
                              copyText={thumbprint}
                              copySuccessText="Copied"
                              copyErrorText="Failed to copy"
                              textToCopy={thumbprint}
                            />
                          ))}
                        </SpaceBetween>
                      </Box>
                    </SpaceBetween>
                  </ExpandableSection>
                )}
              </SpaceBetween>
            ),
          },
          {
            id: 'roles',
            label: 'Associated roles',
            content: (
              <SpaceBetween size="m">
                <Box>
                  <Header
                    variant="h3"
                    counter={`(${associatedRoles.length})`}
                    description="Roles that trust this identity provider"
                  >
                    Associated Roles
                  </Header>
                </Box>
                {associatedRoles.length === 0 ? (
                  <Box color="text-status-inactive">
                    No roles are configured to trust this identity provider
                  </Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      {
                        id: 'roleName',
                        header: 'Role name',
                        cell: (role) => <Link href={`/iam/roles/${role.id}`}>{role.roleName}</Link>,
                      },
                      {
                        id: 'trustType',
                        header: 'Trust type',
                        cell: (role) => role.trustEntityType,
                      },
                      {
                        id: 'description',
                        header: 'Description',
                        cell: (role) => role.description || '-',
                      },
                    ]}
                    items={associatedRoles}
                    variant="embedded"
                  />
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
                  <Header variant="h3" counter={`(${Object.keys(provider.tags).length})`}>
                    Tags
                  </Header>
                </Box>
                {Object.keys(provider.tags).length === 0 ? (
                  <Box color="text-status-inactive">No tags</Box>
                ) : (
                  <Table
                    columnDefinitions={[
                      { id: 'key', header: 'Key', cell: ([key]) => key },
                      { id: 'value', header: 'Value', cell: ([, value]) => value },
                    ]}
                    items={Object.entries(provider.tags)}
                    variant="embedded"
                  />
                )}
              </SpaceBetween>
            ),
          },
        ]}
      />
    </Container>
  );
}
