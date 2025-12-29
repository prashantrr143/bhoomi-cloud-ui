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
import RadioGroup from '@cloudscape-design/components/radio-group';
import { EmptyState } from '@/components/common';
import { natGateways, subnets, elasticIPs } from '@/data/mockData';
import type { NATGateway } from '@/types';

const PAGE_SIZE = 10;

function getStatusIndicator(state: NATGateway['state']) {
  switch (state) {
    case 'available':
      return <StatusIndicator type="success">Available</StatusIndicator>;
    case 'pending':
      return <StatusIndicator type="pending">Pending</StatusIndicator>;
    case 'deleting':
      return <StatusIndicator type="in-progress">Deleting</StatusIndicator>;
    case 'deleted':
      return <StatusIndicator type="stopped">Deleted</StatusIndicator>;
    case 'failed':
      return <StatusIndicator type="error">Failed</StatusIndicator>;
    default:
      return <StatusIndicator type="info">{state}</StatusIndicator>;
  }
}

export function NATGatewaysPage() {
  const [selectedItems, setSelectedItems] = useState<NATGateway[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNatGateway, setNewNatGateway] = useState({
    name: '',
    subnetId: '',
    connectivityType: 'public',
    elasticIpAllocationId: '',
  });

  const filteredItems = useMemo(() => {
    if (!filterText) return natGateways;
    const lowerFilter = filterText.toLowerCase();
    return natGateways.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.id.toLowerCase().includes(lowerFilter) ||
        item.elasticIp.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const subnetOptions = subnets.map((subnet) => ({
    label: `${subnet.name} (${subnet.id}) - ${subnet.availabilityZone}`,
    value: subnet.id,
  }));

  const availableEips = elasticIPs.filter((eip) => !eip.associationId);
  const eipOptions = availableEips.map((eip) => ({
    label: `${eip.publicIp} (${eip.allocationId})`,
    value: eip.allocationId,
  }));

  const handleCreate = () => {
    console.log('Creating NAT gateway:', newNatGateway);
    setShowCreateModal(false);
    setNewNatGateway({
      name: '',
      subnetId: '',
      connectivityType: 'public',
      elasticIpAllocationId: '',
    });
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
                <Button disabled={selectedItems.length !== 1}>View details</Button>
                <Button disabled={selectedItems.length === 0}>Delete</Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create NAT gateway
                </Button>
              </SpaceBetween>
            }
            description="NAT gateways enable instances in private subnets to connect to the internet"
          >
            NAT Gateways
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Name',
            cell: (item) => (
              <Link href={`/networking/nat-gateways/${item.id}`}>{item.name || '-'}</Link>
            ),
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'id',
            header: 'NAT Gateway ID',
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
            id: 'elasticIp',
            header: 'Elastic IP',
            cell: (item) => item.elasticIp,
          },
          {
            id: 'privateIp',
            header: 'Private IP',
            cell: (item) => item.privateIp,
          },
          {
            id: 'subnet',
            header: 'Subnet',
            cell: (item) => (
              <Link href={`/networking/subnets/${item.subnetId}`}>{item.subnetId}</Link>
            ),
          },
          {
            id: 'vpc',
            header: 'VPC',
            cell: (item) => <Link href={`/networking/vpcs/${item.vpcId}`}>{item.vpcId}</Link>,
          },
          {
            id: 'created',
            header: 'Created',
            cell: (item) => new Date(item.createdAt).toLocaleDateString(),
            sortingField: 'createdAt',
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
            filteringPlaceholder="Find NAT gateways"
            filteringAriaLabel="Filter NAT gateways"
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
            title="No NAT gateways"
            description="No NAT gateways found. Create a NAT gateway to enable outbound internet access for private subnets."
            actionLabel="Create NAT gateway"
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        header="Create NAT gateway"
        size="medium"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                Create NAT gateway
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label="Name" description="A name tag for your NAT gateway">
              <Input
                value={newNatGateway.name}
                onChange={({ detail }) =>
                  setNewNatGateway({ ...newNatGateway, name: detail.value })
                }
                placeholder="my-nat-gateway"
              />
            </FormField>

            <FormField
              label="Subnet"
              description="The public subnet in which to create the NAT gateway"
            >
              <Select
                selectedOption={
                  newNatGateway.subnetId
                    ? subnetOptions.find((o) => o.value === newNatGateway.subnetId) || null
                    : null
                }
                onChange={({ detail }) =>
                  setNewNatGateway({
                    ...newNatGateway,
                    subnetId: detail.selectedOption.value || '',
                  })
                }
                options={subnetOptions}
                placeholder="Select a subnet"
              />
            </FormField>

            <FormField label="Connectivity type">
              <RadioGroup
                value={newNatGateway.connectivityType}
                onChange={({ detail }) =>
                  setNewNatGateway({ ...newNatGateway, connectivityType: detail.value })
                }
                items={[
                  {
                    value: 'public',
                    label: 'Public',
                    description: 'Instances can connect to the internet and receive unsolicited inbound connections',
                  },
                  {
                    value: 'private',
                    label: 'Private',
                    description: 'Instances can connect to other VPCs or on-premises networks',
                  },
                ]}
              />
            </FormField>

            {newNatGateway.connectivityType === 'public' && (
              <FormField
                label="Elastic IP allocation ID"
                description="Select an existing Elastic IP or allocate a new one"
              >
                <Select
                  selectedOption={
                    newNatGateway.elasticIpAllocationId
                      ? eipOptions.find((o) => o.value === newNatGateway.elasticIpAllocationId) ||
                        null
                      : null
                  }
                  onChange={({ detail }) =>
                    setNewNatGateway({
                      ...newNatGateway,
                      elasticIpAllocationId: detail.selectedOption.value || '',
                    })
                  }
                  options={eipOptions}
                  placeholder="Select an Elastic IP"
                  empty="No unassociated Elastic IPs available"
                />
              </FormField>
            )}
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}
