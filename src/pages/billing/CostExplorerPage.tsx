import { useState, useMemo } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import DateRangePicker from '@cloudscape-design/components/date-range-picker';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import AreaChart from '@cloudscape-design/components/area-chart';
import BarChart from '@cloudscape-design/components/bar-chart';
import PieChart from '@cloudscape-design/components/pie-chart';
import type { DateRangePickerProps } from '@cloudscape-design/components/date-range-picker';
import {
  costDataDaily,
  costDataMonthly,
  costByService,
  costByRegion,
  costForecast,
  costAnomalies,
} from '@/data/mockData';
import type { CostAnomaly } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

function getAnomalyStatusIndicator(status: CostAnomaly['status']) {
  switch (status) {
    case 'open':
      return <StatusIndicator type="warning">Open</StatusIndicator>;
    case 'acknowledged':
      return <StatusIndicator type="in-progress">Acknowledged</StatusIndicator>;
    case 'resolved':
      return <StatusIndicator type="success">Resolved</StatusIndicator>;
    default:
      return <StatusIndicator type="info">{status}</StatusIndicator>;
  }
}

const granularityOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
];

const groupByOptions = [
  { label: 'Service', value: 'service' },
  { label: 'Region', value: 'region' },
  { label: 'Usage Type', value: 'usage_type' },
  { label: 'Tag', value: 'tag' },
];

export function CostExplorerPage() {
  const [granularity, setGranularity] = useState(granularityOptions[0]);
  const [groupBy, setGroupBy] = useState(groupByOptions[0]);
  const [dateRange, setDateRange] = useState<DateRangePickerProps.Value | null>({
    type: 'relative',
    amount: 30,
    unit: 'day',
  });

  const chartData = useMemo(() => {
    if (granularity.value === 'daily') {
      return costDataDaily.map((item) => ({
        x: new Date(item.date),
        y: item.cost,
      }));
    }
    return costDataMonthly.map((item) => ({
      x: new Date(item.date + '-01'),
      y: item.cost,
    }));
  }, [granularity.value]);

  const totalCost = useMemo(() => {
    return costByService.reduce((sum, s) => sum + s.cost, 0);
  }, []);

  const serviceChartData = useMemo(() => {
    return costByService.map((item) => ({
      title: item.service.replace('Amazon ', '').replace('AWS ', ''),
      value: item.cost,
      percentage: item.percentageOfTotal,
    }));
  }, []);

  const regionChartData = useMemo(() => {
    return costByRegion.map((item) => ({
      x: item.regionName.split(' (')[0],
      y: item.cost,
    }));
  }, []);

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Analyze and visualize your cloud spending patterns"
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <ButtonDropdown
              items={[
                { id: 'csv', text: 'Export as CSV' },
                { id: 'pdf', text: 'Export as PDF' },
              ]}
            >
              Export
            </ButtonDropdown>
            <Button iconName="refresh">Refresh</Button>
          </SpaceBetween>
        }
      >
        Cost Explorer
      </Header>

      {/* Filters */}
      <Container>
        <ColumnLayout columns={4}>
          <FormField label="Date Range">
            <DateRangePicker
              value={dateRange}
              onChange={({ detail }) => setDateRange(detail.value)}
              relativeOptions={[
                { key: '7-days', amount: 7, unit: 'day', type: 'relative' },
                { key: '30-days', amount: 30, unit: 'day', type: 'relative' },
                { key: '90-days', amount: 90, unit: 'day', type: 'relative' },
                { key: '6-months', amount: 6, unit: 'month', type: 'relative' },
                { key: '1-year', amount: 1, unit: 'year', type: 'relative' },
              ]}
              isValidRange={() => ({ valid: true })}
              placeholder="Select date range"
              i18nStrings={{
                todayAriaLabel: 'Today',
                nextMonthAriaLabel: 'Next month',
                previousMonthAriaLabel: 'Previous month',
                customRelativeRangeDurationLabel: 'Duration',
                customRelativeRangeDurationPlaceholder: 'Enter duration',
                customRelativeRangeOptionLabel: 'Custom range',
                customRelativeRangeOptionDescription: 'Set a custom range in the past',
                customRelativeRangeUnitLabel: 'Unit of time',
                formatRelativeRange: (e) => `Last ${e.amount} ${e.unit}${e.amount > 1 ? 's' : ''}`,
                formatUnit: (unit, value) => (value === 1 ? unit : `${unit}s`),
                dateTimeConstraintText: '',
                relativeModeTitle: 'Relative range',
                absoluteModeTitle: 'Absolute range',
                relativeRangeSelectionHeading: 'Choose a range',
                startDateLabel: 'Start date',
                endDateLabel: 'End date',
                startTimeLabel: 'Start time',
                endTimeLabel: 'End time',
                clearButtonLabel: 'Clear and dismiss',
                cancelButtonLabel: 'Cancel',
                applyButtonLabel: 'Apply',
              }}
            />
          </FormField>
          <FormField label="Granularity">
            <Select
              selectedOption={granularity}
              onChange={({ detail }) => setGranularity(detail.selectedOption as typeof granularity)}
              options={granularityOptions}
            />
          </FormField>
          <FormField label="Group By">
            <Select
              selectedOption={groupBy}
              onChange={({ detail }) => setGroupBy(detail.selectedOption as typeof groupBy)}
              options={groupByOptions}
            />
          </FormField>
          <Box padding={{ top: 'l' }}>
            <Button variant="primary">Apply Filters</Button>
          </Box>
        </ColumnLayout>
      </Container>

      {/* Summary Cards */}
      <ColumnLayout columns={4} variant="text-grid">
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Total Cost (This Period)</Box>
            <Box variant="h1">{formatCurrency(totalCost)}</Box>
          </SpaceBetween>
        </Container>
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Forecasted Month-End</Box>
            <Box variant="h1">{formatCurrency(costForecast.forecastedAmount)}</Box>
            <Box variant="small" color="text-body-secondary">
              Range: {formatCurrency(costForecast.lowerBound)} - {formatCurrency(costForecast.upperBound)}
            </Box>
          </SpaceBetween>
        </Container>
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Daily Average</Box>
            <Box variant="h1">
              {formatCurrency(costDataDaily.reduce((sum, d) => sum + d.cost, 0) / costDataDaily.length)}
            </Box>
          </SpaceBetween>
        </Container>
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Month-over-Month Change</Box>
            <Box variant="h1">
              <StatusIndicator type="warning">+8.5%</StatusIndicator>
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      {/* Main Cost Chart */}
      <Container
        header={
          <Header variant="h2">
            Cost Over Time
          </Header>
        }
      >
        <AreaChart
          series={[
            {
              title: 'Cost',
              type: 'area',
              data: chartData,
              valueFormatter: (value) => formatCurrency(value),
            },
          ]}
          xScaleType="time"
          xTitle="Date"
          yTitle="Cost (INR)"
          height={300}
          hideFilter
        />
      </Container>

      {/* Breakdown Charts */}
      <Tabs
        tabs={[
          {
            id: 'by-service',
            label: 'By Service',
            content: (
              <ColumnLayout columns={2}>
                <Container header={<Header variant="h3">Cost by Service</Header>}>
                  <PieChart
                    data={serviceChartData}
                    detailPopoverContent={(datum) => [
                      { key: 'Cost', value: formatCurrency(datum.value) },
                      { key: 'Percentage', value: `${datum.percentage}%` },
                    ]}
                    size="medium"
                    variant="donut"
                    innerMetricDescription="Total"
                    innerMetricValue={formatCurrency(totalCost)}
                  />
                </Container>
                <Container header={<Header variant="h3">Service Cost Breakdown</Header>}>
                  <Table
                    columnDefinitions={[
                      {
                        id: 'service',
                        header: 'Service',
                        cell: (item) => item.service,
                        sortingField: 'service',
                      },
                      {
                        id: 'cost',
                        header: 'Cost',
                        cell: (item) => formatCurrency(item.cost),
                        sortingField: 'cost',
                      },
                      {
                        id: 'percentage',
                        header: '% of Total',
                        cell: (item) => `${item.percentageOfTotal}%`,
                        sortingField: 'percentageOfTotal',
                      },
                      {
                        id: 'change',
                        header: 'Change',
                        cell: (item) => (
                          <StatusIndicator
                            type={item.change > 0 ? 'warning' : item.change < 0 ? 'success' : 'info'}
                          >
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </StatusIndicator>
                        ),
                        sortingField: 'change',
                      },
                    ]}
                    items={costByService}
                    variant="embedded"
                    sortingColumn={{ sortingField: 'cost' }}
                    sortingDescending
                  />
                </Container>
              </ColumnLayout>
            ),
          },
          {
            id: 'by-region',
            label: 'By Region',
            content: (
              <ColumnLayout columns={2}>
                <Container header={<Header variant="h3">Cost by Region</Header>}>
                  <BarChart
                    series={[
                      {
                        title: 'Cost',
                        type: 'bar',
                        data: regionChartData,
                        valueFormatter: (value) => formatCurrency(value),
                      },
                    ]}
                    xTitle="Region"
                    yTitle="Cost (INR)"
                    height={250}
                    hideFilter
                    hideLegend
                  />
                </Container>
                <Container header={<Header variant="h3">Region Cost Breakdown</Header>}>
                  <Table
                    columnDefinitions={[
                      {
                        id: 'region',
                        header: 'Region',
                        cell: (item) => item.regionName,
                        sortingField: 'regionName',
                      },
                      {
                        id: 'cost',
                        header: 'Cost',
                        cell: (item) => formatCurrency(item.cost),
                        sortingField: 'cost',
                      },
                      {
                        id: 'percentage',
                        header: '% of Total',
                        cell: (item) => `${item.percentageOfTotal}%`,
                        sortingField: 'percentageOfTotal',
                      },
                    ]}
                    items={costByRegion}
                    variant="embedded"
                    sortingColumn={{ sortingField: 'cost' }}
                    sortingDescending
                  />
                </Container>
              </ColumnLayout>
            ),
          },
          {
            id: 'anomalies',
            label: 'Cost Anomalies',
            content: (
              <Table
                columnDefinitions={[
                  {
                    id: 'service',
                    header: 'Service',
                    cell: (item) => item.service,
                    sortingField: 'service',
                  },
                  {
                    id: 'detectedAt',
                    header: 'Detected',
                    cell: (item) => formatDate(item.detectedAt),
                    sortingField: 'detectedAt',
                  },
                  {
                    id: 'expectedCost',
                    header: 'Expected Cost',
                    cell: (item) => formatCurrency(item.expectedCost),
                    sortingField: 'expectedCost',
                  },
                  {
                    id: 'actualCost',
                    header: 'Actual Cost',
                    cell: (item) => formatCurrency(item.actualCost),
                    sortingField: 'actualCost',
                  },
                  {
                    id: 'impact',
                    header: 'Impact',
                    cell: (item) => (
                      <Box color="text-status-error">+{formatCurrency(item.impact)}</Box>
                    ),
                    sortingField: 'impact',
                  },
                  {
                    id: 'rootCause',
                    header: 'Root Cause',
                    cell: (item) => item.rootCause || '-',
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (item) => getAnomalyStatusIndicator(item.status),
                    sortingField: 'status',
                  },
                  {
                    id: 'actions',
                    header: 'Actions',
                    cell: (item) => (
                      <SpaceBetween size="xs" direction="horizontal">
                        {item.status === 'open' && (
                          <Button variant="link">Acknowledge</Button>
                        )}
                        {item.status !== 'resolved' && (
                          <Button variant="link">Resolve</Button>
                        )}
                      </SpaceBetween>
                    ),
                  },
                ]}
                items={costAnomalies}
                header={
                  <Header
                    counter={`(${costAnomalies.length})`}
                    description="Unusual spending patterns detected in your account"
                  >
                    Cost Anomalies
                  </Header>
                }
                empty={
                  <Box textAlign="center" color="inherit">
                    <b>No anomalies detected</b>
                    <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                      Your spending patterns are within expected ranges.
                    </Box>
                  </Box>
                }
              />
            ),
          },
        ]}
      />
    </SpaceBetween>
  );
}
