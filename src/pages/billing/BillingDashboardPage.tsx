import { useMemo } from 'react';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import BarChart from '@cloudscape-design/components/bar-chart';
import PieChart from '@cloudscape-design/components/pie-chart';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { InvoiceStatusIndicator } from '@/components/indicators';
import {
  invoices,
  costDataMonthly,
  costByService,
  costForecast,
  budgets,
  credits,
  freeTierUsage,
} from '@/data/mockData';

export function BillingDashboardPage() {
  const currentInvoice = invoices[0];
  const totalCredits = credits
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.remainingAmount, 0);

  const monthlyChartData = useMemo(() => {
    return costDataMonthly.slice(-6).map((item) => ({
      x: item.date,
      y: item.cost,
    }));
  }, []);

  const serviceChartData = useMemo(() => {
    return costByService.slice(0, 5).map((item) => ({
      title: item.service.replace('Amazon ', '').replace('AWS ', ''),
      value: item.cost,
      percentage: item.percentageOfTotal,
    }));
  }, []);

  const activeBudgetsWithAlerts = budgets.filter((b) =>
    b.alerts.some((a) => a.triggered)
  );

  const freeTierWarnings = freeTierUsage.filter((f) => f.percentageUsed >= 80);

  return (
    <SpaceBetween size="l">
      <Header variant="h1" description="Overview of your Bhoomi Cloud billing and cost management">
        Billing Dashboard
      </Header>

      {/* Key Metrics */}
      <ColumnLayout columns={4} variant="text-grid">
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Current Month Charges</Box>
            <Box variant="h1">{formatCurrency(currentInvoice.subtotal)}</Box>
            <Box variant="small" color="text-body-secondary">
              Billing period: {formatDate(currentInvoice.billingPeriodStart)} - {formatDate(currentInvoice.billingPeriodEnd)}
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Forecasted Month-End</Box>
            <Box variant="h1">{formatCurrency(costForecast.forecastedAmount)}</Box>
            <Box variant="small" color="text-body-secondary">
              {costForecast.confidence}% confidence interval
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Available Credits</Box>
            <Box variant="h1">{formatCurrency(totalCredits)}</Box>
            <Box variant="small" color="text-body-secondary">
              <Link href="/billing/credits">{credits.filter((c) => c.status === 'active').length} active credits</Link>
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Last Invoice Status</Box>
            <Box variant="h1">
              <InvoiceStatusIndicator status={currentInvoice.status as 'paid' | 'pending' | 'overdue' | 'draft'} />
            </Box>
            <Box variant="small" color="text-body-secondary">
              <Link href="/billing/bills">{currentInvoice.invoiceNumber}</Link>
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      {/* Budget Alerts */}
      {activeBudgetsWithAlerts.length > 0 && (
        <Container
          header={
            <Header
              variant="h2"
              description="Budgets that have exceeded alert thresholds"
              actions={<Link href="/billing/budgets">View all budgets</Link>}
            >
              Budget Alerts
            </Header>
          }
        >
          <SpaceBetween size="m">
            {activeBudgetsWithAlerts.map((budget) => {
              const percentage = (budget.currentSpend / budget.amount) * 100;
              return (
                <Box key={budget.id}>
                  <SpaceBetween size="xs">
                    <Box variant="h4">{budget.name}</Box>
                    <ProgressBar
                      value={percentage}
                      status={percentage >= 100 ? 'error' : percentage >= 80 ? 'in-progress' : 'success'}
                      description={`${formatCurrency(budget.currentSpend)} of ${formatCurrency(budget.amount)} budget`}
                      additionalInfo={`Forecasted: ${formatCurrency(budget.forecastedSpend)}`}
                    />
                  </SpaceBetween>
                </Box>
              );
            })}
          </SpaceBetween>
        </Container>
      )}

      {/* Charts Row */}
      <ColumnLayout columns={2}>
        <Container
          header={
            <Header
              variant="h2"
              actions={<Link href="/billing/cost-explorer">View Cost Explorer</Link>}
            >
              Monthly Spend Trend
            </Header>
          }
        >
          <BarChart
            series={[
              {
                title: 'Monthly Cost',
                type: 'bar',
                data: monthlyChartData,
                valueFormatter: (value) => formatCurrency(value),
              },
            ]}
            xTitle="Month"
            yTitle="Cost (INR)"
            height={250}
            hideFilter
            hideLegend
          />
        </Container>

        <Container
          header={
            <Header
              variant="h2"
              actions={<Link href="/billing/cost-explorer">View breakdown</Link>}
            >
              Cost by Service
            </Header>
          }
        >
          <PieChart
            data={serviceChartData}
            detailPopoverContent={(datum) => [
              { key: 'Cost', value: formatCurrency(datum.value) },
              { key: 'Percentage', value: `${datum.percentage}%` },
            ]}
            segmentDescription={(datum) =>
              `${datum.title}: ${formatCurrency(datum.value)}`
            }
            size="medium"
            hideFilter
            hideLegend={false}
            variant="donut"
            innerMetricDescription="Total"
            innerMetricValue={formatCurrency(costByService.reduce((sum, s) => sum + s.cost, 0))}
          />
        </Container>
      </ColumnLayout>

      {/* Free Tier Usage Warnings */}
      {freeTierWarnings.length > 0 && (
        <Container
          header={
            <Header
              variant="h2"
              description="Free tier limits approaching or exceeded"
            >
              Free Tier Usage Alerts
            </Header>
          }
        >
          <ColumnLayout columns={3}>
            {freeTierWarnings.map((usage, index) => (
              <Box key={index}>
                <SpaceBetween size="xs">
                  <Box variant="h4">{usage.service}</Box>
                  <Box variant="small">{usage.usageType}</Box>
                  <ProgressBar
                    value={usage.percentageUsed}
                    status={usage.percentageUsed >= 100 ? 'error' : usage.percentageUsed >= 90 ? 'in-progress' : 'success'}
                    description={`${usage.used.toLocaleString()} / ${usage.limit.toLocaleString()} ${usage.unit}`}
                  />
                </SpaceBetween>
              </Box>
            ))}
          </ColumnLayout>
        </Container>
      )}

      {/* Quick Links */}
      <Container
        header={<Header variant="h2">Quick Links</Header>}
      >
        <ColumnLayout columns={4}>
          <Link href="/billing/bills" variant="primary">
            View Bills & Payments
          </Link>
          <Link href="/billing/payment-methods" variant="primary">
            Manage Payment Methods
          </Link>
          <Link href="/billing/budgets" variant="primary">
            Manage Budgets
          </Link>
          <Link href="/billing/cost-allocation-tags" variant="primary">
            Cost Allocation Tags
          </Link>
        </ColumnLayout>
      </Container>
    </SpaceBetween>
  );
}
