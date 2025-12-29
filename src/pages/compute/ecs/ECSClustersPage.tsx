import { useState, useMemo } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Icon from '@cloudscape-design/components/icon';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Badge from '@cloudscape-design/components/badge';
import Toggle from '@cloudscape-design/components/toggle';
import { EmptyState, WelcomePage } from '@/components/common';
import { ecsClusters } from '@/data/mockData';
import { CreateClusterModal } from './CreateClusterModal';
import type { ECSCluster, ECSClusterStatus } from '@/types';

const PAGE_SIZE = 10;

// Set to true to simulate no resources (for demo purposes)
const SIMULATE_EMPTY = false;

function ClusterStatusIndicator({ status }: { status: ECSClusterStatus }) {
  const statusMap: Record<ECSClusterStatus, { type: 'success' | 'pending' | 'error' | 'stopped'; label: string }> = {
    ACTIVE: { type: 'success', label: 'Active' },
    PROVISIONING: { type: 'pending', label: 'Provisioning' },
    DEPROVISIONING: { type: 'pending', label: 'Deprovisioning' },
    FAILED: { type: 'error', label: 'Failed' },
    INACTIVE: { type: 'stopped', label: 'Inactive' },
  };
  const config = statusMap[status];
  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

function ECSWelcomePage({ onGetStarted, onViewClusters }: { onGetStarted: () => void; onViewClusters: () => void }) {
  return (
    <WelcomePage
      title="Amazon Elastic Container Service"
      subtitle="Run and scale containerized applications"
      description="Amazon ECS is a fully managed container orchestration service that makes it easy to deploy, manage, and scale containerized applications. ECS supports Docker containers and allows you to run applications on a managed cluster of Amazon EC2 instances or with AWS Fargate."
      icon={
        <Box fontSize="display-l" color="text-status-info">
          <Icon name="group-active" size="big" />
        </Box>
      }
      features={[
        {
          title: 'Fully managed',
          description: 'ECS eliminates the need to install, operate, and scale your own cluster management infrastructure.',
        },
        {
          title: 'AWS Fargate support',
          description: 'Run containers without managing servers. Just define your application and resources needed.',
        },
        {
          title: 'Deep AWS integration',
          description: 'Integrates natively with IAM, VPC, CloudWatch, and other AWS services for security and monitoring.',
        },
        {
          title: 'Flexible scheduling',
          description: 'Schedule containers based on resource needs, isolation policies, and availability requirements.',
        },
        {
          title: 'Service auto scaling',
          description: 'Automatically adjust the desired count of tasks in your service based on CloudWatch metrics.',
        },
        {
          title: 'Cost efficient',
          description: 'Pay only for the AWS resources you use. No additional charges for the ECS control plane.',
        },
      ]}
      primaryAction={{
        label: 'Create cluster',
        onClick: onGetStarted,
      }}
      secondaryAction={{
        label: 'View existing clusters',
        onClick: onViewClusters,
      }}
      learnMoreLinks={[
        { text: 'Getting started with Amazon ECS', href: '#' },
        { text: 'Amazon ECS Developer Guide', href: '#' },
        { text: 'Amazon ECS best practices', href: '#' },
        { text: 'Amazon ECS pricing', href: '#' },
      ]}
    />
  );
}

function ClustersList({
  onCreateCluster,
  showCreateModal,
  setShowCreateModal,
  showWelcomeToggle,
  onToggleWelcome,
}: {
  onCreateCluster: () => void;
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  showWelcomeToggle?: boolean;
  onToggleWelcome?: () => void;
}) {
  const [selectedItems, setSelectedItems] = useState<ECSCluster[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return ecsClusters;
    const lowerFilter = filterText.toLowerCase();
    return ecsClusters.filter((item) => item.name.toLowerCase().includes(lowerFilter));
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  return (
    <>
      {showWelcomeToggle && onToggleWelcome && (
        <Box float="right" margin={{ bottom: 's' }}>
          <Toggle checked={false} onChange={onToggleWelcome}>
            Show welcome page
          </Toggle>
        </Box>
      )}
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
                  Create cluster
                </Button>
              </SpaceBetween>
            }
            description="Run and manage Docker containers at scale"
          >
            ECS Clusters
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Cluster name',
            cell: (item) => <Link href={`/compute/ecs/clusters/${item.name}`}>{item.name}</Link>,
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => <ClusterStatusIndicator status={item.status} />,
            sortingField: 'status',
          },
          {
            id: 'runningTasks',
            header: 'Running tasks',
            cell: (item) => item.runningTasks,
            sortingField: 'runningTasks',
          },
          {
            id: 'pendingTasks',
            header: 'Pending tasks',
            cell: (item) => item.pendingTasks,
          },
          {
            id: 'services',
            header: 'Active services',
            cell: (item) => item.activeServices,
          },
          {
            id: 'instances',
            header: 'Container instances',
            cell: (item) => item.registeredContainerInstances,
          },
          {
            id: 'capacityProviders',
            header: 'Capacity providers',
            cell: (item) => (
              <SpaceBetween size="xs" direction="horizontal">
                {item.capacityProviders.map((cp) => (
                  <Badge key={cp} color={cp.includes('SPOT') ? 'blue' : 'grey'}>
                    {cp}
                  </Badge>
                ))}
              </SpaceBetween>
            ),
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
            filteringPlaceholder="Find clusters"
            filteringAriaLabel="Filter clusters"
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
            title="No clusters"
            description="No ECS clusters found. Create your first cluster to get started."
            actionLabel="Create cluster"
            onAction={onCreateCluster}
          />
        }
        stickyHeader
        variant="full-page"
      />

      <CreateClusterModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        onCreate={(data) => {
          console.log('Create cluster:', data);
          setShowCreateModal(false);
        }}
      />
    </>
  );
}

export function ECSClustersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Determine if we should show the welcome page
  // Show welcome if: no resources exist AND user hasn't dismissed it
  const hasResources = !SIMULATE_EMPTY && ecsClusters.length > 0;

  const handleGetStarted = () => {
    setShowCreateModal(true);
  };

  const handleViewClusters = () => {
    setShowWelcome(false);
  };

  // If user has resources, always show the clusters list
  if (hasResources) {
    return (
      <ClustersList
        onCreateCluster={() => setShowCreateModal(true)}
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      />
    );
  }

  // Show welcome page for new users without resources
  if (showWelcome) {
    return (
      <ECSWelcomePage
        onGetStarted={handleGetStarted}
        onViewClusters={handleViewClusters}
      />
    );
  }

  // Show clusters list (empty state) when user dismisses welcome
  return (
    <ClustersList
      onCreateCluster={() => setShowCreateModal(true)}
      showCreateModal={showCreateModal}
      setShowCreateModal={setShowCreateModal}
      showWelcomeToggle
      onToggleWelcome={() => setShowWelcome(true)}
    />
  );
}
