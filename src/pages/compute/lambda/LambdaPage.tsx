import { useState, useMemo } from 'react';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import { EmptyState } from '@/components/common';
import { LambdaStateIndicator } from '@/components/indicators';
import { lambdaFunctions } from '@/data/mockData';
import { CreateFunctionModal } from './CreateFunctionModal';
import { formatDateTime } from '@/utils/formatters';
import { PAGE_SIZE } from '@/constants';
import type { LambdaFunction } from '@/types';

export function LambdaPage() {
  const [selectedItems, setSelectedItems] = useState<LambdaFunction[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredItems = useMemo(() => {
    if (!filterText) return lambdaFunctions;
    const lowerFilter = filterText.toLowerCase();
    return lambdaFunctions.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.runtime.toLowerCase().includes(lowerFilter) ||
        item.description.toLowerCase().includes(lowerFilter)
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
                  Create function
                </Button>
              </SpaceBetween>
            }
            description="Run code without provisioning or managing servers"
          >
            Lambda Functions
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Function name',
            cell: (item) => <Link href={`/compute/lambda/${item.name}`}>{item.name}</Link>,
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'description',
            header: 'Description',
            cell: (item) => item.description || '-',
          },
          {
            id: 'runtime',
            header: 'Runtime',
            cell: (item) => item.runtime,
            sortingField: 'runtime',
          },
          {
            id: 'memory',
            header: 'Memory',
            cell: (item) => `${item.memorySize} MB`,
            sortingField: 'memorySize',
          },
          {
            id: 'timeout',
            header: 'Timeout',
            cell: (item) => `${item.timeout}s`,
          },
          {
            id: 'state',
            header: 'State',
            cell: (item) => <LambdaStateIndicator state={item.state} />,
            sortingField: 'state',
          },
          {
            id: 'lastModified',
            header: 'Last modified',
            cell: (item) => formatDateTime(item.lastModified),
            sortingField: 'lastModified',
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
            filteringPlaceholder="Find functions"
            filteringAriaLabel="Filter functions"
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
            title="No functions"
            description="No Lambda functions found. Create your first function to get started."
            actionLabel="Create function"
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      <CreateFunctionModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        onCreate={(data) => {
          console.log('Create function:', data);
          setShowCreateModal(false);
        }}
      />
    </>
  );
}
