/**
 * Cluster status indicator component (ECS/EKS)
 */

import React from 'react';
import StatusIndicator, {
  StatusIndicatorProps,
} from '@cloudscape-design/components/status-indicator';

export type ClusterStatus =
  | 'ACTIVE'
  | 'PROVISIONING'
  | 'DEPROVISIONING'
  | 'FAILED'
  | 'INACTIVE'
  | 'CREATING'
  | 'DELETING'
  | 'UPDATING';

const statusConfig: Record<
  ClusterStatus,
  { type: StatusIndicatorProps['type']; label: string }
> = {
  ACTIVE: { type: 'success', label: 'Active' },
  PROVISIONING: { type: 'in-progress', label: 'Provisioning' },
  DEPROVISIONING: { type: 'in-progress', label: 'Deprovisioning' },
  FAILED: { type: 'error', label: 'Failed' },
  INACTIVE: { type: 'stopped', label: 'Inactive' },
  CREATING: { type: 'in-progress', label: 'Creating' },
  DELETING: { type: 'in-progress', label: 'Deleting' },
  UPDATING: { type: 'in-progress', label: 'Updating' },
};

export interface ClusterStatusIndicatorProps {
  status: ClusterStatus;
}

export function ClusterStatusIndicator({ status }: ClusterStatusIndicatorProps) {
  const config = statusConfig[status] || { type: 'info', label: status };

  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export default ClusterStatusIndicator;
