import type { ReactNode } from 'react';
import { useTenant } from '@/contexts/TenantContext';

interface PermissionGateProps {
  /** The action to check permission for (e.g., 'ec2:RunInstances', 's3:DeleteBucket') */
  action: string;
  /** Optional resource ARN to check against */
  resource?: string;
  /** Content to render if permission is granted */
  children: ReactNode;
  /** Optional fallback content to render if permission is denied */
  fallback?: ReactNode;
  /** If true, renders null instead of fallback when permission denied */
  hideOnDeny?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions.
 *
 * @example
 * // Hide button if no permission
 * <PermissionGate action="ec2:RunInstances" hideOnDeny>
 *   <Button variant="primary">Launch Instance</Button>
 * </PermissionGate>
 *
 * @example
 * // Show disabled button as fallback
 * <PermissionGate
 *   action="s3:DeleteBucket"
 *   fallback={<Button disabled>Delete Bucket</Button>}
 * >
 *   <Button variant="primary">Delete Bucket</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  action,
  resource,
  children,
  fallback = null,
  hideOnDeny = false,
}: PermissionGateProps) {
  const { hasPermission } = useTenant();

  const isAllowed = hasPermission(action, resource);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (hideOnDeny) {
    return null;
  }

  return <>{fallback}</>;
}

interface RoleGateProps {
  /** Required role(s) to access the content */
  roles: string | string[];
  /** Content to render if user has the required role */
  children: ReactNode;
  /** Optional fallback content */
  fallback?: ReactNode;
  /** If true, renders null instead of fallback */
  hideOnDeny?: boolean;
}

/**
 * Component that conditionally renders children based on user role.
 *
 * @example
 * <RoleGate roles="ORGANIZATION_ADMIN">
 *   <Button>Manage Organization</Button>
 * </RoleGate>
 *
 * @example
 * <RoleGate roles={['ORGANIZATION_ADMIN', 'ACCOUNT_ADMIN']}>
 *   <AdminPanel />
 * </RoleGate>
 */
export function RoleGate({
  roles,
  children,
  fallback = null,
  hideOnDeny = false,
}: RoleGateProps) {
  const { currentRole } = useTenant();

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const hasRole = currentRole && allowedRoles.includes(currentRole);

  if (hasRole) {
    return <>{children}</>;
  }

  if (hideOnDeny) {
    return null;
  }

  return <>{fallback}</>;
}

interface OrgAdminGateProps {
  /** Content to render if user is org admin */
  children: ReactNode;
  /** Optional fallback content */
  fallback?: ReactNode;
  /** If true, renders null instead of fallback */
  hideOnDeny?: boolean;
}

/**
 * Convenience component for org admin only content.
 */
export function OrgAdminGate({
  children,
  fallback = null,
  hideOnDeny = false,
}: OrgAdminGateProps) {
  const { canManageOrganization } = useTenant();

  if (canManageOrganization()) {
    return <>{children}</>;
  }

  if (hideOnDeny) {
    return null;
  }

  return <>{fallback}</>;
}
