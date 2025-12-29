import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import { ResourceStatusIndicator, EmptyState } from '@/components/common';
import { subnets } from '@/data/mockData';
import type { Subnet } from '@/types';

const PAGE_SIZE = 10;

export function SubnetsPage() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<Subnet[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return subnets;
    const lowerFilter = filterText.toLowerCase();
    return subnets.filter(
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
              <Button disabled={selectedItems.length === 0}>Delete</Button>
              <Button variant="primary" onClick={() => navigate('/networking/subnets/create')}>Create subnet</Button>
            </SpaceBetween>
          }
          description="Subnets within your VPCs"
        >
          Subnets
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (item) => <Link href={`/networking/subnets/${item.id}`}>{item.name}</Link>,
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'id',
          header: 'Subnet ID',
          cell: (item) => item.id,
          sortingField: 'id',
        },
        {
          id: 'vpc',
          header: 'VPC',
          cell: (item) => <Link href={`/networking/vpcs/${item.vpcId}`}>{item.vpcId}</Link>,
        },
        {
          id: 'cidr',
          header: 'IPv4 CIDR',
          cell: (item) => item.cidrBlock,
          sortingField: 'cidrBlock',
        },
        {
          id: 'az',
          header: 'Availability Zone',
          cell: (item) => item.availabilityZone,
          sortingField: 'availabilityZone',
        },
        {
          id: 'availableIps',
          header: 'Available IPs',
          cell: (item) => item.availableIps,
          sortingField: 'availableIps',
        },
        {
          id: 'state',
          header: 'State',
          cell: (item) => <ResourceStatusIndicator status={item.state} />,
          sortingField: 'state',
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
          filteringPlaceholder="Find subnets"
          filteringAriaLabel="Filter subnets"
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
          title="No subnets"
          description="No subnets found. Create a subnet in one of your VPCs."
          actionLabel="Create subnet"
          onAction={() => navigate('/networking/subnets/create')}
        />
      }
      stickyHeader
      variant="full-page"
    />
  );
}
