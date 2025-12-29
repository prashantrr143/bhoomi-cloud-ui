import { useState, useMemo } from 'react';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import Pagination from '@cloudscape-design/components/pagination';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import TextFilter from '@cloudscape-design/components/text-filter';
import Textarea from '@cloudscape-design/components/textarea';
import { EmptyState } from '@/components/common';
import { eventBuses, eventRules } from '@/data/mockData';
import { formatDateTime } from '@/utils/formatters';
import { PAGE_SIZE } from '@/constants';
import type { EventRule } from '@/types';

export function EventsPage() {
  const [selectedRules, setSelectedRules] = useState<EventRule[]>([]);
  const [filterText, setFilterText] = useState('');
  const [selectedBus, setSelectedBus] = useState({ label: 'All Event Buses', value: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create rule form state
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [ruleType, setRuleType] = useState({ label: 'Event pattern', value: 'pattern' });
  const [eventPattern, setEventPattern] = useState('');
  const [scheduleExpression, setScheduleExpression] = useState('');

  const busOptions = [
    { label: 'All Event Buses', value: 'all' },
    ...eventBuses.map((bus) => ({ label: bus.name, value: bus.name })),
  ];

  const filteredRules = useMemo(() => {
    let items = eventRules;

    if (selectedBus.value !== 'all') {
      items = items.filter((rule) => rule.eventBusName === selectedBus.value);
    }

    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      items = items.filter(
        (rule) =>
          rule.name.toLowerCase().includes(lowerFilter) ||
          rule.description?.toLowerCase().includes(lowerFilter)
      );
    }

    return items;
  }, [filterText, selectedBus]);

  const paginatedRules = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRules.slice(start, start + PAGE_SIZE);
  }, [filteredRules, currentPage]);

  const handleCreateRule = () => {
    console.log('Create rule:', { ruleName, ruleDescription, ruleType, eventPattern, scheduleExpression });
    setShowCreateModal(false);
    setRuleName('');
    setRuleDescription('');
    setEventPattern('');
    setScheduleExpression('');
  };

  return (
    <SpaceBetween size="l">
      <Tabs
        tabs={[
          {
            id: 'rules',
            label: 'Rules',
            content: (
              <Table
                header={
                  <Header
                    variant="h1"
                    counter={`(${filteredRules.length})`}
                    description="Create rules to match events and route them to targets"
                    actions={
                      <SpaceBetween size="xs" direction="horizontal">
                        <ButtonDropdown
                          items={[
                            { id: 'enable', text: 'Enable' },
                            { id: 'disable', text: 'Disable' },
                            { id: 'delete', text: 'Delete' },
                          ]}
                          disabled={selectedRules.length === 0}
                        >
                          Actions
                        </ButtonDropdown>
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                          Create rule
                        </Button>
                      </SpaceBetween>
                    }
                  >
                    EventBridge Rules
                  </Header>
                }
                columnDefinitions={[
                  {
                    id: 'name',
                    header: 'Rule name',
                    cell: (item) => <Box fontWeight="bold">{item.name}</Box>,
                    sortingField: 'name',
                    isRowHeader: true,
                  },
                  {
                    id: 'state',
                    header: 'State',
                    cell: (item) => (
                      <StatusIndicator type={item.state === 'ENABLED' ? 'success' : 'stopped'}>
                        {item.state === 'ENABLED' ? 'Enabled' : 'Disabled'}
                      </StatusIndicator>
                    ),
                    sortingField: 'state',
                  },
                  {
                    id: 'type',
                    header: 'Type',
                    cell: (item) => (
                      <Badge color={item.scheduleExpression ? 'blue' : 'grey'}>
                        {item.scheduleExpression ? 'Schedule' : 'Event pattern'}
                      </Badge>
                    ),
                  },
                  {
                    id: 'eventBus',
                    header: 'Event bus',
                    cell: (item) => item.eventBusName,
                    sortingField: 'eventBusName',
                  },
                  {
                    id: 'targets',
                    header: 'Targets',
                    cell: (item) => item.targets.length,
                  },
                  {
                    id: 'description',
                    header: 'Description',
                    cell: (item) => item.description || '-',
                  },
                  {
                    id: 'updated',
                    header: 'Last updated',
                    cell: (item) => formatDateTime(item.updatedAt),
                    sortingField: 'updatedAt',
                  },
                ]}
                items={paginatedRules}
                selectionType="multi"
                selectedItems={selectedRules}
                onSelectionChange={({ detail }) => setSelectedRules(detail.selectedItems)}
                trackBy="id"
                filter={
                  <SpaceBetween size="xs" direction="horizontal">
                    <TextFilter
                      filteringText={filterText}
                      filteringPlaceholder="Find rules"
                      filteringAriaLabel="Filter rules"
                      onChange={({ detail }) => {
                        setFilterText(detail.filteringText);
                        setCurrentPage(1);
                      }}
                    />
                    <Select
                      selectedOption={selectedBus}
                      onChange={({ detail }) => {
                        setSelectedBus(detail.selectedOption as typeof selectedBus);
                        setCurrentPage(1);
                      }}
                      options={busOptions}
                    />
                  </SpaceBetween>
                }
                pagination={
                  <Pagination
                    currentPageIndex={currentPage}
                    pagesCount={Math.ceil(filteredRules.length / PAGE_SIZE)}
                    onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                  />
                }
                empty={
                  <EmptyState
                    title="No rules"
                    description="No EventBridge rules found. Create your first rule to start routing events."
                    actionLabel="Create rule"
                    onAction={() => setShowCreateModal(true)}
                  />
                }
                stickyHeader
                variant="full-page"
              />
            ),
          },
          {
            id: 'event-buses',
            label: 'Event buses',
            content: (
              <Container
                header={
                  <Header
                    variant="h2"
                    counter={`(${eventBuses.length})`}
                    actions={<Button>Create event bus</Button>}
                  >
                    Event Buses
                  </Header>
                }
              >
                <ColumnLayout columns={1}>
                  {eventBuses.map((bus) => (
                    <ExpandableSection
                      key={bus.name}
                      headerText={
                        <SpaceBetween size="xs" direction="horizontal">
                          <Box fontWeight="bold">{bus.name}</Box>
                          {bus.isDefault && <Badge color="blue">Default</Badge>}
                        </SpaceBetween>
                      }
                    >
                      <ColumnLayout columns={2} variant="text-grid">
                        <SpaceBetween size="xs">
                          <Box variant="awsui-key-label">ARN</Box>
                          <Box variant="code" fontSize="body-s">{bus.arn}</Box>
                        </SpaceBetween>
                        <SpaceBetween size="xs">
                          <Box variant="awsui-key-label">Created</Box>
                          <Box>{formatDateTime(bus.createdAt)}</Box>
                        </SpaceBetween>
                        <SpaceBetween size="xs">
                          <Box variant="awsui-key-label">Rules</Box>
                          <Box>{eventRules.filter((r) => r.eventBusName === bus.name).length}</Box>
                        </SpaceBetween>
                        {bus.policy && (
                          <SpaceBetween size="xs">
                            <Box variant="awsui-key-label">Resource policy</Box>
                            <Box>Configured</Box>
                          </SpaceBetween>
                        )}
                      </ColumnLayout>
                    </ExpandableSection>
                  ))}
                </ColumnLayout>
              </Container>
            ),
          },
        ]}
      />

      {/* Create Rule Modal */}
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        size="large"
        header="Create EventBridge Rule"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateRule} disabled={!ruleName.trim()}>
                Create rule
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label="Rule name" description="Enter a unique name for this rule">
              <Input
                value={ruleName}
                onChange={({ detail }) => setRuleName(detail.value)}
                placeholder="e.g., EC2-State-Change-Handler"
              />
            </FormField>

            <FormField label="Description">
              <Input
                value={ruleDescription}
                onChange={({ detail }) => setRuleDescription(detail.value)}
                placeholder="Optional description"
              />
            </FormField>

            <FormField label="Event bus">
              <Select
                selectedOption={{ label: 'default', value: 'default' }}
                options={eventBuses.map((bus) => ({ label: bus.name, value: bus.name }))}
              />
            </FormField>

            <FormField label="Rule type">
              <Select
                selectedOption={ruleType}
                onChange={({ detail }) => setRuleType(detail.selectedOption as typeof ruleType)}
                options={[
                  { label: 'Event pattern', value: 'pattern', description: 'Match events based on a pattern' },
                  { label: 'Schedule', value: 'schedule', description: 'Run on a schedule (cron or rate)' },
                ]}
              />
            </FormField>

            {ruleType.value === 'pattern' ? (
              <FormField
                label="Event pattern"
                description="Define the pattern to match events"
              >
                <Textarea
                  value={eventPattern}
                  onChange={({ detail }) => setEventPattern(detail.value)}
                  rows={8}
                  placeholder={`{
  "source": ["aws.ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {
    "state": ["running", "stopped"]
  }
}`}
                />
              </FormField>
            ) : (
              <FormField
                label="Schedule expression"
                description="Use rate() or cron() expressions"
              >
                <Input
                  value={scheduleExpression}
                  onChange={({ detail }) => setScheduleExpression(detail.value)}
                  placeholder="e.g., rate(5 minutes) or cron(0 12 * * ? *)"
                />
              </FormField>
            )}
          </SpaceBetween>
        </Form>
      </Modal>
    </SpaceBetween>
  );
}
