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
import { routeTables } from '@/data/mockData';
import type { RouteTable } from '@/types';

const PAGE_SIZE = 10;

export function RouteTablesPage() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<RouteTable[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return routeTables;
    const lowerFilter = filterText.toLowerCase();
    return routeTables.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.id.toLowerCase().includes(lowerFilter) ||
        item.vpcId.toLowerCase().includes(lowerFilter)
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
              <Button disabled={selectedItems.length !== 1}>Edit routes</Button>
              <Button disabled={selectedItems.length !== 1}>Edit associations</Button>
              <Button disabled={selectedItems.length === 0}>Delete</Button>
              <Button variant="primary" onClick={() => navigate('/networking/route-tables/create')}>
                Create route table
              </Button>
            </SpaceBetween>
          }
          description="Route tables contain rules that determine where network traffic is directed"
        >
          Route Tables
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (item) => (
            <Link href={`/networking/route-tables/${item.id}`}>{item.name || '-'}</Link>
          ),
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'id',
          header: 'Route Table ID',
          cell: (item) => item.id,
          sortingField: 'id',
        },
        {
          id: 'vpc',
          header: 'VPC',
          cell: (item) => <Link href={`/networking/vpcs/${item.vpcId}`}>{item.vpcId}</Link>,
        },
        {
          id: 'routes',
          header: 'Routes',
          cell: (item) => item.routes.length,
        },
        {
          id: 'associations',
          header: 'Subnet Associations',
          cell: (item) => item.associations.length,
        },
        {
          id: 'main',
          header: 'Main',
          cell: (item) =>
            item.isMain ? <Badge color="green">Yes</Badge> : <Badge color="grey">No</Badge>,
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
          filteringPlaceholder="Find route tables"
          filteringAriaLabel="Filter route tables"
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
          title="No route tables"
          description="No route tables found. Create a route table to control traffic routing."
          actionLabel="Create route table"
          onAction={() => navigate('/networking/route-tables/create')}
        />
      }
      stickyHeader
      variant="full-page"
    />
  );
}
