/**
 * Load balancer state indicator component
 */

import React from 'react';
import StatusIndicator, {
  StatusIndicatorProps,
} from '@cloudscape-design/components/status-indicator';

export type LoadBalancerState =
  | 'active'
  | 'provisioning'
  | 'active_impaired'
  | 'failed';

const statusConfig: Record<
  LoadBalancerState,
  { type: StatusIndicatorProps['type']; label: string }
> = {
  active: { type: 'success', label: 'Active' },
  provisioning: { type: 'in-progress', label: 'Provisioning' },
  active_impaired: { type: 'warning', label: 'Active (Impaired)' },
  failed: { type: 'error', label: 'Failed' },
};

export interface LoadBalancerStateIndicatorProps {
  state: LoadBalancerState;
}

export function LoadBalancerStateIndicator({
  state,
}: LoadBalancerStateIndicatorProps) {
  const config = statusConfig[state] || { type: 'info', label: state };

  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export default LoadBalancerStateIndicator;
