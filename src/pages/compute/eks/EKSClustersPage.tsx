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
import Toggle from '@cloudscape-design/components/toggle';
import { EmptyState, WelcomePage } from '@/components/common';
import { eksClusters } from '@/data/mockData';
import { CreateEKSClusterModal } from './CreateEKSClusterModal';
import type { EKSCluster, EKSClusterStatus } from '@/types';

const PAGE_SIZE = 10;

// Set to true to simulate no resources (for demo purposes)
const SIMULATE_EMPTY = false;

function ClusterStatusIndicator({ status }: { status: EKSClusterStatus }) {
  const statusMap: Record<EKSClusterStatus, { type: 'success' | 'pending' | 'error' | 'in-progress'; label: string }> = {
    ACTIVE: { type: 'success', label: 'Active' },
    CREATING: { type: 'in-progress', label: 'Creating' },
    UPDATING: { type: 'in-progress', label: 'Updating' },
    DELETING: { type: 'pending', label: 'Deleting' },
    FAILED: { type: 'error', label: 'Failed' },
  };
  const config = statusMap[status];
  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

function EKSWelcomePage({ onGetStarted, onViewClusters }: { onGetStarted: () => void; onViewClusters: () => void }) {
  return (
    <WelcomePage
      title="Amazon Elastic Kubernetes Service"
      subtitle="Run Kubernetes without managing the control plane"
      description="Amazon EKS is a managed Kubernetes service that makes it easy to run Kubernetes on AWS without needing to install, operate, and maintain your own Kubernetes control plane. EKS runs upstream Kubernetes and is certified Kubernetes conformant."
      icon={
        <Box fontSize="display-l" color="text-status-info">
          <Icon name="settings" size="big" />
        </Box>
      }
      features={[
        {
          title: 'Managed control plane',
          description: 'EKS runs the Kubernetes control plane across multiple AWS Availability Zones, automatically detects and replaces unhealthy nodes.',
        },
        {
          title: 'Kubernetes conformant',
          description: 'EKS runs upstream Kubernetes. Applications running on EKS are fully compatible with any standard Kubernetes environment.',
        },
        {
          title: 'Integrated with AWS',
          description: 'Deep integration with IAM for authentication, VPC networking, and AWS services like CloudWatch, ALB, and more.',
        },
        {
          title: 'Flexible compute options',
          description: 'Run workloads on EC2, Fargate, or a combination of both. Use managed node groups or self-managed nodes.',
        },
        {
          title: 'Auto scaling',
          description: 'Automatically scale your Kubernetes cluster and workloads with Cluster Autoscaler and Horizontal Pod Autoscaler.',
        },
        {
          title: 'Security and compliance',
          description: 'Built-in security features including pod security policies, network policies, and integration with AWS security services.',
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
        { text: 'Getting started with Amazon EKS', href: '#' },
        { text: 'Amazon EKS User Guide', href: '#' },
        { text: 'Amazon EKS best practices', href: '#' },
        { text: 'Amazon EKS pricing', href: '#' },
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
  const [selectedItems, setSelectedItems] = useState<EKSCluster[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterText) return eksClusters;
    const lowerFilter = filterText.toLowerCase();
    return eksClusters.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerFilter) ||
        item.version.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
                <Button disabled={selectedItems.length !== 1}>Update version</Button>
                <Button disabled={selectedItems.length === 0}>Delete</Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create cluster
                </Button>
              </SpaceBetween>
            }
            description="Managed Kubernetes service for running containerized applications"
          >
            EKS Clusters
          </Header>
        }
        columnDefinitions={[
          {
            id: 'name',
            header: 'Cluster name',
            cell: (item) => <Link href={`/compute/eks/clusters/${item.name}`}>{item.name}</Link>,
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
            id: 'version',
            header: 'Kubernetes version',
            cell: (item) => item.version,
            sortingField: 'version',
          },
          {
            id: 'vpc',
            header: 'VPC',
            cell: (item) => <Link href={`/networking/vpcs/${item.vpcId}`}>{item.vpcId}</Link>,
          },
          {
            id: 'subnets',
            header: 'Subnets',
            cell: (item) => item.subnetIds.length,
          },
          {
            id: 'created',
            header: 'Created',
            cell: (item) => formatDate(item.createdAt),
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
            description="No EKS clusters found. Create your first cluster to get started with Kubernetes."
            actionLabel="Create cluster"
            onAction={onCreateCluster}
          />
        }
        stickyHeader
        variant="full-page"
      />

      <CreateEKSClusterModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        onCreate={(data) => {
          console.log('Create EKS cluster:', data);
          setShowCreateModal(false);
        }}
      />
    </>
  );
}

export function EKSClustersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Determine if we should show the welcome page
  // Show welcome if: no resources exist AND user hasn't dismissed it
  const hasResources = !SIMULATE_EMPTY && eksClusters.length > 0;

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
      <EKSWelcomePage
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
