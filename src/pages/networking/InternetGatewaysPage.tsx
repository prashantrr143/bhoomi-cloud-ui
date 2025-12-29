import { useState, useMemo } from 'react';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Form from '@cloudscape-design/components/form';
import { EmptyState } from '@/components/common';
import { internetGateways, vpcs } from '@/data/mockData';
import type { InternetGateway } from '@/types';

const PAGE_SIZE = 10;

function getStatusIndicator(state: InternetGateway['state']) {
  switch (state) {
    case 'attached':
      return <StatusIndicator type="success">Attached</StatusIndicator>;
    case 'attaching':
      return <StatusIndicator type="in-progress">Attaching</StatusIndicator>;
    case 'detached':
      return <StatusIndicator type="stopped">Detached</StatusIndicator>;
    case 'detaching':
      return <StatusIndicator type="in-progress">Detaching</StatusIndicator>;
    case 'available':
      return <StatusIndicator type="success">Available</StatusIndicator>;
    default:
      return <StatusIndicator type="info">{state}</StatusIndicator>;
  }
}

export function InternetGatewaysPage() {
  const [selectedItems, setSelectedItems] = useState<InternetGateway[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [newGateway, setNewGateway] = useState({ name: '' });
  const [attachVpcId, setAttachVpcId] = useState('');

  const filteredItems = useMemo(() => {
    if (!filterText) return internetGateways;
    const lowerFilter = filterText.toLowerCase();
    return internetGateways.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.id.toLowerCase().includes(lowerFilter) ||
        (item.vpcId && item.vpcId.toLowerCase().includes(lowerFilter))
    );
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const availableVpcs = vpcs.filter(
    (vpc) => !internetGateways.some((igw) => igw.vpcId === vpc.id && igw.state === 'attached')
  );

  const vpcOptions = availableVpcs.map((vpc) => ({
    label: `${vpc.name} (${vpc.id})`,
    value: vpc.id,
  }));

  const handleCreate = () => {
    console.log('Creating internet gateway:', newGateway);
    setShowCreateModal(false);
    setNewGateway({ name: '' });
  };

  const handleAttach = () => {
    console.log('Attaching to VPC:', attachVpcId);
    setShowAttachModal(false);
    setAttachVpcId('');
  };

  const canAttach = selectedItems.length === 1 && selectedItems[0].state === 'detached';
  const canDetach = selectedItems.length === 1 && selectedItems[0].state === 'attached';

  return (
    <>
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredItems.length})`}
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button disabled={!canAttach} onClick={() => setShowAttachModal(true)}>
                  Attach to VPC
                </Button>
                <Button disabled={!canDetach}>Detach from VPC</Button>
                <Button disabled={selectedItems.length === 0}>Delete</Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create internet gateway
                </Button>
              </SpaceBetween>
            }
            description="Internet gateways enable communication between your VPC and the internet"
          >
            Internet Gateways
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Name',
            cell: (item) => (
              <Link href={`/networking/internet-gateways/${item.id}`}>{item.name || '-'}</Link>
            ),
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'id',
            header: 'Internet Gateway ID',
            cell: (item) => item.id,
            sortingField: 'id',
          },
          {
            id: 'state',
            header: 'State',
            cell: (item) => getStatusIndicator(item.state),
            sortingField: 'state',
          },
          {
            id: 'vpc',
            header: 'VPC ID',
            cell: (item) =>
              item.vpcId ? (
                <Link href={`/networking/vpcs/${item.vpcId}`}>{item.vpcId}</Link>
              ) : (
                '-'
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
            filteringPlaceholder="Find internet gateways"
            filteringAriaLabel="Filter internet gateways"
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
            title="No internet gateways"
            description="No internet gateways found. Create an internet gateway to enable internet access."
            actionLabel="Create internet gateway"
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        header="Create internet gateway"
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
            <FormField label="Name" description="A name tag for your internet gateway">
              <Input
                value={newGateway.name}
                onChange={({ detail }) => setNewGateway({ name: detail.value })}
                placeholder="my-internet-gateway"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>

      {/* Attach Modal */}
      <Modal
        visible={showAttachModal}
        onDismiss={() => setShowAttachModal(false)}
        header="Attach to VPC"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowAttachModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAttach} disabled={!attachVpcId}>
                Attach
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField
              label="VPC"
              description="Select a VPC to attach the internet gateway to. Only VPCs without an attached internet gateway are shown."
            >
              <Select
                selectedOption={
                  attachVpcId ? vpcOptions.find((o) => o.value === attachVpcId) || null : null
                }
                onChange={({ detail }) => setAttachVpcId(detail.selectedOption.value || '')}
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
