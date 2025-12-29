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
import Tabs from '@cloudscape-design/components/tabs';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import { EmptyState } from '@/components/common';
import { networkACLs, vpcs } from '@/data/mockData';
import type { NetworkACL, NetworkACLEntry } from '@/types';

const PAGE_SIZE = 10;

function RulesTable({ rules, direction }: { rules: NetworkACLEntry[]; direction: string }) {
  return (
    <Table
      columnDefinitions={[
        { id: 'rule', header: 'Rule #', cell: (item) => item.ruleNumber },
        { id: 'protocol', header: 'Protocol', cell: (item) => item.protocol === '-1' ? 'All' : item.protocol.toUpperCase() },
        { id: 'port', header: 'Port range', cell: (item) => item.portRange || 'All' },
        { id: 'source', header: direction === 'inbound' ? 'Source' : 'Destination', cell: (item) => item.cidrBlock },
        {
          id: 'action',
          header: 'Allow/Deny',
          cell: (item) =>
            item.ruleAction === 'allow' ? (
              <Badge color="green">ALLOW</Badge>
            ) : (
              <Badge color="red">DENY</Badge>
            ),
        },
      ]}
      items={rules}
      variant="embedded"
      empty={<Box textAlign="center">No rules</Box>}
    />
  );
}

export function NetworkACLsPage() {
  const [selectedItems, setSelectedItems] = useState<NetworkACL[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [newAcl, setNewAcl] = useState({ name: '', vpcId: '' });

  const filteredItems = useMemo(() => {
    if (!filterText) return networkACLs;
    const lowerFilter = filterText.toLowerCase();
    return networkACLs.filter(
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
    console.log('Creating Network ACL:', newAcl);
    setShowCreateModal(false);
    setNewAcl({ name: '', vpcId: '' });
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
                <Button
                  disabled={selectedItems.length !== 1}
                  onClick={() => setShowRulesModal(true)}
                >
                  View/Edit rules
                </Button>
                <Button disabled={selectedItems.length !== 1}>Edit associations</Button>
                <Button disabled={selectedItems.length === 0 || selectedItems.some(i => i.isDefault)}>
                  Delete
                </Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create network ACL
                </Button>
              </SpaceBetween>
            }
            description="Network ACLs act as a firewall at the subnet level"
          >
            Network ACLs
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Name',
            cell: (item) => (
              <Link href={`/networking/network-acls/${item.id}`}>{item.name || '-'}</Link>
            ),
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'id',
            header: 'Network ACL ID',
            cell: (item) => item.id,
            sortingField: 'id',
          },
          {
            id: 'vpc',
            header: 'VPC',
            cell: (item) => <Link href={`/networking/vpcs/${item.vpcId}`}>{item.vpcId}</Link>,
          },
          {
            id: 'default',
            header: 'Default',
            cell: (item) =>
              item.isDefault ? <Badge color="blue">Yes</Badge> : <Badge color="grey">No</Badge>,
          },
          {
            id: 'inbound',
            header: 'Inbound Rules',
            cell: (item) => item.inboundRules.length,
          },
          {
            id: 'outbound',
            header: 'Outbound Rules',
            cell: (item) => item.outboundRules.length,
          },
          {
            id: 'associations',
            header: 'Associations',
            cell: (item) => item.associations.length,
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
            filteringPlaceholder="Find network ACLs"
            filteringAriaLabel="Filter network ACLs"
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
            title="No network ACLs"
            description="No network ACLs found. Create a network ACL to control traffic at the subnet level."
            actionLabel="Create network ACL"
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
        header="Create network ACL"
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
            <FormField label="Name" description="A name tag for your network ACL">
              <Input
                value={newAcl.name}
                onChange={({ detail }) => setNewAcl({ ...newAcl, name: detail.value })}
                placeholder="my-network-acl"
              />
            </FormField>
            <FormField label="VPC" description="The VPC for this network ACL">
              <Select
                selectedOption={
                  newAcl.vpcId ? vpcOptions.find((o) => o.value === newAcl.vpcId) || null : null
                }
                onChange={({ detail }) =>
                  setNewAcl({ ...newAcl, vpcId: detail.selectedOption.value || '' })
                }
                options={vpcOptions}
                placeholder="Select a VPC"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>

      {/* View Rules Modal */}
      <Modal
        visible={showRulesModal}
        onDismiss={() => setShowRulesModal(false)}
        header={`Network ACL Rules - ${selectedItems[0]?.name || selectedItems[0]?.id}`}
        size="large"
        footer={
          <Box float="right">
            <Button onClick={() => setShowRulesModal(false)}>Close</Button>
          </Box>
        }
      >
        {selectedItems[0] && (
          <SpaceBetween size="l">
            <ColumnLayout columns={2}>
              <div>
                <Box variant="awsui-key-label">Network ACL ID</Box>
                <div>{selectedItems[0].id}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">VPC</Box>
                <div>{selectedItems[0].vpcId}</div>
              </div>
            </ColumnLayout>

            <Tabs
              tabs={[
                {
                  id: 'inbound',
                  label: 'Inbound rules',
                  content: (
                    <SpaceBetween size="m">
                      <Box variant="p" color="text-body-secondary">
                        Inbound rules control traffic entering the subnets associated with this ACL.
                      </Box>
                      <RulesTable rules={selectedItems[0].inboundRules} direction="inbound" />
                    </SpaceBetween>
                  ),
                },
                {
                  id: 'outbound',
                  label: 'Outbound rules',
                  content: (
                    <SpaceBetween size="m">
                      <Box variant="p" color="text-body-secondary">
                        Outbound rules control traffic leaving the subnets associated with this ACL.
                      </Box>
                      <RulesTable rules={selectedItems[0].outboundRules} direction="outbound" />
                    </SpaceBetween>
                  ),
                },
              ]}
            />
          </SpaceBetween>
        )}
      </Modal>
    </>
  );
}
