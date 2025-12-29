import StatusIndicator from '@cloudscape-design/components/status-indicator';
import type { AlarmState } from '@/types';

export interface AlarmStateIndicatorProps {
  state: AlarmState;
}

const stateConfig: Record<AlarmState, { type: 'success' | 'error' | 'warning'; label: string }> = {
  OK: { type: 'success', label: 'OK' },
  ALARM: { type: 'error', label: 'In alarm' },
  INSUFFICIENT_DATA: { type: 'warning', label: 'Insufficient data' },
};

export function AlarmStateIndicator({ state }: AlarmStateIndicatorProps) {
  const config = stateConfig[state];
  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}
