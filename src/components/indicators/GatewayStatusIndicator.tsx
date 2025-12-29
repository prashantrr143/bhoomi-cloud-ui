/**
 * Gateway status indicator component (IGW/NAT)
 */

import React from 'react';
import StatusIndicator, {
  StatusIndicatorProps,
} from '@cloudscape-design/components/status-indicator';

export type GatewayStatus =
  | 'available'
  | 'pending'
  | 'deleting'
  | 'deleted'
  | 'failed'
  | 'attached'
  | 'detached';

const statusConfig: Record<
  GatewayStatus,
  { type: StatusIndicatorProps['type']; label: string }
> = {
  available: { type: 'success', label: 'Available' },
  pending: { type: 'pending', label: 'Pending' },
  deleting: { type: 'in-progress', label: 'Deleting' },
  deleted: { type: 'stopped', label: 'Deleted' },
  failed: { type: 'error', label: 'Failed' },
  attached: { type: 'success', label: 'Attached' },
  detached: { type: 'stopped', label: 'Detached' },
};

export interface GatewayStatusIndicatorProps {
  status: GatewayStatus;
}

export function GatewayStatusIndicator({ status }: GatewayStatusIndicatorProps) {
  const config = statusConfig[status] || { type: 'info', label: status };

  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export default GatewayStatusIndicator;
