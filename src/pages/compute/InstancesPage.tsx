import { useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import Header from '@cloudscape-design/components/header';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import Link from '@cloudscape-design/components/link';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import TextFilter from '@cloudscape-design/components/text-filter';
import CollectionPreferences from '@cloudscape-design/components/collection-preferences';
import { ResourceStatusIndicator, EmptyState } from '@/components/common';
import { useAccountResources } from '@/hooks/useAccountResources';
import { useTenant } from '@/contexts/TenantContext';
import { formatDateTime } from '@/utils/formatters';
import type { Instance, InstanceBlockDevice, InstanceNetworkInterface } from '@/types';

const PAGE_SIZE = 10;

const COLUMN_DEFINITIONS = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'id', label: 'Instance ID', visible: true },
  { id: 'status', label: 'Instance state', visible: true },
  { id: 'statusCheck', label: 'Status check', visible: true },
  { id: 'alarmStatus', label: 'Alarm status', visible: false },
  { id: 'type', label: 'Instance type', visible: true },
  { id: 'az', label: 'Availability Zone', visible: true },
  { id: 'publicIp', label: 'Public IPv4 address', visible: true },
  { id: 'privateIp', label: 'Private IPv4 address', visible: false },
  { id: 'vpcId', label: 'VPC ID', visible: false },
  { id: 'subnetId', label: 'Subnet ID', visible: false },
  { id: 'securityGroup', label: 'Security group name', visible: true },
  { id: 'keyName', label: 'Key name', visible: false },
  { id: 'launchTime', label: 'Launch time', visible: true },
  { id: 'platform', label: 'Platform', visible: false },
  { id: 'monitoring', label: 'Monitoring', visible: false },
  { id: 'iamRole', label: 'IAM instance profile', visible: false },
  { id: 'owner', label: 'Owner', visible: false },
  { id: 'accountId', label: 'Account ID', visible: false },
];

const DEFAULT_VISIBLE_COLUMNS = COLUMN_DEFINITIONS.filter((c) => c.visible).map((c) => c.id);

const ValueWithCopy = memo(function ValueWithCopy({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <SpaceBetween size="xxs" direction="horizontal">
      <Box>{value}</Box>
      <CopyToClipboard
        copyButtonAriaLabel={`Copy ${label}`}
        copySuccessText={`${label} copied`}
        copyErrorText="Failed to copy"
        textToCopy={value}
        variant="icon"
      />
    </SpaceBetween>
  );
});

const DetailsTab = memo(function DetailsTab({ instance }: { instance: Instance }) {
  return (
    <SpaceBetween size="l">
      {/* Instance Summary */}
      <Container header={<Header variant="h2">Instance summary</Header>}>
        <ColumnLayout columns={4} variant="text-grid">
          <KeyValuePairs
            items={[
              { label: 'Instance ID', value: <ValueWithCopy value={instance.id} label="Instance ID" /> },
              { label: 'Instance state', value: <ResourceStatusIndicator status={instance.status} /> },
              { label: 'Instance type', value: instance.type },
              { label: 'Availability Zone', value: instance.availabilityZone },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Public IPv4 address', value: instance.publicIp ? <ValueWithCopy value={instance.publicIp} label="Public IP" /> : '-' },
              { label: 'Private IPv4 address', value: <ValueWithCopy value={instance.privateIp} label="Private IP" /> },
              { label: 'Public IPv4 DNS', value: instance.publicDnsName || '-' },
              { label: 'Private IPv4 DNS', value: instance.privateDnsName || '-' },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'VPC ID', value: <Link href={`/networking/vpcs`}>{instance.vpcId}</Link> },
              { label: 'Subnet ID', value: <Link href={`/networking/subnets`}>{instance.subnetId}</Link> },
              { label: 'AMI ID', value: instance.imageId },
              { label: 'AMI name', value: instance.imageName },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Platform', value: instance.platform },
              { label: 'Key pair name', value: instance.keyPairName || '-' },
              { label: 'Launch time', value: formatDateTime(instance.launchTime) },
              { label: 'Owner', value: instance.ownerId },
            ]}
          />
        </ColumnLayout>
      </Container>

      {/* Instance Details */}
      <Container header={<Header variant="h2">Instance details</Header>}>
        <ColumnLayout columns={3} variant="text-grid">
          <SpaceBetween size="l">
            <KeyValuePairs
              items={[
                { label: 'Platform details', value: instance.platformDetails },
                { label: 'Architecture', value: instance.architecture },
                { label: 'Virtualization type', value: instance.virtualizationType },
                { label: 'Hypervisor', value: instance.hypervisor },
              ]}
            />
          </SpaceBetween>
          <SpaceBetween size="l">
            <KeyValuePairs
              items={[
                { label: 'Tenancy', value: instance.placement.tenancy },
                { label: 'Placement group', value: instance.placement.groupName || '-' },
                { label: 'Host ID', value: instance.placement.hostId || '-' },
                { label: 'Boot mode', value: instance.bootMode || 'Not specified' },
              ]}
            />
          </SpaceBetween>
          <SpaceBetween size="l">
            <KeyValuePairs
              items={[
                { label: 'IAM role', value: instance.iamInstanceProfile ? <Link href="#">{instance.iamInstanceProfile.name}</Link> : '-' },
                { label: 'Monitoring', value: instance.monitoring.state === 'enabled' ? <StatusIndicator type="success">Detailed</StatusIndicator> : <StatusIndicator type="info">Basic</StatusIndicator> },
                { label: 'EBS-optimized', value: instance.ebsOptimized ? 'Yes' : 'No' },
                { label: 'Hibernation', value: instance.hibernationOptions.configured ? 'Enabled' : 'Disabled' },
              ]}
            />
          </SpaceBetween>
        </ColumnLayout>
      </Container>

      {/* Host and CPU Configuration */}
      <Container header={<Header variant="h2">Host and CPU options</Header>}>
        <ColumnLayout columns={3} variant="text-grid">
          <KeyValuePairs
            items={[
              { label: 'Number of vCPUs', value: `${instance.cpuOptions.coreCount * instance.cpuOptions.threadsPerCore}` },
              { label: 'Core count', value: `${instance.cpuOptions.coreCount}` },
              { label: 'Threads per core', value: `${instance.cpuOptions.threadsPerCore}` },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Auto Recovery', value: instance.maintenanceOptions.autoRecovery === 'default' ? 'Default' : 'Disabled' },
              { label: 'Nitro Enclave', value: instance.enclaveOptions.enabled ? 'Enabled' : 'Disabled' },
              { label: 'Capacity Reservation', value: instance.capacityReservationSpecification.preference === 'open' ? 'Open' : 'None' },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Usage operation', value: instance.usageOperation },
              { label: 'Usage operation update time', value: formatDateTime(instance.usageOperationUpdateTime) },
            ]}
          />
        </ColumnLayout>
      </Container>

      {/* State Reason (if stopped/terminated) */}
      {instance.stateReason && (
        <Container header={<Header variant="h2">State transition reason</Header>}>
          <KeyValuePairs
            items={[
              { label: 'Reason code', value: instance.stateReason.code },
              { label: 'Message', value: instance.stateReason.message },
              { label: 'Transition reason', value: instance.stateTransitionReason || '-' },
            ]}
          />
        </Container>
      )}
    </SpaceBetween>
  );
});

const SecurityTab = memo(function SecurityTab({ instance }: { instance: Instance }) {
  return (
    <SpaceBetween size="l">
      {/* Security Groups */}
      <Container header={<Header variant="h2">Security groups</Header>}>
        <Table
          columnDefinitions={[
            {
              id: 'name',
              header: 'Security group name',
              cell: (item) => <Link href="/networking/security-groups">{item.name}</Link>,
            },
            {
              id: 'id',
              header: 'Security group ID',
              cell: (item) => <ValueWithCopy value={item.id} label="Security group ID" />,
            },
          ]}
          items={instance.securityGroups}
          variant="embedded"
        />
      </Container>

      {/* IAM Role */}
      <Container header={<Header variant="h2">IAM role</Header>}>
        {instance.iamInstanceProfile ? (
          <KeyValuePairs
            items={[
              { label: 'Instance profile ARN', value: <ValueWithCopy value={instance.iamInstanceProfile.arn} label="ARN" /> },
              { label: 'Instance profile name', value: instance.iamInstanceProfile.name },
              { label: 'Instance profile ID', value: instance.iamInstanceProfile.id },
            ]}
          />
        ) : (
          <Box color="text-body-secondary">No IAM role attached to this instance.</Box>
        )}
      </Container>

      {/* Key Pair */}
      <Container header={<Header variant="h2">Key pair</Header>}>
        <KeyValuePairs
          items={[
            { label: 'Key pair assigned at launch', value: instance.keyPairName || 'No key pair' },
          ]}
        />
      </Container>

      {/* Instance Metadata Options */}
      <Container header={<Header variant="h2">Instance metadata options</Header>}>
        <ColumnLayout columns={2} variant="text-grid">
          <KeyValuePairs
            items={[
              { label: 'IMDSv2', value: instance.metadataOptions.httpTokens === 'required' ? <StatusIndicator type="success">Required</StatusIndicator> : <StatusIndicator type="warning">Optional</StatusIndicator> },
              { label: 'Metadata accessible', value: instance.metadataOptions.httpEndpoint === 'enabled' ? 'Yes' : 'No' },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Metadata response hop limit', value: `${instance.metadataOptions.httpPutResponseHopLimit}` },
              { label: 'Allow tags in metadata', value: instance.metadataOptions.instanceMetadataTags === 'enabled' ? 'Enabled' : 'Disabled' },
            ]}
          />
        </ColumnLayout>
      </Container>
    </SpaceBetween>
  );
});

const NetworkingTab = memo(function NetworkingTab({ instance }: { instance: Instance }) {
  return (
    <SpaceBetween size="l">
      {/* Networking Details */}
      <Container header={<Header variant="h2">Networking details</Header>}>
        <ColumnLayout columns={3} variant="text-grid">
          <KeyValuePairs
            items={[
              { label: 'Public IPv4 address', value: instance.publicIp || '-' },
              { label: 'Private IPv4 addresses', value: instance.privateIp },
              { label: 'Elastic IP', value: instance.elasticIpAddress || '-' },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Public IPv4 DNS', value: instance.publicDnsName || '-' },
              { label: 'Private IPv4 DNS', value: instance.privateDnsName },
              { label: 'VPC ID', value: <Link href="/networking/vpcs">{instance.vpcId}</Link> },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'Subnet ID', value: <Link href="/networking/subnets">{instance.subnetId}</Link> },
              { label: 'Availability Zone', value: instance.availabilityZone },
              { label: 'Source/dest. check', value: instance.sourceDestCheck ? 'Enabled' : 'Disabled' },
            ]}
          />
        </ColumnLayout>
      </Container>

      {/* Network Interfaces */}
      <Container header={<Header variant="h2">Network interfaces</Header>}>
        <Table<InstanceNetworkInterface>
          columnDefinitions={[
            {
              id: 'id',
              header: 'Network interface ID',
              cell: (item) => <ValueWithCopy value={item.networkInterfaceId} label="ENI ID" />,
            },
            {
              id: 'device',
              header: 'Device index',
              cell: (item) => `eth${item.deviceIndex}`,
            },
            {
              id: 'privateIp',
              header: 'Private IPv4 address',
              cell: (item) => item.privateIpAddress,
            },
            {
              id: 'publicIp',
              header: 'Public IPv4 address',
              cell: (item) => item.publicIpAddress || '-',
            },
            {
              id: 'mac',
              header: 'MAC address',
              cell: (item) => item.macAddress,
            },
            {
              id: 'subnet',
              header: 'Subnet ID',
              cell: (item) => item.subnetId,
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) => (
                <StatusIndicator type={item.status === 'in-use' ? 'success' : 'info'}>
                  {item.status}
                </StatusIndicator>
              ),
            },
            {
              id: 'deleteOnTermination',
              header: 'Delete on termination',
              cell: (item) => item.deleteOnTermination ? 'Yes' : 'No',
            },
          ]}
          items={instance.networkInterfaces}
          variant="embedded"
        />
      </Container>
    </SpaceBetween>
  );
});

const StorageTab = memo(function StorageTab({ instance }: { instance: Instance }) {
  return (
    <SpaceBetween size="l">
      {/* Root device details */}
      <Container header={<Header variant="h2">Root device details</Header>}>
        <ColumnLayout columns={3} variant="text-grid">
          <KeyValuePairs
            items={[
              { label: 'Root device type', value: instance.rootDeviceType },
              { label: 'Root device name', value: instance.rootDeviceName },
            ]}
          />
          <KeyValuePairs
            items={[
              { label: 'EBS-optimized', value: instance.ebsOptimized ? 'Yes' : 'No' },
            ]}
          />
        </ColumnLayout>
      </Container>

      {/* Block devices */}
      <Container header={<Header variant="h2">Block devices</Header>}>
        <Table<InstanceBlockDevice>
          columnDefinitions={[
            {
              id: 'device',
              header: 'Device name',
              cell: (item) => (
                <SpaceBetween size="xxs" direction="horizontal">
                  <Box>{item.deviceName}</Box>
                  {item.deviceName === instance.rootDeviceName && <Badge color="blue">Root</Badge>}
                </SpaceBetween>
              ),
            },
            {
              id: 'volumeId',
              header: 'Volume ID',
              cell: (item) => <Link href="/storage/ebs">{item.volumeId}</Link>,
            },
            {
              id: 'type',
              header: 'Volume type',
              cell: (item) => item.volumeType.toUpperCase(),
            },
            {
              id: 'size',
              header: 'Size (GiB)',
              cell: (item) => item.volumeSize,
            },
            {
              id: 'iops',
              header: 'IOPS',
              cell: (item) => item.iops || '-',
            },
            {
              id: 'throughput',
              header: 'Throughput (MiB/s)',
              cell: (item) => item.throughput || '-',
            },
            {
              id: 'encrypted',
              header: 'Encrypted',
              cell: (item) => item.encrypted ? <StatusIndicator type="success">Yes</StatusIndicator> : <StatusIndicator type="warning">No</StatusIndicator>,
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) => (
                <StatusIndicator type={item.status === 'attached' ? 'success' : 'pending'}>
                  {item.status}
                </StatusIndicator>
              ),
            },
            {
              id: 'deleteOnTermination',
              header: 'Delete on termination',
              cell: (item) => item.deleteOnTermination ? 'Yes' : 'No',
            },
          ]}
          items={instance.blockDeviceMappings}
          variant="embedded"
        />
      </Container>
    </SpaceBetween>
  );
});

const TagsTab = memo(function TagsTab({ instance }: { instance: Instance }) {
  const tags = Object.entries(instance.tags).map(([key, value]) => ({ key, value }));

  return (
    <Container
      header={
        <Header
          variant="h2"
          counter={`(${tags.length})`}
          actions={<Button>Manage tags</Button>}
        >
          Tags
        </Header>
      }
    >
      <Table
        columnDefinitions={[
          {
            id: 'key',
            header: 'Key',
            cell: (item) => item.key,
            sortingField: 'key',
          },
          {
            id: 'value',
            header: 'Value',
            cell: (item) => item.value || '-',
          },
        ]}
        items={tags}
        sortingColumn={{ sortingField: 'key' }}
        variant="embedded"
        empty={
          <Box textAlign="center" color="inherit">
            <b>No tags</b>
            <Box variant="p" color="inherit">
              No tags have been added to this instance.
            </Box>
          </Box>
        }
      />
    </Container>
  );
});

const MonitoringTab = memo(function MonitoringTab({ instance }: { instance: Instance }) {
  return (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">Monitoring status</Header>}>
        <ColumnLayout columns={2} variant="text-grid">
          <KeyValuePairs
            items={[
              {
                label: 'Detailed monitoring',
                value: instance.monitoring.state === 'enabled'
                  ? <StatusIndicator type="success">Enabled</StatusIndicator>
                  : <StatusIndicator type="info">Basic monitoring</StatusIndicator>,
              },
              { label: 'Status', value: instance.monitoring.state },
            ]}
          />
        </ColumnLayout>
      </Container>

      <Container header={<Header variant="h2">CloudWatch metrics</Header>}>
        <Box textAlign="center" padding="xxl" color="text-body-secondary">
          <SpaceBetween size="m">
            <Box variant="h3">Metrics visualization</Box>
            <Box>
              View CPU utilization, network traffic, disk I/O, and other metrics in CloudWatch.
            </Box>
            <Button href="/monitoring/metrics">View in CloudWatch</Button>
          </SpaceBetween>
        </Box>
      </Container>

      <Container header={<Header variant="h2">CloudWatch alarms</Header>}>
        <Box textAlign="center" padding="l" color="text-body-secondary">
          <SpaceBetween size="s">
            <Box>No alarms configured for this instance.</Box>
            <Button href="/monitoring/alarms">Create alarm</Button>
          </SpaceBetween>
        </Box>
      </Container>
    </SpaceBetween>
  );
});

const InstanceDetailsPanel = memo(function InstanceDetailsPanel({
  instance,
}: {
  instance: Instance;
}) {
  return (
    <Box padding={{ top: 'l' }}>
      <SpaceBetween size="m">
        <Header
          variant="h2"
          info={<ResourceStatusIndicator status={instance.status} />}
        >
          {instance.name}
        </Header>
        <Tabs
          tabs={[
            {
              id: 'details',
              label: 'Details',
              content: <DetailsTab instance={instance} />,
            },
            {
              id: 'security',
              label: 'Security',
              content: <SecurityTab instance={instance} />,
            },
            {
              id: 'networking',
              label: 'Networking',
              content: <NetworkingTab instance={instance} />,
            },
            {
              id: 'storage',
              label: 'Storage',
              content: <StorageTab instance={instance} />,
            },
            {
              id: 'tags',
              label: 'Tags',
              content: <TagsTab instance={instance} />,
            },
            {
              id: 'monitoring',
              label: 'Monitoring',
              content: <MonitoringTab instance={instance} />,
            },
          ]}
        />
      </SpaceBetween>
    </Box>
  );
});

export function InstancesPage() {
  const navigate = useNavigate();
  const { instances, isOrgAdmin } = useAccountResources();
  const { currentAccount } = useTenant();
  const [selectedItems, setSelectedItems] = useState<Instance[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState(
    isOrgAdmin ? [...DEFAULT_VISIBLE_COLUMNS, 'accountId'] : DEFAULT_VISIBLE_COLUMNS
  );
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const filteredItems = useMemo(() => {
    if (!filterText) return instances;
    const lowerFilter = filterText.toLowerCase();
    return instances.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.id.toLowerCase().includes(lowerFilter) ||
        item.type.toLowerCase().includes(lowerFilter)
    );
  }, [filterText, instances]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const hasSelection = selectedItems.length > 0;
  const hasSingleSelection = selectedItems.length === 1;
  const isRunning = selectedItems.some((i) => i.status === 'running');
  const isStopped = selectedItems.some((i) => i.status === 'stopped');

  const handleLaunchInstance = useCallback(() => {
    navigate('/compute/instances/launch');
  }, [navigate]);

  const handleSelectionChange = useCallback(
    ({ detail }: { detail: { selectedItems: Instance[] } }) => {
      setSelectedItems(detail.selectedItems);
    },
    []
  );

  const handleFilterChange = useCallback(
    ({ detail }: { detail: { filteringText: string } }) => {
      setFilterText(detail.filteringText);
      setCurrentPage(1);
    },
    []
  );

  const handlePageChange = useCallback(
    ({ detail }: { detail: { currentPageIndex: number } }) => {
      setCurrentPage(detail.currentPageIndex);
    },
    []
  );

  const handlePreferencesConfirm = useCallback(
    ({
      detail,
    }: {
      detail: { pageSize?: number; visibleContent?: string[] };
    }) => {
      setPageSize(detail.pageSize ?? PAGE_SIZE);
      setVisibleColumns(detail.visibleContent ?? DEFAULT_VISIBLE_COLUMNS);
      setCurrentPage(1);
    },
    []
  );

  return (
    <SpaceBetween size="l">
      <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
        <Table
          header={
          <Header
            variant="h1"
            counter={`(${filteredItems.length})`}
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button disabled={!hasSelection || isRunning}>Start</Button>
                <Button disabled={!hasSelection || isStopped}>Stop</Button>
                <Button disabled={!hasSelection}>Reboot</Button>
                <Button variant="primary" onClick={handleLaunchInstance}>
                  Launch instance
                </Button>
              </SpaceBetween>
            }
            description={
              currentAccount
                ? `Instances in ${currentAccount.name} (${currentAccount.id})`
                : 'Manage your EC2 instances'
            }
          >
            EC2 Instances
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Name',
            cell: (item) => item.name,
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'id',
            header: 'Instance ID',
            cell: (item) => <ValueWithCopy value={item.id} label="Instance ID" />,
            sortingField: 'id',
          },
          {
            id: 'status',
            header: 'Instance state',
            cell: (item) => <ResourceStatusIndicator status={item.status} />,
            sortingField: 'status',
          },
          {
            id: 'statusCheck',
            header: 'Status check',
            cell: (item) => {
              if (item.status === 'running') {
                return <StatusIndicator type="success">2/2 checks passed</StatusIndicator>;
              }
              if (item.status === 'pending') {
                return <StatusIndicator type="pending">Initializing</StatusIndicator>;
              }
              return '-';
            },
          },
          {
            id: 'alarmStatus',
            header: 'Alarm status',
            cell: () => <StatusIndicator type="success">No alarms</StatusIndicator>,
          },
          {
            id: 'type',
            header: 'Instance type',
            cell: (item) => item.type,
            sortingField: 'type',
          },
          {
            id: 'az',
            header: 'Availability Zone',
            cell: (item) => item.availabilityZone,
            sortingField: 'availabilityZone',
          },
          {
            id: 'publicIp',
            header: 'Public IPv4 address',
            cell: (item) => item.publicIp || '-',
          },
          {
            id: 'privateIp',
            header: 'Private IPv4 address',
            cell: (item) => item.privateIp,
          },
          {
            id: 'vpcId',
            header: 'VPC ID',
            cell: (item) => <Link href="/networking/vpcs">{item.vpcId}</Link>,
          },
          {
            id: 'subnetId',
            header: 'Subnet ID',
            cell: (item) => <Link href="/networking/subnets">{item.subnetId}</Link>,
          },
          {
            id: 'securityGroup',
            header: 'Security group name',
            cell: (item) => (
              <Link href="/networking/security-groups">
                {item.securityGroups[0]?.name || '-'}
              </Link>
            ),
          },
          {
            id: 'keyName',
            header: 'Key name',
            cell: (item) => item.keyPairName || '-',
          },
          {
            id: 'launchTime',
            header: 'Launch time',
            cell: (item) => formatDateTime(item.launchTime),
            sortingField: 'launchTime',
          },
          {
            id: 'platform',
            header: 'Platform',
            cell: (item) => item.platform,
          },
          {
            id: 'monitoring',
            header: 'Monitoring',
            cell: (item) => item.monitoring.state === 'enabled' ? 'enabled' : 'disabled',
          },
          {
            id: 'iamRole',
            header: 'IAM instance profile',
            cell: (item) => item.iamInstanceProfile?.name || '-',
          },
          {
            id: 'owner',
            header: 'Owner',
            cell: (item) => item.ownerId,
          },
          {
            id: 'accountId',
            header: 'Account ID',
            cell: (item) => item.accountId || '-',
          },
        ]}
        items={paginatedItems}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        trackBy="id"
        filter={
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder="Find instances"
            filteringAriaLabel="Filter instances"
            onChange={handleFilterChange}
          />
        }
        pagination={
          <Pagination
            currentPageIndex={currentPage}
            pagesCount={Math.ceil(filteredItems.length / pageSize)}
            onChange={handlePageChange}
          />
        }
        visibleColumns={visibleColumns}
        preferences={
          <CollectionPreferences
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={{
              pageSize,
              visibleContent: visibleColumns,
            }}
            onConfirm={handlePreferencesConfirm}
            pageSizePreference={{
              title: 'Page size',
              options: [
                { value: 10, label: '10 instances' },
                { value: 20, label: '20 instances' },
                { value: 50, label: '50 instances' },
              ],
            }}
            visibleContentPreference={{
              title: 'Select visible columns',
              options: [
                {
                  label: 'Instance properties',
                  options: COLUMN_DEFINITIONS.map((col) => ({
                    id: col.id,
                    label: col.label,
                  })),
                },
              ],
            }}
          />
        }
        empty={
          <EmptyState
            title="No instances"
            description="No EC2 instances found. Launch your first instance to get started."
            actionLabel="Launch instance"
            onAction={handleLaunchInstance}
          />
        }
        stickyHeader
        stripedRows
        wrapLines={false}
        variant="full-page"
        />
      </div>

      {/* Instance Details Panel - shown when single instance is selected */}
      {hasSingleSelection && <InstanceDetailsPanel instance={selectedItems[0]} />}
    </SpaceBetween>
  );
}
