import { useState, useMemo } from 'react';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import Icon from '@cloudscape-design/components/icon';
import { ResourceStatusIndicator, EmptyState } from '@/components/common';
import { ebsVolumes } from '@/data/mockData';
import type { EBSVolume } from '@/types';

const PAGE_SIZE = 10;

export function EBSPage() {
  const [selectedItems, setSelectedItems] = useState<EBSVolume[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return ebsVolumes;
    const lowerFilter = filterText.toLowerCase();
    return ebsVolumes.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.id.toLowerCase().includes(lowerFilter) ||
        item.volumeType.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const hasAvailableVolume = selectedItems.some((v) => v.state === 'available');
  const hasAttachedVolume = selectedItems.some((v) => v.state === 'in-use');

  return (
    <Table
      header={
        <Header
          variant="h1"
          counter={`(${filteredItems.length})`}
          actions={
            <SpaceBetween size="xs" direction="horizontal">
              <Button disabled={!hasAvailableVolume || selectedItems.length !== 1}>
                Attach volume
              </Button>
              <Button disabled={!hasAttachedVolume || selectedItems.length !== 1}>
                Detach volume
              </Button>
              <Button disabled={selectedItems.length !== 1}>Create snapshot</Button>
              <Button disabled={!hasAvailableVolume}>Delete</Button>
              <Button variant="primary">Create volume</Button>
            </SpaceBetween>
          }
          description="Block storage volumes for EC2 instances"
        >
          EBS Volumes
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (item) => <Link href={`/storage/ebs/${item.id}`}>{item.name}</Link>,
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'id',
          header: 'Volume ID',
          cell: (item) => item.id,
          sortingField: 'id',
        },
        {
          id: 'size',
          header: 'Size',
          cell: (item) => `${item.size} GiB`,
          sortingField: 'size',
        },
        {
          id: 'type',
          header: 'Volume type',
          cell: (item) => item.volumeType,
          sortingField: 'volumeType',
        },
        {
          id: 'iops',
          header: 'IOPS',
          cell: (item) => item.iops.toLocaleString(),
          sortingField: 'iops',
        },
        {
          id: 'state',
          header: 'State',
          cell: (item) => <ResourceStatusIndicator status={item.state} />,
          sortingField: 'state',
        },
        {
          id: 'attached',
          header: 'Attached to',
          cell: (item) =>
            item.attachedTo ? (
              <Link href={`/compute/instances/${item.attachedTo}`}>{item.attachedTo}</Link>
            ) : (
              '-'
            ),
        },
        {
          id: 'az',
          header: 'Availability Zone',
          cell: (item) => item.availabilityZone,
          sortingField: 'availabilityZone',
        },
        {
          id: 'encrypted',
          header: 'Encrypted',
          cell: (item) =>
            item.encrypted ? (
              <Icon name="lock-private" variant="success" />
            ) : (
              <Icon name="unlocked" variant="subtle" />
            ),
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
          filteringPlaceholder="Find volumes"
          filteringAriaLabel="Filter volumes"
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
          title="No volumes"
          description="No EBS volumes found. Create a volume to attach to your instances."
          actionLabel="Create volume"
          onAction={() => console.log('Create volume')}
        />
      }
      stickyHeader
      variant="full-page"
    />
  );
}
