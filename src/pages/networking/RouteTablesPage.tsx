import { useState, useMemo } from 'react';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import Badge from '@cloudscape-design/components/badge';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Form from '@cloudscape-design/components/form';
import { EmptyState } from '@/components/common';
import { routeTables, vpcs } from '@/data/mockData';
import type { RouteTable } from '@/types';

const PAGE_SIZE = 10;

export function RouteTablesPage() {
  const [selectedItems, setSelectedItems] = useState<RouteTable[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRouteTable, setNewRouteTable] = useState({ name: '', vpcId: '' });

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

  const vpcOptions = vpcs.map((vpc) => ({
    label: `${vpc.name} (${vpc.id})`,
    value: vpc.id,
  }));

  const handleCreate = () => {
    console.log('Creating route table:', newRouteTable);
    setShowCreateModal(false);
    setNewRouteTable({ name: '', vpcId: '' });
  };

  return (
    <>
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
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
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
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        header="Create route table"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                Create
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label="Name" description="A name tag for your route table">
              <Input
                value={newRouteTable.name}
                onChange={({ detail }) =>
                  setNewRouteTable({ ...newRouteTable, name: detail.value })
                }
                placeholder="my-route-table"
              />
            </FormField>
            <FormField label="VPC" description="The VPC for this route table">
              <Select
                selectedOption={
                  newRouteTable.vpcId
                    ? vpcOptions.find((o) => o.value === newRouteTable.vpcId) || null
                    : null
                }
                onChange={({ detail }) =>
                  setNewRouteTable({
                    ...newRouteTable,
                    vpcId: detail.selectedOption.value || '',
                  })
                }
                options={vpcOptions}
                placeholder="Select a VPC"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}
