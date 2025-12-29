import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import Badge from '@cloudscape-design/components/badge';
import { EmptyState } from '@/components/common';
import { s3Buckets } from '@/data/mockData';
import { formatDate } from '@/utils/formatters';
import { PAGE_SIZE } from '@/constants';
import type { S3Bucket } from '@/types';

function AccessBadge({ access }: { access: S3Bucket['access'] }) {
  switch (access) {
    case 'Public':
      return <Badge color="red">Public</Badge>;
    case 'Private':
      return <Badge color="green">Private</Badge>;
    default:
      return <Badge color="blue">Objects can be public</Badge>;
  }
}

export function S3Page() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<S3Bucket[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return s3Buckets;
    const lowerFilter = filterText.toLowerCase();
    return s3Buckets.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.region.toLowerCase().includes(lowerFilter)
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
              <Button disabled={selectedItems.length !== 1}>Empty</Button>
              <Button disabled={selectedItems.length === 0}>Delete</Button>
              <Button variant="primary" onClick={() => navigate('/storage/s3/create')}>
                Create bucket
              </Button>
            </SpaceBetween>
          }
          description="Object storage built to store and retrieve any amount of data"
        >
          S3 Buckets
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (item) => <Link href={`/storage/s3/${item.name}`}>{item.name}</Link>,
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'region',
          header: 'Region',
          cell: (item) => item.region,
          sortingField: 'region',
        },
        {
          id: 'access',
          header: 'Access',
          cell: (item) => <AccessBadge access={item.access} />,
        },
        {
          id: 'createdAt',
          header: 'Created',
          cell: (item) => formatDate(item.createdAt),
          sortingField: 'createdAt',
        },
        {
          id: 'size',
          header: 'Size',
          cell: (item) => item.size,
        },
        {
          id: 'objects',
          header: 'Objects',
          cell: (item) => item.objects.toLocaleString(),
          sortingField: 'objects',
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
          filteringPlaceholder="Find buckets"
          filteringAriaLabel="Filter buckets"
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
          title="No buckets"
          description="No S3 buckets found. Create your first bucket to store objects."
          actionLabel="Create bucket"
          onAction={() => navigate('/storage/s3/create')}
        />
      }
      stickyHeader
      variant="full-page"
    />
  );
}
