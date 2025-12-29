import { useState, useMemo } from 'react';
import Badge from '@cloudscape-design/components/badge';
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
import { CanaryStateIndicator, CanaryRunStateIndicator } from '@/components/indicators';
import { EmptyState } from '@/components/common';
import { syntheticCanaries } from '@/data/mockData';
import { formatDateTime } from '@/utils/formatters';
import { PAGE_SIZE } from '@/constants';
import type { SyntheticCanary } from '@/types';

const runtimeOptions = [
  { label: 'syn-nodejs-puppeteer-6.1', value: 'syn-nodejs-puppeteer-6.1' },
  { label: 'syn-nodejs-puppeteer-5.0', value: 'syn-nodejs-puppeteer-5.0' },
  { label: 'syn-python-selenium-2.0', value: 'syn-python-selenium-2.0' },
];

const scheduleOptions = [
  { label: 'Run every 1 minute', value: 'rate(1 minute)' },
  { label: 'Run every 5 minutes', value: 'rate(5 minutes)' },
  { label: 'Run every 10 minutes', value: 'rate(10 minutes)' },
  { label: 'Run every 15 minutes', value: 'rate(15 minutes)' },
  { label: 'Run every 30 minutes', value: 'rate(30 minutes)' },
  { label: 'Run every hour', value: 'rate(1 hour)' },
];

export function SyntheticsPage() {
  const [selectedItems, setSelectedItems] = useState<SyntheticCanary[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [canaryName, setCanaryName] = useState('');
  const [runtime, setRuntime] = useState(runtimeOptions[0]);
  const [schedule, setSchedule] = useState(scheduleOptions[1]);

  const filteredItems = useMemo(() => {
    if (!filterText) return syntheticCanaries;
    const lowerFilter = filterText.toLowerCase();
    return syntheticCanaries.filter((item) =>
      item.name.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const canaryStats = useMemo(() => ({
    total: syntheticCanaries.length,
    running: syntheticCanaries.filter((c) => c.status === 'RUNNING').length,
    passed: syntheticCanaries.filter((c) => c.lastRunStatus === 'PASSED').length,
    failed: syntheticCanaries.filter((c) => c.lastRunStatus === 'FAILED').length,
  }), []);

  const handleCreateCanary = () => {
    console.log('Create canary:', { canaryName, runtime: runtime.value, schedule: schedule.value });
    setShowCreateModal(false);
    setCanaryName('');
    setRuntime(runtimeOptions[0]);
    setSchedule(scheduleOptions[1]);
  };

  return (
    <>
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredItems.length})`}
            description="Create canaries to monitor your endpoints and APIs"
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <ButtonDropdown
                  items={[
                    { id: 'start', text: 'Start' },
                    { id: 'stop', text: 'Stop' },
                    { id: 'delete', text: 'Delete' },
                  ]}
                  disabled={selectedItems.length === 0}
                >
                  Actions
                </ButtonDropdown>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create canary
                </Button>
              </SpaceBetween>
            }
            info={
              <SpaceBetween size="xs" direction="horizontal">
                <Badge color="green">{canaryStats.running} Running</Badge>
                <Badge color="blue">{canaryStats.passed} Passed</Badge>
                <Badge color="red">{canaryStats.failed} Failed</Badge>
              </SpaceBetween>
            }
          >
            Synthetics Canaries
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Canary name',
            cell: (item) => (
              <Link href={`/monitoring/synthetics/${item.id}`}>
                {item.name}
              </Link>
            ),
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => <CanaryStateIndicator state={item.status} />,
            sortingField: 'status',
          },
          {
            id: 'lastRun',
            header: 'Last run',
            cell: (item) =>
              item.lastRunStatus ? (
                <SpaceBetween size="xs" direction="horizontal">
                  <CanaryRunStateIndicator state={item.lastRunStatus} />
                  <Box variant="small" color="text-body-secondary">
                    {item.lastRunTime ? formatDateTime(item.lastRunTime) : '-'}
                  </Box>
                </SpaceBetween>
              ) : (
                '-'
              ),
          },
          {
            id: 'schedule',
            header: 'Schedule',
            cell: (item) => item.schedule,
          },
          {
            id: 'runtime',
            header: 'Runtime',
            cell: (item) => (
              <Box variant="code" fontSize="body-s">
                {item.runtimeVersion}
              </Box>
            ),
          },
          {
            id: 'vpc',
            header: 'VPC',
            cell: (item) => (item.vpcConfig ? 'Yes' : 'No'),
          },
          {
            id: 'updated',
            header: 'Last updated',
            cell: (item) => formatDateTime(item.updatedAt),
            sortingField: 'updatedAt',
          },
        ]}
        items={paginatedItems}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="id"
        filter={
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder="Find canaries"
            filteringAriaLabel="Filter canaries"
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
            title="No canaries"
            description="No Synthetics canaries found. Create your first canary to start monitoring."
            actionLabel="Create canary"
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      {/* Create Canary Modal */}
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        size="large"
        header="Create Synthetics Canary"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateCanary} disabled={!canaryName.trim()}>
                Create canary
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField
              label="Canary name"
              description="Enter a unique name for this canary"
              constraintText="Use lowercase letters, numbers, and hyphens only"
            >
              <Input
                value={canaryName}
                onChange={({ detail }) => setCanaryName(detail.value)}
                placeholder="e.g., api-health-check"
              />
            </FormField>

            <FormField
              label="Runtime version"
              description="Select the runtime for your canary script"
            >
              <Select
                selectedOption={runtime}
                onChange={({ detail }) => setRuntime(detail.selectedOption as typeof runtime)}
                options={runtimeOptions}
              />
            </FormField>

            <FormField
              label="Schedule"
              description="How often should this canary run?"
            >
              <Select
                selectedOption={schedule}
                onChange={({ detail }) => setSchedule(detail.selectedOption as typeof schedule)}
                options={scheduleOptions}
              />
            </FormField>

            <FormField
              label="Handler"
              description="The entry point for your canary script"
            >
              <Input
                value="canaryHandler.handler"
                disabled
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}
