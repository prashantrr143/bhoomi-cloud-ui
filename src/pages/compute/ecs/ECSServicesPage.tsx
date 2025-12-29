import { useState, useMemo } from 'react';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Badge from '@cloudscape-design/components/badge';
import { EmptyState } from '@/components/common';
import { ecsServices } from '@/data/mockData';
import type { ECSService } from '@/types';

const PAGE_SIZE = 10;

function ServiceStatusIndicator({ status }: { status: ECSService['status'] }) {
  const statusMap = {
    ACTIVE: { type: 'success' as const, label: 'Active' },
    DRAINING: { type: 'pending' as const, label: 'Draining' },
    INACTIVE: { type: 'stopped' as const, label: 'Inactive' },
  };
  const config = statusMap[status];
  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export function ECSServicesPage() {
  const [selectedItems, setSelectedItems] = useState<ECSService[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return ecsServices;
    const lowerFilter = filterText.toLowerCase();
    return ecsServices.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.clusterName.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Table
      header={
        <Header
          variant="h1"
          counter={`(${filteredItems.length})`}
          actions={
            <SpaceBetween size="xs" direction="horizontal">
              <Button disabled={selectedItems.length !== 1}>Update service</Button>
              <Button disabled={selectedItems.length === 0}>Delete</Button>
              <Button variant="primary">Create service</Button>
            </SpaceBetween>
          }
          description="Long-running tasks and applications in ECS"
        >
          ECS Services
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Service name',
          cell: (item) => <Link href={`/compute/ecs/services/${item.name}`}>{item.name}</Link>,
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'cluster',
          header: 'Cluster',
          cell: (item) => (
            <Link href={`/compute/ecs/clusters/${item.clusterName}`}>{item.clusterName}</Link>
          ),
        },
        {
          id: 'status',
          header: 'Status',
          cell: (item) => <ServiceStatusIndicator status={item.status} />,
          sortingField: 'status',
        },
        {
          id: 'tasks',
          header: 'Running / Desired',
          cell: (item) => `${item.runningCount} / ${item.desiredCount}`,
        },
        {
          id: 'launchType',
          header: 'Launch type',
          cell: (item) => (
            <Badge color={item.launchType === 'FARGATE' ? 'blue' : 'grey'}>{item.launchType}</Badge>
          ),
        },
        {
          id: 'taskDefinition',
          header: 'Task definition',
          cell: (item) => item.taskDefinition,
        },
        {
          id: 'created',
          header: 'Created',
          cell: (item) => formatDate(item.createdAt),
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
          filteringPlaceholder="Find services"
          filteringAriaLabel="Filter services"
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
          title="No services"
          description="No ECS services found. Create a service to run tasks in your cluster."
          actionLabel="Create service"
          onAction={() => console.log('Create service')}
        />
      }
      stickyHeader
      variant="full-page"
    />
  );
}
