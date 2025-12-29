/**
 * Centralized constants for Bhoomi Cloud
 */

// Pagination
export const PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Locale and currency
export const DEFAULT_LOCALE = 'en-IN';
export const DEFAULT_CURRENCY = 'INR';

// Spacing (Cloudscape values)
export const SPACING = {
  xxs: 'xxs',
  xs: 'xs',
  s: 's',
  m: 'm',
  l: 'l',
  xl: 'xl',
  xxl: 'xxl',
} as const;

// Common table empty states
export const EMPTY_STATE_MESSAGES = {
  NO_RESOURCES: 'No resources found',
  NO_MATCHES: 'No matches found',
  LOADING: 'Loading...',
} as const;

// Resource status types
export const RESOURCE_STATUS = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  PENDING: 'pending',
  TERMINATED: 'terminated',
  AVAILABLE: 'available',
  IN_USE: 'in-use',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CREATING: 'creating',
  DELETING: 'deleting',
  UPDATING: 'updating',
  FAILED: 'failed',
} as const;

// Invoice/Payment status
export const INVOICE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  DRAFT: 'draft',
} as const;

export const PAYMENT_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Credit status
export const CREDIT_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  EXHAUSTED: 'exhausted',
} as const;

// Cluster status (ECS/EKS)
export const CLUSTER_STATUS = {
  ACTIVE: 'ACTIVE',
  PROVISIONING: 'PROVISIONING',
  DEPROVISIONING: 'DEPROVISIONING',
  FAILED: 'FAILED',
  INACTIVE: 'INACTIVE',
  CREATING: 'CREATING',
  DELETING: 'DELETING',
  UPDATING: 'UPDATING',
} as const;

// Load balancer states
export const LOAD_BALANCER_STATE = {
  ACTIVE: 'active',
  PROVISIONING: 'provisioning',
  ACTIVE_IMPAIRED: 'active_impaired',
  FAILED: 'failed',
} as const;
