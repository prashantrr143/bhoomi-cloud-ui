/**
 * Generic resource status indicator component
 */

import React from 'react';
import StatusIndicator, {
  StatusIndicatorProps,
} from '@cloudscape-design/components/status-indicator';

export type ResourceStatus =
  | 'running'
  | 'stopped'
  | 'pending'
  | 'terminated'
  | 'available'
  | 'in-use'
  | 'creating'
  | 'deleting'
  | 'updating'
  | 'failed'
  | 'active'
  | 'inactive';

const statusConfig: Record<
  ResourceStatus,
  { type: StatusIndicatorProps['type']; label: string }
> = {
  running: { type: 'success', label: 'Running' },
  stopped: { type: 'stopped', label: 'Stopped' },
  pending: { type: 'pending', label: 'Pending' },
  terminated: { type: 'error', label: 'Terminated' },
  available: { type: 'success', label: 'Available' },
  'in-use': { type: 'info', label: 'In Use' },
  creating: { type: 'in-progress', label: 'Creating' },
  deleting: { type: 'in-progress', label: 'Deleting' },
  updating: { type: 'in-progress', label: 'Updating' },
  failed: { type: 'error', label: 'Failed' },
  active: { type: 'success', label: 'Active' },
  inactive: { type: 'stopped', label: 'Inactive' },
};

export interface ResourceStatusIndicatorProps {
  status: ResourceStatus;
  customLabel?: string;
}

export function ResourceStatusIndicator({
  status,
  customLabel,
}: ResourceStatusIndicatorProps) {
  const config = statusConfig[status] || { type: 'info', label: status };

  return (
    <StatusIndicator type={config.type}>
      {customLabel || config.label}
    </StatusIndicator>
  );
}

export default ResourceStatusIndicator;
