import StatusIndicator from '@cloudscape-design/components/status-indicator';
import type { ResourceStatus } from '@/types';

interface ResourceStatusIndicatorProps {
  status: ResourceStatus;
}

const STATUS_CONFIG: Record<ResourceStatus, { type: 'success' | 'error' | 'warning' | 'info' | 'stopped' | 'pending' | 'in-progress' | 'loading'; label: string }> = {
  running: { type: 'success', label: 'Running' },
  stopped: { type: 'stopped', label: 'Stopped' },
  pending: { type: 'pending', label: 'Pending' },
  terminated: { type: 'error', label: 'Terminated' },
  available: { type: 'success', label: 'Available' },
  'in-use': { type: 'info', label: 'In use' },
  error: { type: 'error', label: 'Error' },
};

export function ResourceStatusIndicator({ status }: ResourceStatusIndicatorProps) {
  const config = STATUS_CONFIG[status] || { type: 'info', label: status };

  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}
