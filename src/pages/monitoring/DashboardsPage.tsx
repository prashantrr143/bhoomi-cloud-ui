import { useState, useMemo } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Cards from '@cloudscape-design/components/cards';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Link from '@cloudscape-design/components/link';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import TextFilter from '@cloudscape-design/components/text-filter';
import Badge from '@cloudscape-design/components/badge';
import { EmptyState } from '@/components/common';
import { cloudWatchDashboards } from '@/data/mockData';
import { formatDateTime } from '@/utils/formatters';
import type { CloudWatchDashboard } from '@/types';

export function DashboardsPage() {
  const [selectedItems, setSelectedItems] = useState<CloudWatchDashboard[]>([]);
  const [filterText, setFilterText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [dashboardName, setDashboardName] = useState('');

  const filteredItems = useMemo(() => {
    if (!filterText) return cloudWatchDashboards;
    const lowerFilter = filterText.toLowerCase();
    return cloudWatchDashboards.filter((item) =>
      item.name.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const handleCreateDashboard = () => {
    console.log('Create dashboard:', { dashboardName });
    setShowCreateModal(false);
    setDashboardName('');
  };

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        counter={`(${filteredItems.length})`}
        description="Create and manage CloudWatch dashboards to visualize your metrics"
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button disabled={selectedItems.length !== 1}>Edit</Button>
            <Button disabled={selectedItems.length === 0}>Delete</Button>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create dashboard
            </Button>
          </SpaceBetween>
        }
      >
        CloudWatch Dashboards
      </Header>

      <TextFilter
        filteringText={filterText}
        filteringPlaceholder="Find dashboards"
        filteringAriaLabel="Filter dashboards"
        onChange={({ detail }) => setFilterText(detail.filteringText)}
      />

      <Cards
        cardDefinition={{
          header: (item) => (
            <SpaceBetween size="xs" direction="horizontal">
              <Link href={`/monitoring/dashboards/${item.id}`} fontSize="heading-m">
                {item.name}
              </Link>
              {item.isDefault && <Badge color="blue">Default</Badge>}
            </SpaceBetween>
          ),
          sections: [
            {
              id: 'widgets',
              header: 'Widgets',
              content: (item) => (
                <SpaceBetween size="xs">
                  <Box>{item.widgets.length} widgets</Box>
                  <Box variant="small" color="text-body-secondary">
                    {item.widgets.filter((w) => w.type === 'metric').length} metric,{' '}
                    {item.widgets.filter((w) => w.type === 'alarm').length} alarm,{' '}
                    {item.widgets.filter((w) => w.type === 'text').length} text
                  </Box>
                </SpaceBetween>
              ),
            },
            {
              id: 'updated',
              header: 'Last updated',
              content: (item) => formatDateTime(item.updatedAt),
            },
            {
              id: 'created',
              header: 'Created',
              content: (item) => formatDateTime(item.createdAt),
            },
          ],
        }}
        items={filteredItems}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="id"
        cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }, { minWidth: 900, cards: 3 }]}
        empty={
          <EmptyState
            title="No dashboards"
            description="No CloudWatch dashboards found. Create your first dashboard to visualize your metrics."
            actionLabel="Create dashboard"
            onAction={() => setShowCreateModal(true)}
          />
        }
      />

      {/* Create Dashboard Modal */}
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        size="medium"
        header="Create dashboard"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateDashboard} disabled={!dashboardName.trim()}>
                Create dashboard
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <FormField
            label="Dashboard name"
            description="Enter a unique name for your dashboard"
          >
            <Input
              value={dashboardName}
              onChange={({ detail }) => setDashboardName(detail.value)}
              placeholder="e.g., Production-Overview"
            />
          </FormField>
        </Form>
      </Modal>
    </SpaceBetween>
  );
}
