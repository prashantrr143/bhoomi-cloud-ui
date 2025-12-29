import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Wizard from '@cloudscape-design/components/wizard';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Tiles from '@cloudscape-design/components/tiles';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import Checkbox from '@cloudscape-design/components/checkbox';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import TextFilter from '@cloudscape-design/components/text-filter';
import Tabs from '@cloudscape-design/components/tabs';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import Multiselect from '@cloudscape-design/components/multiselect';
import RadioGroup from '@cloudscape-design/components/radio-group';
import {
  amis,
  instanceTypes,
  keyPairs,
  vpcs,
  subnets,
  securityGroups,
} from '@/data/mockData';
import type { AMI, InstanceType, StorageConfig, InstanceFamily } from '@/types';

interface LaunchConfig {
  name: string;
  amiId: string;
  instanceType: string;
  keyPairName: string;
  vpcId: string;
  subnetId: string;
  securityGroupIds: string[];
  storageConfig: StorageConfig[];
  publicIpEnabled: boolean;
  instanceCount: number;
  userData: string;
}

const initialConfig: LaunchConfig = {
  name: '',
  amiId: '',
  instanceType: 't3.micro',
  keyPairName: '',
  vpcId: '',
  subnetId: '',
  securityGroupIds: [],
  storageConfig: [
    {
      deviceName: '/dev/xvda',
      volumeType: 'gp3',
      volumeSize: 8,
      iops: 3000,
      throughput: 125,
      encrypted: true,
      deleteOnTermination: true,
    },
  ],
  publicIpEnabled: true,
  instanceCount: 1,
  userData: '',
};

const instanceFamilyLabels: Record<InstanceFamily, string> = {
  general: 'General Purpose',
  compute: 'Compute Optimized',
  memory: 'Memory Optimized',
  storage: 'Storage Optimized',
  accelerated: 'Accelerated Computing',
  hpc: 'HPC Optimized',
};

const volumeTypeOptions = [
  { value: 'gp3', label: 'General Purpose SSD (gp3)', description: 'Best price performance for most workloads' },
  { value: 'gp2', label: 'General Purpose SSD (gp2)', description: 'Legacy general purpose SSD' },
  { value: 'io2', label: 'Provisioned IOPS SSD (io2)', description: 'Highest performance SSD for critical workloads' },
  { value: 'io1', label: 'Provisioned IOPS SSD (io1)', description: 'Legacy provisioned IOPS SSD' },
  { value: 'st1', label: 'Throughput Optimized HDD (st1)', description: 'Low cost HDD for frequently accessed data' },
  { value: 'sc1', label: 'Cold HDD (sc1)', description: 'Lowest cost HDD for infrequently accessed data' },
];

export function LaunchInstanceWizard() {
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [config, setConfig] = useState<LaunchConfig>(initialConfig);
  const [amiFilter, setAmiFilter] = useState('');
  const [instanceTypeFilter, setInstanceTypeFilter] = useState('');
  const [selectedInstanceFamily, setSelectedInstanceFamily] = useState<InstanceFamily | 'all'>('all');

  // AMI filtering
  const filteredAmis = useMemo(() => {
    if (!amiFilter) return amis;
    const lower = amiFilter.toLowerCase();
    return amis.filter(
      (ami) =>
        ami.name.toLowerCase().includes(lower) ||
        ami.description.toLowerCase().includes(lower) ||
        ami.id.toLowerCase().includes(lower)
    );
  }, [amiFilter]);

  // Instance type filtering
  const filteredInstanceTypes = useMemo(() => {
    let filtered = instanceTypes;
    if (selectedInstanceFamily !== 'all') {
      filtered = filtered.filter((t) => t.family === selectedInstanceFamily);
    }
    if (instanceTypeFilter) {
      const lower = instanceTypeFilter.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower)
      );
    }
    return filtered;
  }, [selectedInstanceFamily, instanceTypeFilter]);

  // Get selected AMI details
  const selectedAmi = useMemo(() => amis.find((a) => a.id === config.amiId), [config.amiId]);
  const selectedInstanceType = useMemo(
    () => instanceTypes.find((t) => t.name === config.instanceType),
    [config.instanceType]
  );

  // Get filtered subnets based on VPC
  const filteredSubnets = useMemo(
    () => subnets.filter((s) => s.vpcId === config.vpcId),
    [config.vpcId]
  );

  // Get filtered security groups based on VPC
  const filteredSecurityGroups = useMemo(
    () => securityGroups.filter((sg) => sg.vpcId === config.vpcId),
    [config.vpcId]
  );

  const updateStorage = (index: number, updates: Partial<StorageConfig>) => {
    const newStorage = [...config.storageConfig];
    newStorage[index] = { ...newStorage[index], ...updates };
    setConfig({ ...config, storageConfig: newStorage });
  };

  const addVolume = () => {
    const deviceNames = ['/dev/xvdb', '/dev/xvdc', '/dev/xvdd', '/dev/xvde', '/dev/xvdf'];
    const usedDevices = config.storageConfig.map((s) => s.deviceName);
    const nextDevice = deviceNames.find((d) => !usedDevices.includes(d)) || '/dev/xvdg';

    setConfig({
      ...config,
      storageConfig: [
        ...config.storageConfig,
        {
          deviceName: nextDevice,
          volumeType: 'gp3',
          volumeSize: 100,
          iops: 3000,
          throughput: 125,
          encrypted: true,
          deleteOnTermination: true,
        },
      ],
    });
  };

  const removeVolume = (index: number) => {
    if (index === 0) return; // Can't remove root volume
    const newStorage = config.storageConfig.filter((_, i) => i !== index);
    setConfig({ ...config, storageConfig: newStorage });
  };

  const handleLaunch = () => {
    console.log('Launching instance with config:', config);
    // Mock launch - would call API here
    navigate('/compute/instances');
  };

  // Step 1: Name and AMI
  const step1Content = (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">Name and tags</Header>}>
        <FormField label="Name" description="Create a name for your instance">
          <Input
            value={config.name}
            onChange={({ detail }) => setConfig({ ...config, name: detail.value })}
            placeholder="My Instance"
          />
        </FormField>
      </Container>

      <Container
        header={
          <Header variant="h2" description="An AMI is a template that contains the software configuration required to launch your instance">
            Application and OS Images (Amazon Machine Image)
          </Header>
        }
      >
        <SpaceBetween size="m">
          <Tabs
            tabs={[
              {
                id: 'quickstart',
                label: 'Quick Start',
                content: (
                  <SpaceBetween size="m">
                    <TextFilter
                      filteringText={amiFilter}
                      filteringPlaceholder="Search AMIs"
                      onChange={({ detail }) => setAmiFilter(detail.filteringText)}
                    />
                    <Tiles
                      columns={1}
                      value={config.amiId}
                      onChange={({ detail }) => setConfig({ ...config, amiId: detail.value })}
                      items={filteredAmis.slice(0, 8).map((ami) => ({
                        value: ami.id,
                        label: ami.name,
                        description: (
                          <SpaceBetween size="xs" direction="horizontal">
                            <span>{ami.description}</span>
                            {ami.isFreeTier && <Badge color="green">Free tier eligible</Badge>}
                          </SpaceBetween>
                        ),
                        image: (
                          <Box padding="xs">
                            {ami.platform === 'linux' && '🐧'}
                            {ami.platform === 'windows' && '🪟'}
                            {ami.platform === 'macos' && '🍎'}
                          </Box>
                        ),
                      }))}
                    />
                  </SpaceBetween>
                ),
              },
              {
                id: 'myamis',
                label: 'My AMIs',
                content: (
                  <Box textAlign="center" padding="l">
                    <Box variant="p" color="text-body-secondary">
                      You don't have any private AMIs yet.
                    </Box>
                  </Box>
                ),
              },
              {
                id: 'marketplace',
                label: 'Marketplace',
                content: (
                  <Table
                    items={filteredAmis.filter((a) => a.owner === 'marketplace')}
                    columnDefinitions={[
                      { id: 'name', header: 'Name', cell: (item) => item.name },
                      { id: 'description', header: 'Description', cell: (item) => item.description },
                      { id: 'platform', header: 'Platform', cell: (item) => item.platform },
                      { id: 'arch', header: 'Architecture', cell: (item) => item.architecture },
                    ]}
                    selectionType="single"
                    selectedItems={selectedAmi ? [selectedAmi] : []}
                    onSelectionChange={({ detail }) =>
                      setConfig({ ...config, amiId: detail.selectedItems[0]?.id || '' })
                    }
                    empty={<Box textAlign="center">No marketplace AMIs found</Box>}
                  />
                ),
              },
            ]}
          />

          {selectedAmi && (
            <Alert type="info">
              <strong>Selected:</strong> {selectedAmi.name} ({selectedAmi.id}) - {selectedAmi.architecture},{' '}
              {selectedAmi.platform}
            </Alert>
          )}
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );

  // Step 2: Instance Type
  const step2Content = (
    <Container
      header={
        <Header variant="h2" description="Instance types comprise varying combinations of CPU, memory, storage, and networking capacity">
          Instance type
        </Header>
      }
    >
      <SpaceBetween size="m">
        <ColumnLayout columns={2}>
          <FormField label="Filter by family">
            <Select
              selectedOption={{ value: selectedInstanceFamily, label: selectedInstanceFamily === 'all' ? 'All instance families' : instanceFamilyLabels[selectedInstanceFamily] }}
              onChange={({ detail }) => setSelectedInstanceFamily(detail.selectedOption.value as InstanceFamily | 'all')}
              options={[
                { value: 'all', label: 'All instance families' },
                ...Object.entries(instanceFamilyLabels).map(([value, label]) => ({ value, label })),
              ]}
            />
          </FormField>
          <FormField label="Search">
            <TextFilter
              filteringText={instanceTypeFilter}
              filteringPlaceholder="Filter instance types"
              onChange={({ detail }) => setInstanceTypeFilter(detail.filteringText)}
            />
          </FormField>
        </ColumnLayout>

        <Table
          items={filteredInstanceTypes}
          columnDefinitions={[
            {
              id: 'name',
              header: 'Instance type',
              cell: (item) => (
                <SpaceBetween size="xs" direction="horizontal">
                  <strong>{item.name}</strong>
                  {item.name === 't3.micro' && <Badge color="green">Free tier</Badge>}
                </SpaceBetween>
              ),
              sortingField: 'name',
            },
            {
              id: 'family',
              header: 'Family',
              cell: (item) => instanceFamilyLabels[item.family],
            },
            { id: 'vcpus', header: 'vCPUs', cell: (item) => item.vCPUs },
            { id: 'memory', header: 'Memory', cell: (item) => item.memory },
            { id: 'storage', header: 'Storage', cell: (item) => item.storage },
            { id: 'network', header: 'Network', cell: (item) => item.networkPerformance },
            {
              id: 'price',
              header: 'On-Demand Price/hr',
              cell: (item) => `$${item.pricePerHour.toFixed(4)}`,
            },
          ]}
          selectionType="single"
          selectedItems={selectedInstanceType ? [selectedInstanceType] : []}
          onSelectionChange={({ detail }) =>
            setConfig({ ...config, instanceType: detail.selectedItems[0]?.name || 't3.micro' })
          }
          stickyHeader
          variant="embedded"
          empty={<Box textAlign="center">No instance types match the filter</Box>}
        />

        {selectedInstanceType && (
          <Alert type="info">
            <ColumnLayout columns={4}>
              <div>
                <Box variant="awsui-key-label">Selected</Box>
                <div>{selectedInstanceType.name}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">vCPUs</Box>
                <div>{selectedInstanceType.vCPUs}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Memory</Box>
                <div>{selectedInstanceType.memory}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Est. Monthly Cost</Box>
                <div>${(selectedInstanceType.pricePerHour * 730).toFixed(2)}</div>
              </div>
            </ColumnLayout>
          </Alert>
        )}
      </SpaceBetween>
    </Container>
  );

  // Step 3: Key Pair
  const step3Content = (
    <Container
      header={
        <Header
          variant="h2"
          description="A key pair is needed to securely connect to your instance. You can create a new key pair or use an existing one."
        >
          Key pair (login)
        </Header>
      }
    >
      <SpaceBetween size="m">
        <FormField label="Key pair name">
          <Select
            selectedOption={
              config.keyPairName
                ? { value: config.keyPairName, label: config.keyPairName }
                : null
            }
            onChange={({ detail }) =>
              setConfig({ ...config, keyPairName: detail.selectedOption?.value || '' })
            }
            options={[
              { value: '', label: 'Proceed without a key pair (Not recommended)' },
              ...keyPairs.map((kp) => ({
                value: kp.name,
                label: kp.name,
                description: `Type: ${kp.type.toUpperCase()} | Created: ${new Date(kp.createdAt).toLocaleDateString()}`,
              })),
            ]}
            placeholder="Select a key pair"
          />
        </FormField>

        <Box>
          <Button iconName="add-plus" onClick={() => console.log('Create key pair')}>
            Create new key pair
          </Button>
        </Box>

        {!config.keyPairName && (
          <Alert type="warning">
            Without a key pair, you won't be able to connect to your instance using SSH.
          </Alert>
        )}
      </SpaceBetween>
    </Container>
  );

  // Step 4: Network Settings
  const step4Content = (
    <Container
      header={
        <Header variant="h2" description="Configure the network settings for your instance">
          Network settings
        </Header>
      }
    >
      <SpaceBetween size="l">
        <ColumnLayout columns={2}>
          <FormField label="VPC">
            <Select
              selectedOption={
                config.vpcId
                  ? {
                      value: config.vpcId,
                      label: vpcs.find((v) => v.id === config.vpcId)?.name || config.vpcId,
                    }
                  : null
              }
              onChange={({ detail }) =>
                setConfig({
                  ...config,
                  vpcId: detail.selectedOption?.value || '',
                  subnetId: '',
                  securityGroupIds: [],
                })
              }
              options={vpcs.map((vpc) => ({
                value: vpc.id,
                label: `${vpc.name} (${vpc.id})`,
                description: vpc.cidrBlock,
              }))}
              placeholder="Select a VPC"
            />
          </FormField>

          <FormField label="Subnet">
            <Select
              selectedOption={
                config.subnetId
                  ? {
                      value: config.subnetId,
                      label: filteredSubnets.find((s) => s.id === config.subnetId)?.name || config.subnetId,
                    }
                  : null
              }
              onChange={({ detail }) =>
                setConfig({ ...config, subnetId: detail.selectedOption?.value || '' })
              }
              options={filteredSubnets.map((subnet) => ({
                value: subnet.id,
                label: `${subnet.name} (${subnet.id})`,
                description: `${subnet.availabilityZone} | ${subnet.cidrBlock} | ${subnet.availableIps} IPs available`,
              }))}
              placeholder="Select a subnet"
              disabled={!config.vpcId}
            />
          </FormField>
        </ColumnLayout>

        <FormField label="Auto-assign public IP">
          <RadioGroup
            value={config.publicIpEnabled ? 'enable' : 'disable'}
            onChange={({ detail }) =>
              setConfig({ ...config, publicIpEnabled: detail.value === 'enable' })
            }
            items={[
              { value: 'enable', label: 'Enable' },
              { value: 'disable', label: 'Disable' },
            ]}
          />
        </FormField>

        <FormField
          label="Firewall (security groups)"
          description="Security groups control the traffic that is allowed to reach and leave your instance"
        >
          <Multiselect
            selectedOptions={config.securityGroupIds.map((id) => ({
              value: id,
              label: filteredSecurityGroups.find((sg) => sg.id === id)?.name || id,
            }))}
            onChange={({ detail }) =>
              setConfig({
                ...config,
                securityGroupIds: detail.selectedOptions.map((o) => o.value || ''),
              })
            }
            options={filteredSecurityGroups.map((sg) => ({
              value: sg.id,
              label: sg.name,
              description: `${sg.description} | ${sg.inboundRules} inbound, ${sg.outboundRules} outbound rules`,
            }))}
            placeholder="Select security groups"
            disabled={!config.vpcId}
          />
        </FormField>
      </SpaceBetween>
    </Container>
  );

  // Step 5: Storage
  const step5Content = (
    <Container
      header={
        <Header
          variant="h2"
          description="Configure the storage volumes for your instance"
          actions={
            <Button iconName="add-plus" onClick={addVolume}>
              Add new volume
            </Button>
          }
        >
          Configure storage
        </Header>
      }
    >
      <SpaceBetween size="l">
        {config.storageConfig.map((volume, index) => (
          <ExpandableSection
            key={index}
            defaultExpanded={index === 0}
            headerText={
              <SpaceBetween size="xs" direction="horizontal">
                <span>
                  {index === 0 ? 'Root volume' : `Volume ${index + 1}`} ({volume.deviceName})
                </span>
                <Badge>{volume.volumeSize} GiB</Badge>
                <Badge color="blue">{volume.volumeType.toUpperCase()}</Badge>
              </SpaceBetween>
            }
            headerActions={
              index > 0 && (
                <Button variant="icon" iconName="remove" onClick={() => removeVolume(index)} />
              )
            }
          >
            <ColumnLayout columns={2}>
              <FormField label="Size (GiB)">
                <Input
                  type="number"
                  value={String(volume.volumeSize)}
                  onChange={({ detail }) =>
                    updateStorage(index, { volumeSize: parseInt(detail.value) || 8 })
                  }
                />
              </FormField>

              <FormField label="Volume type">
                <Select
                  selectedOption={volumeTypeOptions.find((o) => o.value === volume.volumeType) || null}
                  onChange={({ detail }) =>
                    updateStorage(index, { volumeType: detail.selectedOption.value as StorageConfig['volumeType'] })
                  }
                  options={volumeTypeOptions}
                />
              </FormField>

              {(volume.volumeType === 'gp3' || volume.volumeType === 'io1' || volume.volumeType === 'io2') && (
                <FormField label="IOPS">
                  <Input
                    type="number"
                    value={String(volume.iops || 3000)}
                    onChange={({ detail }) =>
                      updateStorage(index, { iops: parseInt(detail.value) || 3000 })
                    }
                  />
                </FormField>
              )}

              {volume.volumeType === 'gp3' && (
                <FormField label="Throughput (MiB/s)">
                  <Input
                    type="number"
                    value={String(volume.throughput || 125)}
                    onChange={({ detail }) =>
                      updateStorage(index, { throughput: parseInt(detail.value) || 125 })
                    }
                  />
                </FormField>
              )}

              <FormField label="Options">
                <SpaceBetween size="xs">
                  <Checkbox
                    checked={volume.encrypted}
                    onChange={({ detail }) => updateStorage(index, { encrypted: detail.checked })}
                  >
                    Encrypted
                  </Checkbox>
                  <Checkbox
                    checked={volume.deleteOnTermination}
                    onChange={({ detail }) =>
                      updateStorage(index, { deleteOnTermination: detail.checked })
                    }
                  >
                    Delete on termination
                  </Checkbox>
                </SpaceBetween>
              </FormField>
            </ColumnLayout>
          </ExpandableSection>
        ))}
      </SpaceBetween>
    </Container>
  );

  // Step 6: Review and Launch
  const step6Content = (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">Summary</Header>}>
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Instance name</Box>
            <div>{config.name || '-'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Number of instances</Box>
            <div>{config.instanceCount}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">AMI</Box>
            <div>{selectedAmi?.name || '-'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Instance type</Box>
            <div>{config.instanceType}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Key pair</Box>
            <div>{config.keyPairName || 'None'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">VPC</Box>
            <div>{vpcs.find((v) => v.id === config.vpcId)?.name || '-'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Subnet</Box>
            <div>{subnets.find((s) => s.id === config.subnetId)?.name || '-'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Public IP</Box>
            <div>{config.publicIpEnabled ? 'Enabled' : 'Disabled'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Security groups</Box>
            <div>
              {config.securityGroupIds.length > 0
                ? config.securityGroupIds
                    .map((id) => securityGroups.find((sg) => sg.id === id)?.name)
                    .join(', ')
                : '-'}
            </div>
          </div>
          <div>
            <Box variant="awsui-key-label">Storage</Box>
            <div>
              {config.storageConfig.map((v, i) => (
                <div key={i}>
                  {v.deviceName}: {v.volumeSize} GiB {v.volumeType}
                </div>
              ))}
            </div>
          </div>
        </ColumnLayout>
      </Container>

      <Container header={<Header variant="h2">Estimated cost</Header>}>
        <ColumnLayout columns={3}>
          <div>
            <Box variant="awsui-key-label">Instance (hourly)</Box>
            <div>${selectedInstanceType?.pricePerHour.toFixed(4) || '0.0000'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Instance (monthly)</Box>
            <div>${((selectedInstanceType?.pricePerHour || 0) * 730).toFixed(2)}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Storage (monthly)</Box>
            <div>
              ${(config.storageConfig.reduce((acc, v) => acc + v.volumeSize * 0.08, 0)).toFixed(2)}
            </div>
          </div>
        </ColumnLayout>
      </Container>

      <FormField label="Number of instances">
        <Input
          type="number"
          value={String(config.instanceCount)}
          onChange={({ detail }) =>
            setConfig({ ...config, instanceCount: Math.max(1, parseInt(detail.value) || 1) })
          }
        />
      </FormField>
    </SpaceBetween>
  );

  return (
    <Wizard
      i18nStrings={{
        stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
        collapsedStepsLabel: (stepNumber, stepsCount) => `Step ${stepNumber} of ${stepsCount}`,
        navigationAriaLabel: 'Steps',
        cancelButton: 'Cancel',
        previousButton: 'Previous',
        nextButton: 'Next',
        submitButton: 'Launch instance',
        optional: 'optional',
      }}
      onNavigate={({ detail }) => setActiveStepIndex(detail.requestedStepIndex)}
      onCancel={() => navigate('/compute/instances')}
      onSubmit={handleLaunch}
      activeStepIndex={activeStepIndex}
      steps={[
        {
          title: 'Name and AMI',
          description: 'Choose a name and select an Amazon Machine Image',
          content: step1Content,
        },
        {
          title: 'Instance type',
          description: 'Select the hardware configuration for your instance',
          content: step2Content,
        },
        {
          title: 'Key pair',
          description: 'Create or select a key pair for SSH access',
          content: step3Content,
        },
        {
          title: 'Network settings',
          description: 'Configure VPC, subnet, and security groups',
          content: step4Content,
        },
        {
          title: 'Storage',
          description: 'Configure the storage volumes',
          content: step5Content,
        },
        {
          title: 'Review and launch',
          description: 'Review your configuration and launch',
          content: step6Content,
        },
      ]}
    />
  );
}
