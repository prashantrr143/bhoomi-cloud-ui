/**
 * Payment status indicator component
 */

import React from 'react';
import StatusIndicator, {
  StatusIndicatorProps,
} from '@cloudscape-design/components/status-indicator';

export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

const statusConfig: Record<
  PaymentStatus,
  { type: StatusIndicatorProps['type']; label: string }
> = {
  completed: { type: 'success', label: 'Completed' },
  pending: { type: 'pending', label: 'Pending' },
  failed: { type: 'error', label: 'Failed' },
  refunded: { type: 'info', label: 'Refunded' },
};

export interface PaymentStatusIndicatorProps {
  status: PaymentStatus;
}

export function PaymentStatusIndicator({ status }: PaymentStatusIndicatorProps) {
  const config = statusConfig[status] || { type: 'info', label: status };

  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export default PaymentStatusIndicator;
