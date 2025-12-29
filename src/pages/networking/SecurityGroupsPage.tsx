import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import { EmptyState } from '@/components/common';
import { securityGroups } from '@/data/mockData';
import type { SecurityGroup } from '@/types';

const PAGE_SIZE = 10;

export function SecurityGroupsPage() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<SecurityGroup[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return securityGroups;
    const lowerFilter = filterText.toLowerCase();
    return securityGroups.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.id.toLowerCase().includes(lowerFilter) ||
        item.description.toLowerCase().includes(lowerFilter)
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
              <Button disabled={selectedItems.length !== 1}>Edit inbound rules</Button>
              <Button disabled={selectedItems.length !== 1}>Edit outbound rules</Button>
              <Button disabled={selectedItems.length === 0}>Delete</Button>
              <Button variant="primary" onClick={() => navigate('/networking/security-groups/create')}>Create security group</Button>
            </SpaceBetween>
          }
          description="Control inbound and outbound traffic for your resources"
        >
          Security Groups
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: (item) => (
            <Link href={`/networking/security-groups/${item.id}`}>{item.name}</Link>
          ),
          sortingField: 'name',
          isRowHeader: true,
        },
        {
          id: 'id',
          header: 'Security group ID',
          cell: (item) => item.id,
          sortingField: 'id',
        },
        {
          id: 'description',
          header: 'Description',
          cell: (item) => item.description,
        },
        {
          id: 'vpc',
          header: 'VPC',
          cell: (item) => <Link href={`/networking/vpcs/${item.vpcId}`}>{item.vpcId}</Link>,
        },
        {
          id: 'inbound',
          header: 'Inbound rules',
          cell: (item) => item.inboundRules,
        },
        {
          id: 'outbound',
          header: 'Outbound rules',
          cell: (item) => item.outboundRules,
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
          filteringPlaceholder="Find security groups"
          filteringAriaLabel="Filter security groups"
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
          title="No security groups"
          description="No security groups found. Create a security group for your VPC."
          actionLabel="Create security group"
          onAction={() => navigate('/networking/security-groups/create')}
        />
      }
      stickyHeader
      variant="full-page"
    />
  );
}
