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
import { eksNodeGroups } from '@/data/mockData';
import type { EKSNodeGroup } from '@/types';

const PAGE_SIZE = 10;

function NodeGroupStatusIndicator({ status }: { status: EKSNodeGroup['status'] }) {
  const statusMap: Record<EKSNodeGroup['status'], { type: 'success' | 'pending' | 'error' | 'in-progress' | 'warning'; label: string }> = {
    ACTIVE: { type: 'success', label: 'Active' },
    CREATING: { type: 'in-progress', label: 'Creating' },
    UPDATING: { type: 'in-progress', label: 'Updating' },
    DELETING: { type: 'pending', label: 'Deleting' },
    DEGRADED: { type: 'warning', label: 'Degraded' },
  };
  const config = statusMap[status];
  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export function EKSNodeGroupsPage() {
  const [selectedItems, setSelectedItems] = useState<EKSNodeGroup[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return eksNodeGroups;
    const lowerFilter = filterText.toLowerCase();
    return eksNodeGroups.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.clusterName.toLowerCase().includes(lowerFilter)
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
              <Button variant="primary">Add node group</Button>
            </SpaceBetween>
          }
          description="Managed groups of EC2 instances for your Kubernetes workloads"
        >
          Node Groups
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Node group name',
          cell: (item) => (
            <Link href={`/compute/eks/node-groups/${item.name}`}>{item.name}</Link>
          ),
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'cluster',
          header: 'Cluster',
          cell: (item) => (
            <Link href={`/compute/eks/clusters/${item.clusterName}`}>{item.clusterName}</Link>
          ),
        },
        {
          id: 'status',
          header: 'Status',
          cell: (item) => <NodeGroupStatusIndicator status={item.status} />,
          sortingField: 'status',
        },
        {
          id: 'instanceTypes',
          header: 'Instance types',
          cell: (item) => (
            <SpaceBetween size="xs" direction="horizontal">
              {item.instanceTypes.map((type) => (
                <Badge key={type}>{type}</Badge>
              ))}
            </SpaceBetween>
          ),
        },
        {
          id: 'scaling',
          header: 'Scaling config',
          cell: (item) => `${item.minSize} / ${item.desiredSize} / ${item.maxSize}`,
        },
        {
          id: 'diskSize',
          header: 'Disk size',
          cell: (item) => `${item.diskSize} GB`,
        },
        {
          id: 'amiType',
          header: 'AMI type',
          cell: (item) => item.amiType,
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
          filteringPlaceholder="Find node groups"
          filteringAriaLabel="Filter node groups"
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
          title="No node groups"
          description="No node groups found. Add a node group to your cluster to run workloads."
          actionLabel="Add node group"
          onAction={() => console.log('Add node group')}
        />
      }
      stickyHeader
      variant="full-page"
    />
  );
}
