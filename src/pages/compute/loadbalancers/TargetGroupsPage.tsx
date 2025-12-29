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
import { targetGroups } from '@/data/mockData';
import type { TargetGroup } from '@/types';

const PAGE_SIZE = 10;

export function TargetGroupsPage() {
  const [selectedItems, setSelectedItems] = useState<TargetGroup[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return targetGroups;
    const lowerFilter = filterText.toLowerCase();
    return targetGroups.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.protocol.toLowerCase().includes(lowerFilter) ||
        item.targetType.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  return (
    <Table
      header={
        <Header
          variant="h1"
          counter={`(${filteredItems.length})`}
          actions={
            <SpaceBetween size="xs" direction="horizontal">
              <Button disabled={selectedItems.length !== 1}>Edit</Button>
              <Button disabled={selectedItems.length === 0}>Delete</Button>
              <Button variant="primary">Create target group</Button>
            </SpaceBetween>
          }
          description="Route requests to registered targets"
        >
          Target Groups
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (item) => (
            <Link href={`/compute/target-groups/${item.name}`}>{item.name}</Link>
          ),
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'protocol',
          header: 'Protocol : Port',
          cell: (item) => `${item.protocol} : ${item.port}`,
        },
        {
          id: 'targetType',
          header: 'Target type',
          cell: (item) => <Badge>{item.targetType}</Badge>,
        },
        {
          id: 'vpc',
          header: 'VPC',
          cell: (item) => <Link href={`/networking/vpcs/${item.vpcId}`}>{item.vpcId}</Link>,
        },
        {
          id: 'targets',
          header: 'Targets',
          cell: (item) => (
            <SpaceBetween size="xs" direction="horizontal">
              <StatusIndicator type="success">{item.healthyTargets} healthy</StatusIndicator>
              {item.unhealthyTargets > 0 && (
                <StatusIndicator type="error">{item.unhealthyTargets} unhealthy</StatusIndicator>
              )}
            </SpaceBetween>
          ),
        },
        {
          id: 'healthCheck',
          header: 'Health check path',
          cell: (item) => item.healthCheckPath || '-',
        },
        {
          id: 'loadBalancers',
          header: 'Load balancers',
          cell: (item) => item.loadBalancerArns.length,
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
          filteringPlaceholder="Find target groups"
          filteringAriaLabel="Filter target groups"
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
          title="No target groups"
          description="No target groups found. Create one to register targets for your load balancer."
          actionLabel="Create target group"
          onAction={() => console.log('Create target group')}
        />
      }
      stickyHeader
      variant="full-page"
    />
  );
}
