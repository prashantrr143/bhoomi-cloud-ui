import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Pagination from '@cloudscape-design/components/pagination';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import { EmptyState } from '@/components/common';
import { supportCases } from '@/data/supportMockData';
import type { SupportCase, SupportCaseStatus, SupportCaseSeverity } from '@/types';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'pending-customer-action', label: 'Pending customer action' },
  { value: 'pending-bhoomi-action', label: 'Pending Bhoomi action' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

export function CasesPage() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<SupportCase[]>([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState({ value: 'all', label: 'All statuses' });
  const [severityFilter, setSeverityFilter] = useState({ value: 'all', label: 'All severities' });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCases = useMemo(() => {
    return supportCases.filter((caseItem) => {
      const matchesText =
        filterText === '' ||
        caseItem.subject.toLowerCase().includes(filterText.toLowerCase()) ||
        caseItem.displayId.toLowerCase().includes(filterText.toLowerCase()) ||
        caseItem.service.toLowerCase().includes(filterText.toLowerCase());

      const matchesStatus =
        statusFilter.value === 'all' || caseItem.status === statusFilter.value;

      const matchesSeverity =
        severityFilter.value === 'all' || caseItem.severity === severityFilter.value;

      return matchesText && matchesStatus && matchesSeverity;
    });
  }, [filterText, statusFilter.value, severityFilter.value]);

  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCases.slice(start, start + PAGE_SIZE);
  }, [filteredCases, currentPage]);

  const getStatusIndicator = useCallback((status: SupportCaseStatus) => {
    switch (status) {
      case 'open':
        return <StatusIndicator type="pending">Open</StatusIndicator>;
      case 'pending-customer-action':
        return <StatusIndicator type="warning">Pending your action</StatusIndicator>;
      case 'pending-bhoomi-action':
        return <StatusIndicator type="in-progress">Pending Bhoomi action</StatusIndicator>;
      case 'resolved':
        return <StatusIndicator type="success">Resolved</StatusIndicator>;
      case 'closed':
        return <StatusIndicator type="stopped">Closed</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{status}</StatusIndicator>;
    }
  }, []);

  const getSeverityBadge = useCallback((severity: SupportCaseSeverity) => {
    const colors: Record<SupportCaseSeverity, 'red' | 'blue' | 'grey'> = {
      critical: 'red',
      urgent: 'red',
      high: 'red',
      normal: 'blue',
      low: 'grey',
    };
    return <Badge color={colors[severity]}>{severity.toUpperCase()}</Badge>;
  }, []);

  const columnDefinitions = [
    {
      id: 'displayId',
      header: 'Case ID',
      cell: (item: SupportCase) => (
        <Link onFollow={() => navigate(`/support/cases/${item.id}`)}>{item.displayId}</Link>
      ),
      sortingField: 'displayId',
      width: 140,
    },
    {
      id: 'subject',
      header: 'Subject',
      cell: (item: SupportCase) => item.subject,
      sortingField: 'subject',
    },
    {
      id: 'severity',
      header: 'Severity',
      cell: (item: SupportCase) => getSeverityBadge(item.severity),
      sortingField: 'severity',
      width: 100,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item: SupportCase) => getStatusIndicator(item.status),
      sortingField: 'status',
      width: 180,
    },
    {
      id: 'service',
      header: 'Service',
      cell: (item: SupportCase) => item.service,
      sortingField: 'service',
      width: 100,
    },
    {
      id: 'category',
      header: 'Category',
      cell: (item: SupportCase) => (
        <Box>{item.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</Box>
      ),
      sortingField: 'category',
      width: 160,
    },
    {
      id: 'createdAt',
      header: 'Created',
      cell: (item: SupportCase) => new Date(item.createdAt).toLocaleDateString(),
      sortingField: 'createdAt',
      width: 120,
    },
    {
      id: 'updatedAt',
      header: 'Last updated',
      cell: (item: SupportCase) => new Date(item.updatedAt).toLocaleDateString(),
      sortingField: 'updatedAt',
      width: 120,
    },
  ];

  return (
    <Table
      header={
        <Header
          variant="h1"
          counter={`(${filteredCases.length})`}
          description="View and manage your support cases"
          actions={
            <SpaceBetween size="xs" direction="horizontal">
              <ButtonDropdown
                items={[
                  { id: 'reopen', text: 'Reopen case', disabled: selectedItems.length !== 1 },
                  { id: 'close', text: 'Close case', disabled: selectedItems.length !== 1 },
                ]}
                disabled={selectedItems.length === 0}
              >
                Actions
              </ButtonDropdown>
              <Button variant="primary" onClick={() => navigate('/support/cases/create')}>
                Create case
              </Button>
            </SpaceBetween>
          }
        >
          Support Cases
        </Header>
      }
      items={paginatedCases}
      columnDefinitions={columnDefinitions}
      selectionType="multi"
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      trackBy="id"
      filter={
        <SpaceBetween size="xs" direction="horizontal">
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder="Search cases"
            onChange={({ detail }) => setFilterText(detail.filteringText)}
          />
          <Select
            selectedOption={statusFilter}
            onChange={({ detail }) =>
              setStatusFilter(detail.selectedOption as { value: string; label: string })
            }
            options={STATUS_OPTIONS}
          />
          <Select
            selectedOption={severityFilter}
            onChange={({ detail }) =>
              setSeverityFilter(detail.selectedOption as { value: string; label: string })
            }
            options={SEVERITY_OPTIONS}
          />
        </SpaceBetween>
      }
      pagination={
        <Pagination
          currentPageIndex={currentPage}
          pagesCount={Math.ceil(filteredCases.length / PAGE_SIZE)}
          onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
        />
      }
      empty={
        <EmptyState
          title="No support cases"
          description="You don't have any support cases yet."
          action={
            <Button variant="primary" onClick={() => navigate('/support/cases/create')}>
              Create case
            </Button>
          }
        />
      }
    />
  );
}
