/**
 * Credit status indicator component
 */

import React from 'react';
import StatusIndicator, {
  StatusIndicatorProps,
} from '@cloudscape-design/components/status-indicator';

export type CreditStatus = 'active' | 'expired' | 'exhausted';

const statusConfig: Record<
  CreditStatus,
  { type: StatusIndicatorProps['type']; label: string }
> = {
  active: { type: 'success', label: 'Active' },
  expired: { type: 'error', label: 'Expired' },
  exhausted: { type: 'stopped', label: 'Exhausted' },
};

export interface CreditStatusIndicatorProps {
  status: CreditStatus;
}

export function CreditStatusIndicator({ status }: CreditStatusIndicatorProps) {
  const config = statusConfig[status] || { type: 'info', label: status };

  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export default CreditStatusIndicator;
