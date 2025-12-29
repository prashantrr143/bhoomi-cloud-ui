import StatusIndicator from '@cloudscape-design/components/status-indicator';
import type { CanaryState, CanaryRunState } from '@/types';

export interface CanaryStateIndicatorProps {
  state: CanaryState;
}

export interface CanaryRunStateIndicatorProps {
  state: CanaryRunState;
}

const stateConfig: Record<CanaryState, { type: 'success' | 'warning' | 'error' | 'info' | 'stopped' | 'pending' | 'loading'; label: string }> = {
  CREATING: { type: 'pending', label: 'Creating' },
  READY: { type: 'info', label: 'Ready' },
  STARTING: { type: 'loading', label: 'Starting' },
  RUNNING: { type: 'success', label: 'Running' },
  STOPPING: { type: 'loading', label: 'Stopping' },
  STOPPED: { type: 'stopped', label: 'Stopped' },
  ERROR: { type: 'error', label: 'Error' },
  DELETING: { type: 'warning', label: 'Deleting' },
};

const runStateConfig: Record<CanaryRunState, { type: 'success' | 'error' | 'loading'; label: string }> = {
  RUNNING: { type: 'loading', label: 'Running' },
  PASSED: { type: 'success', label: 'Passed' },
  FAILED: { type: 'error', label: 'Failed' },
};

export function CanaryStateIndicator({ state }: CanaryStateIndicatorProps) {
  const config = stateConfig[state];
  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}

export function CanaryRunStateIndicator({ state }: CanaryRunStateIndicatorProps) {
  const config = runStateConfig[state];
  return <StatusIndicator type={config.type}>{config.label}</StatusIndicator>;
}
