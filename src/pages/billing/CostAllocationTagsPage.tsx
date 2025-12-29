import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import TextFilter from '@cloudscape-design/components/text-filter';
import TokenGroup from '@cloudscape-design/components/token-group';
import Alert from '@cloudscape-design/components/alert';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import { costAllocationTags } from '@/data/mockData';
import type { CostAllocationTag } from '@/types';
import { formatDate } from '@/utils/formatters';

export function CostAllocationTagsPage() {
  const [selectedTags, setSelectedTags] = useState<CostAllocationTag[]>([]);
  const [filterText, setFilterText] = useState('');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagKey, setNewTagKey] = useState('');

  const userDefinedTags = costAllocationTags.filter((tag) => tag.type === 'user_defined');
  const awsGeneratedTags = costAllocationTags.filter((tag) => tag.type === 'aws_generated');

  const activeTags = costAllocationTags.filter((tag) => tag.status === 'active');
  const inactiveTags = costAllocationTags.filter((tag) => tag.status === 'inactive');

  const filteredUserTags = userDefinedTags.filter((tag) =>
    tag.key.toLowerCase().includes(filterText.toLowerCase())
  );

  const filteredAwsTags = awsGeneratedTags.filter((tag) =>
    tag.key.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleActivateTags = () => {
    setShowActivateModal(false);
    setSelectedTags([]);
  };

  const handleCreateTag = () => {
    setShowCreateModal(false);
    setNewTagKey('');
  };

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Manage cost allocation tags to organize and track your cloud spending by project, team, or any custom dimension"
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button
              disabled={selectedTags.length === 0}
              onClick={() => setShowActivateModal(true)}
            >
              {selectedTags.some((t) => t.status === 'inactive') ? 'Activate' : 'Deactivate'}
            </Button>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create tag key
            </Button>
          </SpaceBetween>
        }
      >
        Cost Allocation Tags
      </Header>

      <Alert type="info" header="About Cost Allocation Tags">
        Cost allocation tags let you organize your resources and track costs on a detailed level.
        After you activate a tag key, it takes up to 24 hours for the tag to appear in the Cost Explorer.
        Tag values must be applied to resources for them to appear in cost reports.
      </Alert>

      {/* Summary */}
      <SpaceBetween size="xs" direction="horizontal">
        <Box>
          <StatusIndicator type="success">
            {activeTags.length} active tag keys
          </StatusIndicator>
        </Box>
        <Box>
          <StatusIndicator type="stopped">
            {inactiveTags.length} inactive tag keys
          </StatusIndicator>
        </Box>
      </SpaceBetween>

      {/* Filter */}
      <TextFilter
        filteringText={filterText}
        filteringPlaceholder="Search tag keys"
        onChange={({ detail }) => setFilterText(detail.filteringText)}
      />

      {/* Tabs for User-defined and AWS-generated tags */}
      <Tabs
        tabs={[
          {
            id: 'user-defined',
            label: `User-Defined Tags (${userDefinedTags.length})`,
            content: (
              <Table
                columnDefinitions={[
                  {
                    id: 'key',
                    header: 'Tag Key',
                    cell: (item) => <Box fontWeight="bold">{item.key}</Box>,
                    sortingField: 'key',
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (item) =>
                      item.status === 'active' ? (
                        <StatusIndicator type="success">Active</StatusIndicator>
                      ) : (
                        <StatusIndicator type="stopped">Inactive</StatusIndicator>
                      ),
                    sortingField: 'status',
                  },
                  {
                    id: 'values',
                    header: 'Tag Values',
                    cell: (item) =>
                      item.values.length > 0 ? (
                        <TokenGroup
                          items={item.values.slice(0, 5).map((v) => ({ label: v }))}
                          limit={3}
                          readOnly
                        />
                      ) : (
                        <Box color="text-status-inactive">No values</Box>
                      ),
                  },
                  {
                    id: 'lastUpdated',
                    header: 'Last Updated',
                    cell: (item) => formatDate(item.lastUpdatedAt),
                    sortingField: 'lastUpdatedAt',
                  },
                  {
                    id: 'actions',
                    header: 'Actions',
                    cell: (item) => (
                      <SpaceBetween size="xs" direction="horizontal">
                        <Button variant="link">
                          {item.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="link">View resources</Button>
                      </SpaceBetween>
                    ),
                  },
                ]}
                items={filteredUserTags}
                selectionType="multi"
                selectedItems={selectedTags.filter((t) => t.type === 'user_defined')}
                onSelectionChange={({ detail }) =>
                  setSelectedTags(detail.selectedItems)
                }
                header={
                  <Header
                    counter={`(${filteredUserTags.length})`}
                    description="Tags you've created to organize your resources"
                  >
                    User-Defined Cost Allocation Tags
                  </Header>
                }
                empty={
                  <Box textAlign="center" color="inherit">
                    <b>No user-defined tags</b>
                    <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                      Create tag keys to start organizing your resources.
                    </Box>
                    <Button onClick={() => setShowCreateModal(true)}>Create tag key</Button>
                  </Box>
                }
              />
            ),
          },
          {
            id: 'aws-generated',
            label: `AWS-Generated Tags (${awsGeneratedTags.length})`,
            content: (
              <Table
                columnDefinitions={[
                  {
                    id: 'key',
                    header: 'Tag Key',
                    cell: (item) => <Box fontWeight="bold">{item.key}</Box>,
                    sortingField: 'key',
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (item) =>
                      item.status === 'active' ? (
                        <StatusIndicator type="success">Active</StatusIndicator>
                      ) : (
                        <StatusIndicator type="stopped">Inactive</StatusIndicator>
                      ),
                    sortingField: 'status',
                  },
                  {
                    id: 'description',
                    header: 'Description',
                    cell: (item) => {
                      const descriptions: Record<string, string> = {
                        'aws:createdBy': 'The principal that created the resource',
                        'aws:cloudformation:stack-name': 'The CloudFormation stack name',
                        'aws:cloudformation:stack-id': 'The CloudFormation stack ID',
                        'aws:cloudformation:logical-id': 'The logical ID of the resource',
                      };
                      return descriptions[item.key] || 'AWS-generated tag';
                    },
                  },
                  {
                    id: 'lastUpdated',
                    header: 'Last Updated',
                    cell: (item) => formatDate(item.lastUpdatedAt),
                    sortingField: 'lastUpdatedAt',
                  },
                  {
                    id: 'actions',
                    header: 'Actions',
                    cell: (item) => (
                      <Button variant="link">
                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    ),
                  },
                ]}
                items={filteredAwsTags}
                selectionType="multi"
                selectedItems={selectedTags.filter((t) => t.type === 'aws_generated')}
                onSelectionChange={({ detail }) =>
                  setSelectedTags(detail.selectedItems)
                }
                header={
                  <Header
                    counter={`(${filteredAwsTags.length})`}
                    description="Tags automatically created by AWS services"
                  >
                    AWS-Generated Cost Allocation Tags
                  </Header>
                }
                empty={
                  <Box textAlign="center" color="inherit">
                    <b>No AWS-generated tags</b>
                    <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                      AWS-generated tags will appear as you use AWS services.
                    </Box>
                  </Box>
                }
              />
            ),
          },
        ]}
      />

      {/* Activate/Deactivate Modal */}
      <Modal
        visible={showActivateModal}
        onDismiss={() => setShowActivateModal(false)}
        size="medium"
        header={
          selectedTags.some((t) => t.status === 'inactive')
            ? 'Activate Cost Allocation Tags'
            : 'Deactivate Cost Allocation Tags'
        }
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowActivateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleActivateTags}>
                {selectedTags.some((t) => t.status === 'inactive') ? 'Activate' : 'Deactivate'}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box>
            {selectedTags.some((t) => t.status === 'inactive')
              ? 'Are you sure you want to activate the following tag keys? Once activated, they will appear in your cost reports within 24 hours.'
              : 'Are you sure you want to deactivate the following tag keys? They will no longer appear in new cost reports.'}
          </Box>
          <TokenGroup
            items={selectedTags.map((t) => ({ label: t.key }))}
            readOnly
          />
        </SpaceBetween>
      </Modal>

      {/* Create Tag Modal */}
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        size="medium"
        header="Create Cost Allocation Tag Key"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTag}
                disabled={!newTagKey.trim()}
              >
                Create tag key
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Alert type="info">
            Creating a tag key here registers it for cost allocation. You'll still need to apply
            this tag with values to your resources for it to appear in cost reports.
          </Alert>
          <FormField
            label="Tag key name"
            description="Use a descriptive name like 'Environment', 'Project', or 'CostCenter'"
            constraintText="Tag keys are case-sensitive and must be unique"
          >
            <Input
              value={newTagKey}
              onChange={({ detail }) => setNewTagKey(detail.value)}
              placeholder="e.g., Environment"
            />
          </FormField>
        </SpaceBetween>
      </Modal>
    </SpaceBetween>
  );
}
