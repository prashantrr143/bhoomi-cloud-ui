/**
 * Lambda function state indicator component
 */

import React from 'react';
import StatusIndicator, {
  StatusIndicatorProps,
} from '@cloudscape-design/components/status-indicator';

export type LambdaState =
  | 'Pending'
  | 'Active'
  | 'Inactive'
  | 'Failed';

const statusConfig: Record<
  LambdaState,
  { type: StatusIndicatorProps['type']; label: string }
> = {
  Active: { type: 'success', label: 'Active' },
  Pending: { type: 'pending', label: 'Pending' },
  Inactive: { type: 'stopped', label: 'Inactive' },
  Failed: { type: 'error', label: 'Failed' },
};

export interface LambdaStateIndicatorProps {
  state: LambdaState;
}

export function LambdaStateIndicator({ state }: LambdaStateIndicatorProps) {
  const config = statusConfig[state] || { type: 'info', label: state };

  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export default LambdaStateIndicator;
