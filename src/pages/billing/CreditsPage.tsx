import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Modal from '@cloudscape-design/components/modal';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import TokenGroup from '@cloudscape-design/components/token-group';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Alert from '@cloudscape-design/components/alert';
import { credits, savingsPlans, reservedInstances } from '@/data/mockData';
import type { Credit, SavingsPlan } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getCreditTypeLabel, getSavingsPlanTypeLabel, getPaymentOptionLabel } from '@/utils/labelMappers';
import { CreditStatusIndicator } from '@/components/indicators';

export function CreditsPage() {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');

  const activeCredits = credits.filter((c) => c.status === 'active');
  const totalActiveCredits = activeCredits.reduce((sum, c) => sum + c.remainingAmount, 0);
  const totalOriginalCredits = credits.reduce((sum, c) => sum + c.originalAmount, 0);

  const handleRedeemCode = () => {
    setShowRedeemModal(false);
    setRedeemCode('');
  };

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="View and manage your credits, savings plans, and reserved instances"
        actions={
          <Button onClick={() => setShowRedeemModal(true)}>
            Redeem credit code
          </Button>
        }
      >
        Credits & Savings
      </Header>

      {/* Summary Cards */}
      <ColumnLayout columns={4} variant="text-grid">
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Active Credits</Box>
            <Box variant="h1">{formatCurrency(totalActiveCredits)}</Box>
            <Box variant="small" color="text-body-secondary">
              {activeCredits.length} active credits
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Total Credits Received</Box>
            <Box variant="h1">{formatCurrency(totalOriginalCredits)}</Box>
            <Box variant="small" color="text-body-secondary">
              Lifetime credits
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Active Savings Plans</Box>
            <Box variant="h1">{savingsPlans.filter((sp) => sp.status === 'active').length}</Box>
            <Box variant="small" color="text-body-secondary">
              Avg. {(savingsPlans.reduce((sum, sp) => sum + sp.utilizationPercentage, 0) / savingsPlans.length).toFixed(1)}% utilization
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Reserved Instances</Box>
            <Box variant="h1">{reservedInstances.filter((ri) => ri.status === 'active').length}</Box>
            <Box variant="small" color="text-body-secondary">
              {reservedInstances.reduce((sum, ri) => sum + ri.instanceCount, 0)} total instances
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      {/* Main Content Tabs */}
      <Tabs
        tabs={[
          {
            id: 'credits',
            label: `Credits (${credits.length})`,
            content: (
              <SpaceBetween size="l">
                {/* Active Credits Cards */}
                <ColumnLayout columns={2}>
                  {activeCredits.map((credit) => {
                    const usedPercentage = ((credit.originalAmount - credit.remainingAmount) / credit.originalAmount) * 100;
                    const daysUntilExpiry = Math.ceil(
                      (new Date(credit.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <Container
                        key={credit.id}
                        header={
                          <Header
                            variant="h3"
                            description={getCreditTypeLabel(credit.type)}
                          >
                            {credit.name}
                          </Header>
                        }
                      >
                        <SpaceBetween size="m">
                          <ColumnLayout columns={2}>
                            <SpaceBetween size="xs">
                              <Box variant="awsui-key-label">Remaining</Box>
                              <Box variant="h2">{formatCurrency(credit.remainingAmount)}</Box>
                            </SpaceBetween>
                            <SpaceBetween size="xs">
                              <Box variant="awsui-key-label">Expires</Box>
                              <Box>
                                {formatDate(credit.expirationDate)}
                                {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                                  <Box variant="small" color="text-status-warning">
                                    ({daysUntilExpiry} days left)
                                  </Box>
                                )}
                              </Box>
                            </SpaceBetween>
                          </ColumnLayout>

                          <ProgressBar
                            value={usedPercentage}
                            description={`${formatCurrency(credit.originalAmount - credit.remainingAmount)} used of ${formatCurrency(credit.originalAmount)}`}
                          />

                          {credit.applicableServices !== 'all' && (
                            <SpaceBetween size="xs">
                              <Box variant="awsui-key-label">Applicable Services</Box>
                              <TokenGroup
                                items={(credit.applicableServices as string[]).map((s) => ({ label: s }))}
                                readOnly
                              />
                            </SpaceBetween>
                          )}
                        </SpaceBetween>
                      </Container>
                    );
                  })}
                </ColumnLayout>

                {/* All Credits Table */}
                <Table
                  columnDefinitions={[
                    {
                      id: 'name',
                      header: 'Credit Name',
                      cell: (item) => item.name,
                      sortingField: 'name',
                    },
                    {
                      id: 'type',
                      header: 'Type',
                      cell: (item) => getCreditTypeLabel(item.type),
                      sortingField: 'type',
                    },
                    {
                      id: 'original',
                      header: 'Original Amount',
                      cell: (item) => formatCurrency(item.originalAmount),
                      sortingField: 'originalAmount',
                    },
                    {
                      id: 'remaining',
                      header: 'Remaining',
                      cell: (item) => formatCurrency(item.remainingAmount),
                      sortingField: 'remainingAmount',
                    },
                    {
                      id: 'expiration',
                      header: 'Expiration Date',
                      cell: (item) => formatDate(item.expirationDate),
                      sortingField: 'expirationDate',
                    },
                    {
                      id: 'status',
                      header: 'Status',
                      cell: (item) => <CreditStatusIndicator status={item.status as 'active' | 'expired' | 'exhausted'} />,
                      sortingField: 'status',
                    },
                  ]}
                  items={credits}
                  header={<Header counter={`(${credits.length})`}>All Credits</Header>}
                  sortingColumn={{ sortingField: 'expirationDate' }}
                />
              </SpaceBetween>
            ),
          },
          {
            id: 'savings-plans',
            label: `Savings Plans (${savingsPlans.length})`,
            content: (
              <SpaceBetween size="l">
                <Alert type="info" header="About Savings Plans">
                  Savings Plans provide significant savings compared to On-Demand pricing in exchange
                  for a commitment to a consistent amount of usage (measured in $/hour) for a 1 or 3 year term.
                </Alert>

                <Table
                  columnDefinitions={[
                    {
                      id: 'type',
                      header: 'Savings Plan Type',
                      cell: (item) => getSavingsPlanTypeLabel(item.type),
                      sortingField: 'type',
                    },
                    {
                      id: 'commitment',
                      header: 'Hourly Commitment',
                      cell: (item) => formatCurrency(item.commitment),
                      sortingField: 'commitment',
                    },
                    {
                      id: 'paymentOption',
                      header: 'Payment Option',
                      cell: (item) => getPaymentOptionLabel(item.paymentOption),
                    },
                    {
                      id: 'term',
                      header: 'Term',
                      cell: (item) => `${item.term} year${item.term > 1 ? 's' : ''}`,
                    },
                    {
                      id: 'dates',
                      header: 'Start / End Date',
                      cell: (item) => `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
                    },
                    {
                      id: 'utilization',
                      header: 'Utilization',
                      cell: (item) => (
                        <ProgressBar
                          value={item.utilizationPercentage}
                          status={item.utilizationPercentage >= 80 ? 'success' : item.utilizationPercentage >= 50 ? 'in-progress' : 'error'}
                          description={`${item.utilizationPercentage}%`}
                        />
                      ),
                    },
                    {
                      id: 'savings',
                      header: 'Savings',
                      cell: (item) => (
                        <StatusIndicator type="success">
                          {item.savingsPercentage}% vs On-Demand
                        </StatusIndicator>
                      ),
                    },
                    {
                      id: 'status',
                      header: 'Status',
                      cell: (item) =>
                        item.status === 'active' ? (
                          <StatusIndicator type="success">Active</StatusIndicator>
                        ) : item.status === 'expired' ? (
                          <StatusIndicator type="stopped">Expired</StatusIndicator>
                        ) : (
                          <StatusIndicator type="pending">Queued</StatusIndicator>
                        ),
                    },
                  ]}
                  items={savingsPlans}
                  header={
                    <Header
                      counter={`(${savingsPlans.length})`}
                      actions={<Button variant="primary">Purchase Savings Plan</Button>}
                    >
                      Savings Plans
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit">
                      <b>No Savings Plans</b>
                      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                        Purchase a Savings Plan to reduce your compute costs.
                      </Box>
                      <Button>Purchase Savings Plan</Button>
                    </Box>
                  }
                />
              </SpaceBetween>
            ),
          },
          {
            id: 'reserved-instances',
            label: `Reserved Instances (${reservedInstances.length})`,
            content: (
              <SpaceBetween size="l">
                <Alert type="info" header="About Reserved Instances">
                  Reserved Instances provide a significant discount compared to On-Demand pricing
                  and provide a capacity reservation when used in a specific Availability Zone.
                </Alert>

                <Table
                  columnDefinitions={[
                    {
                      id: 'instanceType',
                      header: 'Instance Type',
                      cell: (item) => item.instanceType,
                      sortingField: 'instanceType',
                    },
                    {
                      id: 'platform',
                      header: 'Platform',
                      cell: (item) => item.platform,
                    },
                    {
                      id: 'region',
                      header: 'Region',
                      cell: (item) => item.region,
                    },
                    {
                      id: 'count',
                      header: 'Count',
                      cell: (item) => item.instanceCount,
                      sortingField: 'instanceCount',
                    },
                    {
                      id: 'term',
                      header: 'Term',
                      cell: (item) => `${item.term} year${item.term > 1 ? 's' : ''}`,
                    },
                    {
                      id: 'offering',
                      header: 'Offering Class',
                      cell: (item) => item.offeringClass.charAt(0).toUpperCase() + item.offeringClass.slice(1),
                    },
                    {
                      id: 'paymentOption',
                      header: 'Payment Option',
                      cell: (item) => getPaymentOptionLabel(item.paymentOption),
                    },
                    {
                      id: 'dates',
                      header: 'End Date',
                      cell: (item) => formatDate(item.endDate),
                    },
                    {
                      id: 'utilization',
                      header: 'Utilization',
                      cell: (item) => (
                        <ProgressBar
                          value={item.utilizationPercentage}
                          status={item.utilizationPercentage >= 80 ? 'success' : item.utilizationPercentage >= 50 ? 'in-progress' : 'error'}
                          description={`${item.utilizationPercentage}%`}
                        />
                      ),
                    },
                    {
                      id: 'status',
                      header: 'Status',
                      cell: (item) =>
                        item.status === 'active' ? (
                          <StatusIndicator type="success">Active</StatusIndicator>
                        ) : item.status === 'expired' ? (
                          <StatusIndicator type="stopped">Expired</StatusIndicator>
                        ) : (
                          <StatusIndicator type="pending">Payment Pending</StatusIndicator>
                        ),
                    },
                  ]}
                  items={reservedInstances}
                  header={
                    <Header
                      counter={`(${reservedInstances.length})`}
                      actions={<Button variant="primary">Purchase Reserved Instances</Button>}
                    >
                      Reserved Instances
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit">
                      <b>No Reserved Instances</b>
                      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                        Purchase Reserved Instances to save on EC2 costs.
                      </Box>
                      <Button>Purchase Reserved Instances</Button>
                    </Box>
                  }
                />
              </SpaceBetween>
            ),
          },
        ]}
      />

      {/* Redeem Code Modal */}
      <Modal
        visible={showRedeemModal}
        onDismiss={() => setShowRedeemModal(false)}
        size="medium"
        header="Redeem Credit Code"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowRedeemModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleRedeemCode} disabled={!redeemCode.trim()}>
                Redeem
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <FormField
            label="Credit code"
            description="Enter your promotional or credit code"
            constraintText="Codes are case-sensitive"
          >
            <Input
              value={redeemCode}
              onChange={({ detail }) => setRedeemCode(detail.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
            />
          </FormField>
        </Form>
      </Modal>
    </SpaceBetween>
  );
}
