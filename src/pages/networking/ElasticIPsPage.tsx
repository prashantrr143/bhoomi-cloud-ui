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
import { elasticIPs, instances } from '@/data/mockData';
import type { ElasticIP } from '@/types';

const PAGE_SIZE = 10;

export function ElasticIPsPage() {
  const [selectedItems, setSelectedItems] = useState<ElasticIP[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [newEip, setNewEip] = useState({ name: '' });
  const [associateInstanceId, setAssociateInstanceId] = useState('');

  const filteredItems = useMemo(() => {
    if (!filterText) return elasticIPs;
    const lowerFilter = filterText.toLowerCase();
    return elasticIPs.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.publicIp.toLowerCase().includes(lowerFilter) ||
        item.allocationId.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const runningInstances = instances.filter((i) => i.status === 'running');
  const instanceOptions = runningInstances.map((instance) => ({
    label: `${instance.name} (${instance.id})`,
    value: instance.id,
  }));

  const handleAllocate = () => {
    console.log('Allocating Elastic IP:', newEip);
    setShowAllocateModal(false);
    setNewEip({ name: '' });
  };

  const handleAssociate = () => {
    console.log('Associating with instance:', associateInstanceId);
    setShowAssociateModal(false);
    setAssociateInstanceId('');
  };

  const canAssociate = selectedItems.length === 1 && !selectedItems[0].associationId;
  const canDisassociate = selectedItems.length === 1 && selectedItems[0].associationId;

  return (
    <>
      <Table
        header={
          <Header
            variant="h1"
            counter={`(${filteredItems.length})`}
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button disabled={!canAssociate} onClick={() => setShowAssociateModal(true)}>
                  Associate
                </Button>
                <Button disabled={!canDisassociate}>Disassociate</Button>
                <Button disabled={selectedItems.length === 0}>Release</Button>
                <Button variant="primary" onClick={() => setShowAllocateModal(true)}>
                  Allocate Elastic IP
                </Button>
              </SpaceBetween>
            }
            description="Elastic IP addresses are static IPv4 addresses for dynamic cloud computing"
          >
            Elastic IPs
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Name',
            cell: (item) => (
              <Link href={`/networking/elastic-ips/${item.allocationId}`}>{item.name || '-'}</Link>
            ),
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'allocationId',
            header: 'Allocation ID',
            cell: (item) => item.allocationId,
            sortingField: 'allocationId',
          },
          {
            id: 'publicIp',
            header: 'Elastic IP',
            cell: (item) => item.publicIp,
            sortingField: 'publicIp',
          },
          {
            id: 'associated',
            header: 'Associated',
            cell: (item) =>
              item.associationId ? (
                <Badge color="green">Yes</Badge>
              ) : (
                <Badge color="grey">No</Badge>
              ),
          },
          {
            id: 'instanceId',
            header: 'Instance ID',
            cell: (item) =>
              item.instanceId ? (
                <Link href={`/compute/instances/${item.instanceId}`}>{item.instanceId}</Link>
              ) : (
                '-'
              ),
          },
          {
            id: 'privateIp',
            header: 'Private IP',
            cell: (item) => item.privateIp || '-',
          },
          {
            id: 'domain',
            header: 'Scope',
            cell: (item) => (item.domain === 'vpc' ? 'VPC' : 'EC2-Classic'),
          },
        ]}
        items={paginatedItems}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="allocationId"
        filter={
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder="Find Elastic IPs"
            filteringAriaLabel="Filter Elastic IPs"
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
            title="No Elastic IPs"
            description="No Elastic IP addresses found. Allocate an Elastic IP for a static public IP."
            actionLabel="Allocate Elastic IP"
            onAction={() => setShowAllocateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      {/* Allocate Modal */}
      <Modal
        visible={showAllocateModal}
        onDismiss={() => setShowAllocateModal(false)}
        header="Allocate Elastic IP address"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowAllocateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAllocate}>
                Allocate
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField
              label="Name"
              description="A name tag for your Elastic IP address (optional)"
            >
              <Input
                value={newEip.name}
                onChange={({ detail }) => setNewEip({ name: detail.value })}
                placeholder="my-elastic-ip"
              />
            </FormField>
            <Box variant="p" color="text-body-secondary">
              An Elastic IP address will be allocated from Bhoomi's pool of public IPv4 addresses.
            </Box>
          </SpaceBetween>
        </Form>
      </Modal>

      {/* Associate Modal */}
      <Modal
        visible={showAssociateModal}
        onDismiss={() => setShowAssociateModal(false)}
        header="Associate Elastic IP address"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowAssociateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAssociate} disabled={!associateInstanceId}>
                Associate
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <Box variant="p">
              Elastic IP: <strong>{selectedItems[0]?.publicIp}</strong>
            </Box>
            <FormField
              label="Instance"
              description="Select a running instance to associate with this Elastic IP"
            >
              <Select
                selectedOption={
                  associateInstanceId
                    ? instanceOptions.find((o) => o.value === associateInstanceId) || null
                    : null
                }
                onChange={({ detail }) => setAssociateInstanceId(detail.selectedOption.value || '')}
                options={instanceOptions}
                placeholder="Select an instance"
                empty="No running instances available"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}
