/**
 * Invoice status indicator component
 */

import React from 'react';
import StatusIndicator, {
  StatusIndicatorProps,
} from '@cloudscape-design/components/status-indicator';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';

const statusConfig: Record<
  InvoiceStatus,
  { type: StatusIndicatorProps['type']; label: string }
> = {
  paid: { type: 'success', label: 'Paid' },
  pending: { type: 'pending', label: 'Pending' },
  overdue: { type: 'error', label: 'Overdue' },
  draft: { type: 'info', label: 'Draft' },
};

export interface InvoiceStatusIndicatorProps {
  status: InvoiceStatus;
}

export function InvoiceStatusIndicator({ status }: InvoiceStatusIndicatorProps) {
  const config = statusConfig[status] || { type: 'info', label: status };

  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export default InvoiceStatusIndicator;
