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
import ProgressBar from '@cloudscape-design/components/progress-bar';
import { EmptyState } from '@/components/common';
import { autoScalingGroups } from '@/data/mockData';
import { CreateASGModal } from './CreateASGModal';
import type { AutoScalingGroup } from '@/types';

const PAGE_SIZE = 10;

function ASGStatusIndicator({ status }: { status: AutoScalingGroup['status'] }) {
  const statusMap = {
    Active: { type: 'success' as const, label: 'Active' },
    Updating: { type: 'in-progress' as const, label: 'Updating' },
    Deleting: { type: 'pending' as const, label: 'Deleting' },
  };
  const config = statusMap[status];
  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export function AutoScalingPage() {
  const [selectedItems, setSelectedItems] = useState<AutoScalingGroup[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredItems = useMemo(() => {
    if (!filterText) return autoScalingGroups;
    const lowerFilter = filterText.toLowerCase();
    return autoScalingGroups.filter((item) => item.name.toLowerCase().includes(lowerFilter));
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  return (
    <>
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredItems.length})`}
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button disabled={selectedItems.length !== 1}>Edit</Button>
                <Button disabled={selectedItems.length === 0}>Delete</Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create Auto Scaling group
                </Button>
              </SpaceBetween>
            }
            description="Automatically scale your EC2 capacity based on demand"
          >
            Auto Scaling Groups
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Name',
            cell: (item) => <Link href={`/compute/autoscaling/${item.name}`}>{item.name}</Link>,
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => <ASGStatusIndicator status={item.status} />,
          },
          {
            id: 'instances',
            header: 'Instances',
            cell: (item) => (
              <SpaceBetween size="xs" direction="horizontal">
                <StatusIndicator type="success">{item.healthyInstances}</StatusIndicator>
                {item.unhealthyInstances > 0 && (
                  <StatusIndicator type="error">{item.unhealthyInstances}</StatusIndicator>
                )}
              </SpaceBetween>
            ),
          },
          {
            id: 'capacity',
            header: 'Capacity (Min/Desired/Max)',
            cell: (item) => (
              <SpaceBetween size="xs">
                <span>{`${item.minSize} / ${item.desiredCapacity} / ${item.maxSize}`}</span>
                <ProgressBar
                  value={(item.instances / item.maxSize) * 100}
                  additionalInfo={`${item.instances} of ${item.maxSize} max`}
                />
              </SpaceBetween>
            ),
          },
          {
            id: 'launchTemplate',
            header: 'Launch template',
            cell: (item) => item.launchTemplate,
          },
          {
            id: 'healthCheck',
            header: 'Health check',
            cell: (item) => <Badge>{item.healthCheckType}</Badge>,
          },
          {
            id: 'azs',
            header: 'Availability zones',
            cell: (item) => item.availabilityZones.join(', '),
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
            filteringPlaceholder="Find Auto Scaling groups"
            filteringAriaLabel="Filter Auto Scaling groups"
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
            title="No Auto Scaling groups"
            description="No Auto Scaling groups found. Create one to automatically scale your EC2 capacity."
            actionLabel="Create Auto Scaling group"
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      <CreateASGModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        onCreate={(data) => {
          console.log('Create ASG:', data);
          setShowCreateModal(false);
        }}
      />
    </>
  );
}
