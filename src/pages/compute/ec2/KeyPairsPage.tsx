import { useState, useMemo } from 'react';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Form from '@cloudscape-design/components/form';
import Alert from '@cloudscape-design/components/alert';
import Badge from '@cloudscape-design/components/badge';
import { EmptyState } from '@/components/common';
import { keyPairs } from '@/data/mockData';
import type { KeyPair } from '@/types';

const PAGE_SIZE = 10;

export function KeyPairsPage() {
  const [selectedItems, setSelectedItems] = useState<KeyPair[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newKeyPair, setNewKeyPair] = useState({
    name: '',
    type: 'rsa' as 'rsa' | 'ed25519',
  });
  const [importKeyPair, setImportKeyPair] = useState({
    name: '',
    publicKey: '',
  });

  const filteredItems = useMemo(() => {
    if (!filterText) return keyPairs;
    const lowerFilter = filterText.toLowerCase();
    return keyPairs.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.fingerprint.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const handleCreate = () => {
    console.log('Creating key pair:', newKeyPair);
    // Mock: Would download the private key file
    alert(`Key pair "${newKeyPair.name}" created! Private key would be downloaded as ${newKeyPair.name}.pem`);
    setShowCreateModal(false);
    setNewKeyPair({ name: '', type: 'rsa' });
  };

  const handleImport = () => {
    console.log('Importing key pair:', importKeyPair);
    setShowImportModal(false);
    setImportKeyPair({ name: '', publicKey: '' });
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
                <Button disabled={selectedItems.length === 0}>Delete</Button>
                <Button onClick={() => setShowImportModal(true)}>Import key pair</Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create key pair
                </Button>
              </SpaceBetween>
            }
            description="Key pairs are used to securely connect to your instances via SSH"
          >
            Key Pairs
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Name',
            cell: (item) => <strong>{item.name}</strong>,
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'type',
            header: 'Type',
            cell: (item) => (
              <Badge color={item.type === 'ed25519' ? 'blue' : 'grey'}>
                {item.type.toUpperCase()}
              </Badge>
            ),
            sortingField: 'type',
          },
          {
            id: 'fingerprint',
            header: 'Fingerprint',
            cell: (item) => (
              <Box fontFamily="monospace" fontSize="body-s">
                {item.fingerprint}
              </Box>
            ),
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
        trackBy="name"
        filter={
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder="Find key pairs"
            filteringAriaLabel="Filter key pairs"
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
            title="No key pairs"
            description="No key pairs found. Create a key pair to connect to your instances."
            actionLabel="Create key pair"
            onAction={() => setShowCreateModal(true)}
          />
        }
        stickyHeader
        variant="full-page"
      />

      {/* Create Key Pair Modal */}
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        header="Create key pair"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreate} disabled={!newKeyPair.name}>
                Create key pair
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <Alert type="warning">
              After you create a key pair, you will be able to download the private key file only once.
              Store it securely as you cannot download it again.
            </Alert>

            <FormField label="Name" description="A unique name for your key pair">
              <Input
                value={newKeyPair.name}
                onChange={({ detail }) => setNewKeyPair({ ...newKeyPair, name: detail.value })}
                placeholder="my-key-pair"
              />
            </FormField>

            <FormField label="Key pair type" description="ED25519 keys are faster and more secure. RSA keys are more widely compatible.">
              <RadioGroup
                value={newKeyPair.type}
                onChange={({ detail }) =>
                  setNewKeyPair({ ...newKeyPair, type: detail.value as 'rsa' | 'ed25519' })
                }
                items={[
                  {
                    value: 'rsa',
                    label: 'RSA',
                    description: '2048-bit RSA key, widely compatible with older SSH clients',
                  },
                  {
                    value: 'ed25519',
                    label: 'ED25519',
                    description: 'Modern elliptic curve key, more secure and faster (Recommended)',
                  },
                ]}
              />
            </FormField>

            <FormField label="Private key file format">
              <RadioGroup
                value="pem"
                items={[
                  { value: 'pem', label: '.pem', description: 'For use with OpenSSH' },
                  { value: 'ppk', label: '.ppk', description: 'For use with PuTTY' },
                ]}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>

      {/* Import Key Pair Modal */}
      <Modal
        visible={showImportModal}
        onDismiss={() => setShowImportModal(false)}
        header="Import key pair"
        size="medium"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={!importKeyPair.name || !importKeyPair.publicKey}
              >
                Import key pair
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <Alert type="info">
              You can import the public key from an RSA or ED25519 key pair that you created with a
              third-party tool.
            </Alert>

            <FormField label="Name" description="A unique name for your key pair">
              <Input
                value={importKeyPair.name}
                onChange={({ detail }) => setImportKeyPair({ ...importKeyPair, name: detail.value })}
                placeholder="my-imported-key"
              />
            </FormField>

            <FormField
              label="Public key contents"
              description="Paste the contents of your public key file (e.g., id_rsa.pub)"
            >
              <Input
                value={importKeyPair.publicKey}
                onChange={({ detail }) =>
                  setImportKeyPair({ ...importKeyPair, publicKey: detail.value })
                }
                placeholder="ssh-rsa AAAAB3NzaC1... or ssh-ed25519 AAAA..."
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
}
