import { useState, useMemo } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Link from '@cloudscape-design/components/link';
import Modal from '@cloudscape-design/components/modal';
import Pagination from '@cloudscape-design/components/pagination';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import TokenGroup from '@cloudscape-design/components/token-group';
import { EmptyState } from '@/components/common';
import { logGroups } from '@/data/mockData';
import { formatDateTime, formatBytes } from '@/utils/formatters';
import { PAGE_SIZE } from '@/constants';
import type { LogGroup } from '@/types';

const retentionOptions = [
  { label: 'Never expire', value: 'never' },
  { label: '1 day', value: '1' },
  { label: '3 days', value: '3' },
  { label: '5 days', value: '5' },
  { label: '1 week', value: '7' },
  { label: '2 weeks', value: '14' },
  { label: '1 month', value: '30' },
  { label: '2 months', value: '60' },
  { label: '3 months', value: '90' },
  { label: '6 months', value: '180' },
  { label: '1 year', value: '365' },
];

export function LogGroupsPage() {
  const [selectedItems, setSelectedItems] = useState<LogGroup[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [logGroupName, setLogGroupName] = useState('');
  const [retention, setRetention] = useState({ label: '1 month', value: '30' });

  const filteredItems = useMemo(() => {
    if (!filterText) return logGroups;
    const lowerFilter = filterText.toLowerCase();
    return logGroups.filter((item) => item.name.toLowerCase().includes(lowerFilter));
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const totalStoredBytes = useMemo(() => {
    return logGroups.reduce((acc, lg) => acc + lg.storedBytes, 0);
  }, []);

  const handleCreateLogGroup = () => {
    console.log('Create log group:', { logGroupName, retention: retention.value });
    setShowCreateModal(false);
    setLogGroupName('');
    setRetention({ label: '1 month', value: '30' });
  };

  return (
    <>
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredItems.length})`}
            description={`Total stored: ${formatBytes(totalStoredBytes)}`}
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <ButtonDropdown
                  items={[
                    { id: 'view-streams', text: 'View log streams' },
                    { id: 'view-insights', text: 'View in Logs Insights' },
                    { id: 'edit-retention', text: 'Edit retention' },
                    { id: 'delete', text: 'Delete' },
                  ]}
                  disabled={selectedItems.length !== 1}
                >
                  Actions
                </ButtonDropdown>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create log group
                </Button>
              </SpaceBetween>
            }
          >
            Log Groups
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Log group name',
            cell: (item) => (
              <Link href={`/monitoring/logs/${encodeURIComponent(item.name)}`}>
                {item.name}
              </Link>
            ),
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'retention',
            header: 'Retention',
            cell: (item) =>
              item.retentionInDays === 'Never Expire'
                ? 'Never expire'
                : `${item.retentionInDays} days`,
            sortingField: 'retentionInDays',
          },
          {
            id: 'storedBytes',
            header: 'Stored bytes',
            cell: (item) => formatBytes(item.storedBytes),
            sortingField: 'storedBytes',
          },
          {
            id: 'logStreams',
            header: 'Log streams',
            cell: (item) => item.logStreamCount,
            sortingField: 'logStreamCount',
          },
          {
            id: 'metricFilters',
            header: 'Metric filters',
            cell: (item) => item.metricFilterCount,
            sortingField: 'metricFilterCount',
          },
          {
            id: 'tags',
            header: 'Tags',
            cell: (item) => {
              const tagEntries = Object.entries(item.tags);
              if (tagEntries.length === 0) return '-';
              return (
                <TokenGroup
                  items={tagEntries.slice(0, 3).map(([key, value]) => ({
                    label: `${key}: ${value}`,
                  }))}
                  limit={2}
                  readOnly
                />
              );
            },
          },
          {
            id: 'created',
            header: 'Created',
            cell: (item) => formatDateTime(item.createdAt),
            sortingField: 'createdAt',
          },
        ]}
        items={paginatedItems}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="name"
        filter={
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder="Find log groups"
            filteringAriaLabel="Filter log groups"
            onChange={({ detail }) => {
              setFilterText(detail.filteringText);
              setCurrentPage(1);
            }}
          />
        }
        pagination={
          <Pagination
            currentPageIndex={currentPage}
            pagesCount={Math.ceil(filteredItems.length / PAGE_SIZE)}
            onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
          />
        }
        empty={
          <EmptyState
            title="No log groups"
            description="No log groups found. Create your first log group to start collecting logs."
            actionLabel="Create log group"
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      {/* Create Log Group Modal */}
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        size="medium"
        header="Create log group"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateLogGroup} disabled={!logGroupName.trim()}>
                Create
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField
              label="Log group name"
              description="Use a hierarchical naming convention, e.g., /aws/lambda/my-function"
            >
              <Input
                value={logGroupName}
                onChange={({ detail }) => setLogGroupName(detail.value)}
                placeholder="/aws/lambda/my-function"
              />
            </FormField>

            <FormField
              label="Retention setting"
              description="Logs older than this will be automatically deleted"
            >
              <Select
                selectedOption={retention}
                onChange={({ detail }) => setRetention(detail.selectedOption as typeof retention)}
                options={retentionOptions}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}
