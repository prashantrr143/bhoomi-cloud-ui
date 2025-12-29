import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import LineChart from '@cloudscape-design/components/line-chart';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tabs from '@cloudscape-design/components/tabs';
import { sampleMetricData } from '@/data/mockData';

const namespaceOptions = [
  { label: 'AWS/EC2', value: 'AWS/EC2' },
  { label: 'AWS/Lambda', value: 'AWS/Lambda' },
  { label: 'AWS/RDS', value: 'AWS/RDS' },
  { label: 'AWS/EKS', value: 'AWS/EKS' },
  { label: 'AWS/S3', value: 'AWS/S3' },
  { label: 'AWS/ApplicationELB', value: 'AWS/ApplicationELB' },
  { label: 'AWS/EBS', value: 'AWS/EBS' },
  { label: 'Custom', value: 'Custom' },
];

const metricOptions: Record<string, { label: string; value: string }[]> = {
  'AWS/EC2': [
    { label: 'CPUUtilization', value: 'CPUUtilization' },
    { label: 'NetworkIn', value: 'NetworkIn' },
    { label: 'NetworkOut', value: 'NetworkOut' },
    { label: 'DiskReadOps', value: 'DiskReadOps' },
    { label: 'DiskWriteOps', value: 'DiskWriteOps' },
    { label: 'StatusCheckFailed', value: 'StatusCheckFailed' },
  ],
  'AWS/Lambda': [
    { label: 'Invocations', value: 'Invocations' },
    { label: 'Duration', value: 'Duration' },
    { label: 'Errors', value: 'Errors' },
    { label: 'Throttles', value: 'Throttles' },
    { label: 'ConcurrentExecutions', value: 'ConcurrentExecutions' },
  ],
  'AWS/RDS': [
    { label: 'CPUUtilization', value: 'CPUUtilization' },
    { label: 'DatabaseConnections', value: 'DatabaseConnections' },
    { label: 'FreeableMemory', value: 'FreeableMemory' },
    { label: 'ReadIOPS', value: 'ReadIOPS' },
    { label: 'WriteIOPS', value: 'WriteIOPS' },
  ],
};

const statisticOptions = [
  { label: 'Average', value: 'Average' },
  { label: 'Sum', value: 'Sum' },
  { label: 'Minimum', value: 'Minimum' },
  { label: 'Maximum', value: 'Maximum' },
  { label: 'Sample Count', value: 'SampleCount' },
  { label: 'p99', value: 'p99' },
  { label: 'p95', value: 'p95' },
  { label: 'p90', value: 'p90' },
];

const periodOptions = [
  { label: '1 minute', value: '60' },
  { label: '5 minutes', value: '300' },
  { label: '15 minutes', value: '900' },
  { label: '1 hour', value: '3600' },
  { label: '6 hours', value: '21600' },
  { label: '1 day', value: '86400' },
];

export function MetricsPage() {
  const [namespace, setNamespace] = useState({ label: 'AWS/EC2', value: 'AWS/EC2' });
  const [metric, setMetric] = useState({ label: 'CPUUtilization', value: 'CPUUtilization' });
  const [statistic, setStatistic] = useState({ label: 'Average', value: 'Average' });
  const [period, setPeriod] = useState({ label: '5 minutes', value: '300' });

  // Get EC2 CPU data for the chart
  const ec2CpuData = sampleMetricData.filter(
    (m) => m.metric.namespace === 'AWS/EC2' && m.metric.metricName === 'CPUUtilization'
  );

  const chartSeries = ec2CpuData.map((m) => ({
    title: m.label || 'Unknown',
    type: 'line' as const,
    data: m.datapoints.map((dp) => ({
      x: new Date(dp.timestamp),
      y: dp.value,
    })),
  }));

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Explore and graph CloudWatch metrics"
      >
        Metrics Explorer
      </Header>

      <Tabs
        tabs={[
          {
            id: 'explorer',
            label: 'Metrics Explorer',
            content: (
              <SpaceBetween size="l">
                {/* Metric Selection */}
                <Container
                  header={<Header variant="h2">Select metric</Header>}
                >
                  <ColumnLayout columns={4}>
                    <FormField label="Namespace">
                      <Select
                        selectedOption={namespace}
                        onChange={({ detail }) => {
                          setNamespace(detail.selectedOption as typeof namespace);
                          const metrics = metricOptions[detail.selectedOption.value || ''] || [];
                          if (metrics.length > 0) {
                            setMetric(metrics[0]);
                          }
                        }}
                        options={namespaceOptions}
                      />
                    </FormField>

                    <FormField label="Metric name">
                      <Select
                        selectedOption={metric}
                        onChange={({ detail }) => setMetric(detail.selectedOption as typeof metric)}
                        options={metricOptions[namespace.value] || []}
                      />
                    </FormField>

                    <FormField label="Statistic">
                      <Select
                        selectedOption={statistic}
                        onChange={({ detail }) => setStatistic(detail.selectedOption as typeof statistic)}
                        options={statisticOptions}
                      />
                    </FormField>

                    <FormField label="Period">
                      <Select
                        selectedOption={period}
                        onChange={({ detail }) => setPeriod(detail.selectedOption as typeof period)}
                        options={periodOptions}
                      />
                    </FormField>
                  </ColumnLayout>
                </Container>

                {/* Chart */}
                <Container
                  header={
                    <Header
                      variant="h2"
                      actions={
                        <SpaceBetween size="xs" direction="horizontal">
                          <Button>Add to dashboard</Button>
                          <Button>Create alarm</Button>
                        </SpaceBetween>
                      }
                    >
                      {namespace.label} / {metric.label}
                    </Header>
                  }
                >
                  <LineChart
                    series={chartSeries}
                    xDomain={[
                      new Date(Date.now() - 24 * 60 * 60 * 1000),
                      new Date(),
                    ]}
                    yDomain={[0, 100]}
                    i18nStrings={{
                      xTickFormatter: (e) =>
                        e.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      yTickFormatter: (e) => `${e}%`,
                    }}
                    height={350}
                    hideFilter
                    xScaleType="time"
                    xTitle="Time"
                    yTitle={`${statistic.label} (%)`}
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No data available</b>
                        <Box variant="p" color="inherit">
                          There is no data available for the selected metric.
                        </Box>
                      </Box>
                    }
                    noMatch={
                      <Box textAlign="center" color="inherit">
                        <b>No matching data</b>
                      </Box>
                    }
                  />
                </Container>
              </SpaceBetween>
            ),
          },
          {
            id: 'all-metrics',
            label: 'All metrics',
            content: (
              <Container
                header={<Header variant="h2">Browse all metrics</Header>}
              >
                <ColumnLayout columns={3}>
                  {namespaceOptions.map((ns) => (
                    <Box key={ns.value} padding="m">
                      <SpaceBetween size="xs">
                        <Box fontWeight="bold">{ns.label}</Box>
                        <Box variant="small" color="text-body-secondary">
                          {(metricOptions[ns.value] || []).length} metrics
                        </Box>
                        <Button
                          variant="link"
                          onClick={() => {
                            setNamespace(ns);
                            const metrics = metricOptions[ns.value] || [];
                            if (metrics.length > 0) {
                              setMetric(metrics[0]);
                            }
                          }}
                        >
                          View metrics
                        </Button>
                      </SpaceBetween>
                    </Box>
                  ))}
                </ColumnLayout>
              </Container>
            ),
          },
        ]}
      />
    </SpaceBetween>
  );
}
