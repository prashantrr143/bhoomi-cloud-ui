import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import Badge from '@cloudscape-design/components/badge';
import { ResourceStatusIndicator, EmptyState } from '@/components/common';
import { vpcs } from '@/data/mockData';
import type { VPC } from '@/types';

const PAGE_SIZE = 10;

export function VPCsPage() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<VPC[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return vpcs;
    const lowerFilter = filterText.toLowerCase();
    return vpcs.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.id.toLowerCase().includes(lowerFilter) ||
        item.cidrBlock.toLowerCase().includes(lowerFilter)
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
              <Button disabled={selectedItems.length !== 1}>View details</Button>
              <Button disabled={selectedItems.length !== 1 || selectedItems[0]?.isDefault}>
                Delete
              </Button>
              <Button variant="primary" onClick={() => navigate('/networking/vpcs/create')}>Create VPC</Button>
            </SpaceBetween>
          }
          description="Virtual Private Clouds for your resources"
        >
          VPCs
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (item) => (
            <SpaceBetween size="xs" direction="horizontal">
              <Link href={`/networking/vpcs/${item.id}`}>{item.name}</Link>
              {item.isDefault && <Badge color="blue">Default</Badge>}
            </SpaceBetween>
          ),
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'id',
          header: 'VPC ID',
          cell: (item) => item.id,
          sortingField: 'id',
        },
        {
          id: 'cidr',
          header: 'IPv4 CIDR',
          cell: (item) => item.cidrBlock,
          sortingField: 'cidrBlock',
        },
        {
          id: 'state',
          header: 'State',
          cell: (item) => <ResourceStatusIndicator status={item.state} />,
          sortingField: 'state',
        },
        {
          id: 'tenancy',
          header: 'Tenancy',
          cell: (item) => item.tenancy,
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
          filteringPlaceholder="Find VPCs"
          filteringAriaLabel="Filter VPCs"
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
          title="No VPCs"
          description="No VPCs found. Create your first VPC to get started."
          actionLabel="Create VPC"
          onAction={() => navigate('/networking/vpcs/create')}
        />
      }
      stickyHeader
      variant="full-page"
    />
  );
}
