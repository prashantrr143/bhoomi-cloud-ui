import StatusIndicator from '@cloudscape-design/components/status-indicator';

export type ServiceHealthStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

export interface ServiceHealthIndicatorProps {
  status: ServiceHealthStatus;
}

const statusConfig: Record<ServiceHealthStatus, { type: 'success' | 'warning' | 'error' | 'info'; label: string }> = {
  operational: { type: 'success', label: 'Operational' },
  degraded: { type: 'warning', label: 'Degraded' },
  outage: { type: 'error', label: 'Outage' },
  maintenance: { type: 'info', label: 'Maintenance' },
};

export function ServiceHealthIndicator({ status }: ServiceHealthIndicatorProps) {
  const config = statusConfig[status];
  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}
