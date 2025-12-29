import { useState, useMemo } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import Badge from '@cloudscape-design/components/badge';
import { EmptyState } from '@/components/common';
import { LoadBalancerStateIndicator } from '@/components/indicators';
import { loadBalancers } from '@/data/mockData';
import { CreateLoadBalancerModal } from './CreateLoadBalancerModal';
import { formatDate } from '@/utils/formatters';
import { PAGE_SIZE } from '@/constants';
import type { LoadBalancer, LoadBalancerType } from '@/types';

function LBTypeBadge({ type }: { type: LoadBalancerType }) {
  const colorMap: Record<LoadBalancerType, 'blue' | 'green' | 'grey' | 'red'> = {
    application: 'blue',
    network: 'green',
    gateway: 'grey',
    classic: 'red',
  };
  const labelMap: Record<LoadBalancerType, string> = {
    application: 'ALB',
    network: 'NLB',
    gateway: 'GWLB',
    classic: 'CLB',
  };
  return <Badge color={colorMap[type]}>{labelMap[type]}</Badge>;
}

export function LoadBalancersPage() {
  const [selectedItems, setSelectedItems] = useState<LoadBalancer[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredItems = useMemo(() => {
    if (!filterText) return loadBalancers;
    const lowerFilter = filterText.toLowerCase();
    return loadBalancers.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.dnsName.toLowerCase().includes(lowerFilter) ||
        item.type.toLowerCase().includes(lowerFilter)
    );
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
                <Button disabled={selectedItems.length !== 1}>View details</Button>
                <Button disabled={selectedItems.length === 0}>Delete</Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create load balancer
                </Button>
              </SpaceBetween>
            }
            description="Distribute incoming traffic across multiple targets"
          >
            Load Balancers
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Name',
            cell: (item) => (
              <Link href={`/compute/load-balancers/${item.name}`}>{item.name}</Link>
            ),
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'type',
            header: 'Type',
            cell: (item) => <LBTypeBadge type={item.type} />,
            sortingField: 'type',
          },
          {
            id: 'state',
            header: 'State',
            cell: (item) => <LoadBalancerStateIndicator state={item.state} />,
            sortingField: 'state',
          },
          {
            id: 'scheme',
            header: 'Scheme',
            cell: (item) => (
              <Badge color={item.scheme === 'internet-facing' ? 'blue' : 'grey'}>
                {item.scheme}
              </Badge>
            ),
          },
          {
            id: 'dns',
            header: 'DNS name',
            cell: (item) => (
              <Box fontSize="body-s" color="text-body-secondary">
                {item.dnsName}
              </Box>
            ),
          },
          {
            id: 'vpc',
            header: 'VPC',
            cell: (item) => <Link href={`/networking/vpcs/${item.vpcId}`}>{item.vpcId}</Link>,
          },
          {
            id: 'azs',
            header: 'Availability zones',
            cell: (item) => item.availabilityZones.length,
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
            filteringPlaceholder="Find load balancers"
            filteringAriaLabel="Filter load balancers"
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
            title="No load balancers"
            description="No load balancers found. Create one to distribute traffic to your targets."
            actionLabel="Create load balancer"
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      <CreateLoadBalancerModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        onCreate={(data) => {
          console.log('Create load balancer:', data);
          setShowCreateModal(false);
        }}
      />
    </>
  );
}
