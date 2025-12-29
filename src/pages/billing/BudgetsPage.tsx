import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import Multiselect from '@cloudscape-design/components/multiselect';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import Tiles from '@cloudscape-design/components/tiles';
import TokenGroup from '@cloudscape-design/components/token-group';
import { budgets } from '@/data/mockData';
import type { Budget } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

const budgetTypeOptions = [
  { label: 'Cost Budget', value: 'cost' },
  { label: 'Usage Budget', value: 'usage' },
  { label: 'Savings Plan Budget', value: 'savings_plan' },
  { label: 'Reservation Budget', value: 'reservation' },
];

const timeUnitOptions = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Annually', value: 'annually' },
];

const serviceOptions = [
  { label: 'Amazon EC2', value: 'Amazon EC2' },
  { label: 'Amazon S3', value: 'Amazon S3' },
  { label: 'Amazon RDS', value: 'Amazon RDS' },
  { label: 'Amazon Lambda', value: 'Amazon Lambda' },
  { label: 'Amazon EKS', value: 'Amazon EKS' },
  { label: 'Amazon CloudFront', value: 'Amazon CloudFront' },
  { label: 'AWS Data Transfer', value: 'AWS Data Transfer' },
];

function getBudgetStatus(budget: Budget): 'success' | 'warning' | 'error' {
  const percentage = (budget.currentSpend / budget.amount) * 100;
  if (percentage >= 100) return 'error';
  if (percentage >= 80) return 'warning';
  return 'success';
}

function getBudgetStatusText(budget: Budget): string {
  const percentage = (budget.currentSpend / budget.amount) * 100;
  if (percentage >= 100) return 'Exceeded';
  if (percentage >= 90) return 'Critical';
  if (percentage >= 80) return 'Warning';
  return 'On Track';
}

export function BudgetsPage() {
  const [selectedBudgets, setSelectedBudgets] = useState<Budget[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBudgetDetails, setSelectedBudgetDetails] = useState<Budget | null>(null);

  // Create form state
  const [budgetName, setBudgetName] = useState('');
  const [budgetType, setBudgetType] = useState(budgetTypeOptions[0]);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [timeUnit, setTimeUnit] = useState(timeUnitOptions[0]);
  const [selectedServices, setSelectedServices] = useState<readonly { label: string; value: string }[]>([]);
  const [alertEmails, setAlertEmails] = useState<{ label: string }[]>([]);
  const [alertThreshold, setAlertThreshold] = useState('80');

  const handleViewDetails = (budget: Budget) => {
    setSelectedBudgetDetails(budget);
    setShowDetailsModal(true);
  };

  const handleCreateBudget = () => {
    setShowCreateModal(false);
    setBudgetName('');
    setBudgetAmount('');
    setSelectedServices([]);
    setAlertEmails([]);
  };

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.currentSpend, 0);
  const budgetsWithAlerts = budgets.filter((b) => b.alerts.some((a) => a.triggered));

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Create and manage cost budgets to control your cloud spending"
        actions={
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Create budget
          </Button>
        }
      >
        Budgets
      </Header>

      {/* Summary Cards */}
      <ColumnLayout columns={4} variant="text-grid">
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Total Budgeted</Box>
            <Box variant="h1">{formatCurrency(totalBudgeted)}</Box>
            <Box variant="small" color="text-body-secondary">
              Across {budgets.length} budgets
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Total Spent</Box>
            <Box variant="h1">{formatCurrency(totalSpent)}</Box>
            <Box variant="small" color="text-body-secondary">
              {((totalSpent / totalBudgeted) * 100).toFixed(1)}% of total budget
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Budgets with Alerts</Box>
            <Box variant="h1">{budgetsWithAlerts.length}</Box>
            <Box variant="small" color="text-body-secondary">
              <StatusIndicator type="warning">
                Thresholds exceeded
              </StatusIndicator>
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Forecasted Overage</Box>
            <Box variant="h1">
              {formatCurrency(
                budgets.reduce((sum, b) => sum + Math.max(0, b.forecastedSpend - b.amount), 0)
              )}
            </Box>
            <Box variant="small" color="text-body-secondary">
              Based on current trends
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      {/* Budget Cards */}
      <ColumnLayout columns={2}>
        {budgets.map((budget) => {
          const percentage = (budget.currentSpend / budget.amount) * 100;
          const forecastPercentage = (budget.forecastedSpend / budget.amount) * 100;
          const status = getBudgetStatus(budget);

          return (
            <Container
              key={budget.id}
              header={
                <Header
                  variant="h2"
                  actions={
                    <SpaceBetween size="xs" direction="horizontal">
                      <Button onClick={() => handleViewDetails(budget)}>View details</Button>
                      <Button>Edit</Button>
                    </SpaceBetween>
                  }
                >
                  {budget.name}
                </Header>
              }
            >
              <SpaceBetween size="m">
                <ColumnLayout columns={2}>
                  <SpaceBetween size="xs">
                    <Box variant="awsui-key-label">Budget Amount</Box>
                    <Box variant="h3">{formatCurrency(budget.amount)}</Box>
                  </SpaceBetween>
                  <SpaceBetween size="xs">
                    <Box variant="awsui-key-label">Period</Box>
                    <Box>{budget.timeUnit.charAt(0).toUpperCase() + budget.timeUnit.slice(1)}</Box>
                  </SpaceBetween>
                </ColumnLayout>

                <SpaceBetween size="xs">
                  <Box variant="awsui-key-label">Current Spend</Box>
                  <ProgressBar
                    value={Math.min(percentage, 100)}
                    status={status === 'error' ? 'error' : status === 'warning' ? 'in-progress' : 'success'}
                    description={`${formatCurrency(budget.currentSpend)} of ${formatCurrency(budget.amount)}`}
                    additionalInfo={
                      <Box color={status === 'error' ? 'text-status-error' : status === 'warning' ? 'text-status-warning' : 'text-status-success'}>
                        {getBudgetStatusText(budget)} ({percentage.toFixed(1)}%)
                      </Box>
                    }
                  />
                </SpaceBetween>

                <SpaceBetween size="xs">
                  <Box variant="awsui-key-label">Forecasted Spend</Box>
                  <ProgressBar
                    value={Math.min(forecastPercentage, 100)}
                    status={forecastPercentage >= 100 ? 'error' : forecastPercentage >= 80 ? 'in-progress' : 'success'}
                    description={`${formatCurrency(budget.forecastedSpend)} forecasted`}
                    additionalInfo={
                      forecastPercentage > 100 ? (
                        <Box color="text-status-error">
                          Projected to exceed by {formatCurrency(budget.forecastedSpend - budget.amount)}
                        </Box>
                      ) : null
                    }
                  />
                </SpaceBetween>

                {budget.alerts.some((a) => a.triggered) && (
                  <Box>
                    <StatusIndicator type="warning">
                      {budget.alerts.filter((a) => a.triggered).length} alert(s) triggered
                    </StatusIndicator>
                  </Box>
                )}
              </SpaceBetween>
            </Container>
          );
        })}
      </ColumnLayout>

      {/* Budgets Table */}
      <Table
        columnDefinitions={[
          {
            id: 'name',
            header: 'Budget Name',
            cell: (item) => item.name,
            sortingField: 'name',
          },
          {
            id: 'type',
            header: 'Type',
            cell: (item) => item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('_', ' '),
            sortingField: 'type',
          },
          {
            id: 'amount',
            header: 'Budgeted Amount',
            cell: (item) => formatCurrency(item.amount),
            sortingField: 'amount',
          },
          {
            id: 'currentSpend',
            header: 'Current Spend',
            cell: (item) => formatCurrency(item.currentSpend),
            sortingField: 'currentSpend',
          },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => {
              const status = getBudgetStatus(item);
              return (
                <StatusIndicator
                  type={status === 'error' ? 'error' : status === 'warning' ? 'warning' : 'success'}
                >
                  {getBudgetStatusText(item)}
                </StatusIndicator>
              );
            },
          },
          {
            id: 'alerts',
            header: 'Alerts',
            cell: (item) => {
              const triggeredCount = item.alerts.filter((a) => a.triggered).length;
              return triggeredCount > 0 ? (
                <StatusIndicator type="warning">{triggeredCount} triggered</StatusIndicator>
              ) : (
                <StatusIndicator type="success">None</StatusIndicator>
              );
            },
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (item) => (
              <SpaceBetween size="xs" direction="horizontal">
                <Button variant="link" onClick={() => handleViewDetails(item)}>
                  View
                </Button>
                <Button variant="link">Edit</Button>
                <Button variant="link">Delete</Button>
              </SpaceBetween>
            ),
          },
        ]}
        items={budgets}
        selectionType="multi"
        selectedItems={selectedBudgets}
        onSelectionChange={({ detail }) => setSelectedBudgets(detail.selectedItems)}
        header={
          <Header
            counter={`(${budgets.length})`}
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button disabled={selectedBudgets.length === 0}>Delete</Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Create budget
                </Button>
              </SpaceBetween>
            }
          >
            All Budgets
          </Header>
        }
        empty={
          <Box textAlign="center" color="inherit">
            <b>No budgets</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              You haven't created any budgets yet.
            </Box>
            <Button onClick={() => setShowCreateModal(true)}>Create budget</Button>
          </Box>
        }
      />

      {/* Create Budget Modal */}
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        size="medium"
        header="Create Budget"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateBudget}>
                Create budget
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="m">
            <FormField label="Budget name" description="A descriptive name for your budget">
              <Input
                value={budgetName}
                onChange={({ detail }) => setBudgetName(detail.value)}
                placeholder="e.g., Monthly Cloud Spend"
              />
            </FormField>

            <FormField label="Budget type">
              <Tiles
                items={budgetTypeOptions.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                  description: opt.value === 'cost' ? 'Track spending in your preferred currency' :
                    opt.value === 'usage' ? 'Track usage quantities' :
                    opt.value === 'savings_plan' ? 'Track Savings Plan utilization' :
                    'Track Reserved Instance utilization',
                }))}
                value={budgetType.value}
                onChange={({ detail }) => {
                  const selected = budgetTypeOptions.find((opt) => opt.value === detail.value);
                  if (selected) setBudgetType(selected);
                }}
              />
            </FormField>

            <FormField label="Budget amount (INR)">
              <Input
                type="number"
                value={budgetAmount}
                onChange={({ detail }) => setBudgetAmount(detail.value)}
                placeholder="50000"
              />
            </FormField>

            <FormField label="Budget period">
              <Select
                selectedOption={timeUnit}
                onChange={({ detail }) => setTimeUnit(detail.selectedOption as typeof timeUnit)}
                options={timeUnitOptions}
              />
            </FormField>

            <FormField
              label="Filter by services"
              description="Optional: limit budget to specific services"
            >
              <Multiselect
                selectedOptions={[...selectedServices]}
                onChange={({ detail }) => setSelectedServices(detail.selectedOptions as typeof selectedServices)}
                options={serviceOptions}
                placeholder="All services"
              />
            </FormField>

            <FormField label="Alert threshold (%)" description="Get notified when spending reaches this percentage">
              <Input
                type="number"
                value={alertThreshold}
                onChange={({ detail }) => setAlertThreshold(detail.value)}
              />
            </FormField>

            <FormField label="Alert email addresses">
              <TokenGroup
                items={alertEmails}
                onDismiss={({ detail }) => {
                  setAlertEmails(alertEmails.filter((_, i) => i !== detail.itemIndex));
                }}
              />
              <Input
                placeholder="Enter email and press Enter"
                onKeyDown={({ detail }) => {
                  if (detail.key === 'Enter' && detail.target instanceof HTMLInputElement) {
                    const email = detail.target.value.trim();
                    if (email && !alertEmails.some((e) => e.label === email)) {
                      setAlertEmails([...alertEmails, { label: email }]);
                      detail.target.value = '';
                    }
                  }
                }}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>

      {/* Budget Details Modal */}
      <Modal
        visible={showDetailsModal}
        onDismiss={() => setShowDetailsModal(false)}
        size="large"
        header={selectedBudgetDetails?.name}
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button>Edit Budget</Button>
            </SpaceBetween>
          </Box>
        }
      >
        {selectedBudgetDetails && (
          <SpaceBetween size="l">
            <ColumnLayout columns={3}>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Budget Type</Box>
                <Box>{selectedBudgetDetails.type}</Box>
              </SpaceBetween>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Budget Amount</Box>
                <Box>{formatCurrency(selectedBudgetDetails.amount)}</Box>
              </SpaceBetween>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Period</Box>
                <Box>{selectedBudgetDetails.timeUnit}</Box>
              </SpaceBetween>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Start Date</Box>
                <Box>{formatDate(selectedBudgetDetails.startDate)}</Box>
              </SpaceBetween>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Current Spend</Box>
                <Box>{formatCurrency(selectedBudgetDetails.currentSpend)}</Box>
              </SpaceBetween>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Forecasted Spend</Box>
                <Box>{formatCurrency(selectedBudgetDetails.forecastedSpend)}</Box>
              </SpaceBetween>
            </ColumnLayout>

            <Container header={<Header variant="h3">Alerts</Header>}>
              <Table
                columnDefinitions={[
                  {
                    id: 'threshold',
                    header: 'Threshold',
                    cell: (item) =>
                      item.thresholdType === 'percentage'
                        ? `${item.threshold}%`
                        : formatCurrency(item.threshold),
                  },
                  {
                    id: 'type',
                    header: 'Notification Type',
                    cell: (item) =>
                      item.notificationType === 'actual' ? 'Actual spend' : 'Forecasted spend',
                  },
                  {
                    id: 'emails',
                    header: 'Recipients',
                    cell: (item) => item.emails.join(', '),
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (item) =>
                      item.triggered ? (
                        <StatusIndicator type="warning">
                          Triggered on {item.triggeredAt ? formatDate(item.triggeredAt) : 'N/A'}
                        </StatusIndicator>
                      ) : (
                        <StatusIndicator type="success">Not triggered</StatusIndicator>
                      ),
                  },
                ]}
                items={selectedBudgetDetails.alerts}
                variant="embedded"
              />
            </Container>

            {selectedBudgetDetails.filters.services && selectedBudgetDetails.filters.services.length > 0 && (
              <Container header={<Header variant="h3">Filters</Header>}>
                <SpaceBetween size="xs">
                  <Box variant="awsui-key-label">Services</Box>
                  <Box>{selectedBudgetDetails.filters.services.join(', ')}</Box>
                </SpaceBetween>
              </Container>
            )}
          </SpaceBetween>
        )}
      </Modal>
    </SpaceBetween>
  );
}
