import { useState, useMemo } from 'react';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import Pagination from '@cloudscape-design/components/pagination';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import { AlarmStateIndicator } from '@/components/indicators';
import { EmptyState } from '@/components/common';
import { cloudWatchAlarms } from '@/data/mockData';
import { formatDateTime } from '@/utils/formatters';
import { PAGE_SIZE } from '@/constants';
import type { CloudWatchAlarm, AlarmState } from '@/types';

const namespaceOptions = [
  { label: 'All Namespaces', value: 'all' },
  { label: 'AWS/EC2', value: 'AWS/EC2' },
  { label: 'AWS/Lambda', value: 'AWS/Lambda' },
  { label: 'AWS/RDS', value: 'AWS/RDS' },
  { label: 'AWS/EKS', value: 'AWS/EKS' },
  { label: 'AWS/S3', value: 'AWS/S3' },
  { label: 'AWS/ApplicationELB', value: 'AWS/ApplicationELB' },
  { label: 'Custom', value: 'Custom' },
];

const stateOptions = [
  { label: 'All States', value: 'all' },
  { label: 'In alarm', value: 'ALARM' },
  { label: 'OK', value: 'OK' },
  { label: 'Insufficient data', value: 'INSUFFICIENT_DATA' },
];

function StateBadge({ state }: { state: AlarmState }) {
  const colorMap: Record<AlarmState, 'red' | 'green' | 'grey'> = {
    ALARM: 'red',
    OK: 'green',
    INSUFFICIENT_DATA: 'grey',
  };
  const labelMap: Record<AlarmState, string> = {
    ALARM: 'ALARM',
    OK: 'OK',
    INSUFFICIENT_DATA: 'INSUFFICIENT',
  };
  return <Badge color={colorMap[state]}>{labelMap[state]}</Badge>;
}

export function AlarmsPage() {
  const [selectedItems, setSelectedItems] = useState<CloudWatchAlarm[]>([]);
  const [filterText, setFilterText] = useState('');
  const [namespaceFilter, setNamespaceFilter] = useState({ label: 'All Namespaces', value: 'all' });
  const [stateFilter, setStateFilter] = useState({ label: 'All States', value: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create alarm form state
  const [alarmName, setAlarmName] = useState('');
  const [alarmDescription, setAlarmDescription] = useState('');

  const filteredItems = useMemo(() => {
    let items = cloudWatchAlarms;

    if (namespaceFilter.value !== 'all') {
      items = items.filter((item) => item.namespace === namespaceFilter.value);
    }

    if (stateFilter.value !== 'all') {
      items = items.filter((item) => item.state === stateFilter.value);
    }

    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerFilter) ||
          item.metricName.toLowerCase().includes(lowerFilter) ||
          item.description?.toLowerCase().includes(lowerFilter)
      );
    }

    return items;
  }, [filterText, namespaceFilter, stateFilter]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const alarmCounts = useMemo(() => ({
    total: cloudWatchAlarms.length,
    alarm: cloudWatchAlarms.filter((a) => a.state === 'ALARM').length,
    ok: cloudWatchAlarms.filter((a) => a.state === 'OK').length,
    insufficientData: cloudWatchAlarms.filter((a) => a.state === 'INSUFFICIENT_DATA').length,
  }), []);

  const handleCreateAlarm = () => {
    console.log('Create alarm:', { alarmName, alarmDescription });
    setShowCreateModal(false);
    setAlarmName('');
    setAlarmDescription('');
  };

  return (
    <>
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredItems.length})`}
            description="Create and manage CloudWatch alarms to monitor your resources"
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <ButtonDropdown
                  items={[
                    { id: 'enable', text: 'Enable actions' },
                    { id: 'disable', text: 'Disable actions' },
                    { id: 'delete', text: 'Delete' },
                  ]}
                  disabled={selectedItems.length === 0}
                >
                  Actions
                </ButtonDropdown>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create alarm
                </Button>
              </SpaceBetween>
            }
            info={
              <SpaceBetween size="xs" direction="horizontal">
                <Badge color="red">{alarmCounts.alarm} In alarm</Badge>
                <Badge color="green">{alarmCounts.ok} OK</Badge>
                <Badge color="grey">{alarmCounts.insufficientData} Insufficient</Badge>
              </SpaceBetween>
            }
          >
            CloudWatch Alarms
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Alarm name',
            cell: (item) => <Box fontWeight="bold">{item.name}</Box>,
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'state',
            header: 'State',
            cell: (item) => <AlarmStateIndicator state={item.state} />,
            sortingField: 'state',
          },
          {
            id: 'stateUpdated',
            header: 'State updated',
            cell: (item) => formatDateTime(item.stateUpdatedAt),
            sortingField: 'stateUpdatedAt',
          },
          {
            id: 'namespace',
            header: 'Namespace',
            cell: (item) => <StateBadge state={item.state} />,
          },
          {
            id: 'metric',
            header: 'Metric name',
            cell: (item) => item.metricName,
            sortingField: 'metricName',
          },
          {
            id: 'condition',
            header: 'Condition',
            cell: (item) => {
              const op = item.comparisonOperator
                .replace('GreaterThanOrEqualToThreshold', '>=')
                .replace('GreaterThanThreshold', '>')
                .replace('LessThanThreshold', '<')
                .replace('LessThanOrEqualToThreshold', '<=');
              return `${op} ${item.threshold}`;
            },
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (item) => (
              <Box color={item.actionsEnabled ? 'text-status-success' : 'text-status-inactive'}>
                {item.actionsEnabled ? `${item.alarmActions.length} enabled` : 'Disabled'}
              </Box>
            ),
          },
        ]}
        items={paginatedItems}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="id"
        filter={
          <SpaceBetween size="xs" direction="horizontal">
            <TextFilter
              filteringText={filterText}
              filteringPlaceholder="Find alarms"
              filteringAriaLabel="Filter alarms"
              onChange={({ detail }) => {
                setFilterText(detail.filteringText);
                setCurrentPage(1);
              }}
            />
            <Select
              selectedOption={namespaceFilter}
              onChange={({ detail }) => {
                setNamespaceFilter(detail.selectedOption as typeof namespaceFilter);
                setCurrentPage(1);
              }}
              options={namespaceOptions}
            />
            <Select
              selectedOption={stateFilter}
              onChange={({ detail }) => {
                setStateFilter(detail.selectedOption as typeof stateFilter);
                setCurrentPage(1);
              }}
              options={stateOptions}
            />
          </SpaceBetween>
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
            title="No alarms"
            description="No CloudWatch alarms found. Create your first alarm to monitor your resources."
            actionLabel="Create alarm"
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      {/* Create Alarm Modal */}
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        size="large"
        header="Create CloudWatch Alarm"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateAlarm} disabled={!alarmName.trim()}>
                Create alarm
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label="Alarm name" description="Enter a unique name for this alarm">
              <Input
                value={alarmName}
                onChange={({ detail }) => setAlarmName(detail.value)}
                placeholder="e.g., High-CPU-Production"
              />
            </FormField>

            <FormField label="Description" description="Optional description for this alarm">
              <Input
                value={alarmDescription}
                onChange={({ detail }) => setAlarmDescription(detail.value)}
                placeholder="Describe what this alarm monitors"
              />
            </FormField>

            <FormField label="Metric">
              <ColumnLayout columns={2}>
                <Select
                  selectedOption={{ label: 'AWS/EC2', value: 'AWS/EC2' }}
                  options={namespaceOptions.slice(1)}
                  placeholder="Select namespace"
                />
                <Select
                  selectedOption={{ label: 'CPUUtilization', value: 'CPUUtilization' }}
                  options={[
                    { label: 'CPUUtilization', value: 'CPUUtilization' },
                    { label: 'NetworkIn', value: 'NetworkIn' },
                    { label: 'NetworkOut', value: 'NetworkOut' },
                    { label: 'DiskReadOps', value: 'DiskReadOps' },
                  ]}
                  placeholder="Select metric"
                />
              </ColumnLayout>
            </FormField>

            <FormField label="Conditions">
              <ColumnLayout columns={3}>
                <Select
                  selectedOption={{ label: 'Average', value: 'Average' }}
                  options={[
                    { label: 'Average', value: 'Average' },
                    { label: 'Sum', value: 'Sum' },
                    { label: 'Maximum', value: 'Maximum' },
                    { label: 'Minimum', value: 'Minimum' },
                  ]}
                />
                <Select
                  selectedOption={{ label: '> Greater than', value: 'GreaterThanThreshold' }}
                  options={[
                    { label: '> Greater than', value: 'GreaterThanThreshold' },
                    { label: '>= Greater than or equal', value: 'GreaterThanOrEqualToThreshold' },
                    { label: '< Less than', value: 'LessThanThreshold' },
                    { label: '<= Less than or equal', value: 'LessThanOrEqualToThreshold' },
                  ]}
                />
                <Input placeholder="Threshold value" type="number" />
              </ColumnLayout>
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}
