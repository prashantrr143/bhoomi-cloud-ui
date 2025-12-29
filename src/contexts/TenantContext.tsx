import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type {
  Organization,
  OrganizationalUnit,
  Account,
  AccountMember,
  AccountRole,
  Permission,
} from '@/types/organization';
import {
  organizations,
  organizationalUnits,
  accounts,
  accountMembers,
  getOrganizationById,
  getAccountById,
  getUserAccounts,
  getUserMembership,
  getDefaultAccount,
  getChildOUs as getChildOUsHelper,
  getAccountsByOU as getAccountsByOUHelper,
} from '@/data/organizationMockData';

interface TenantContextType {
  // Current state
  currentOrganization: Organization | null;
  currentAccount: Account | null;
  currentMembership: AccountMember | null;
  currentRole: AccountRole | null;
  permissions: Permission[];

  // Available options
  availableOrganizations: Organization[];
  availableAccounts: Account[];

  // Loading state
  isLoading: boolean;

  // Actions
  setCurrentAccount: (accountId: string) => void;
  setCurrentOrganization: (orgId: string) => void;

  // Permission helpers
  hasPermission: (action: string, resource?: string) => boolean;
  canManageOrganization: () => boolean;
  canSwitchAccounts: () => boolean;

  // Organization helpers
  getAccountsByOU: (ouId: string) => Account[];
  getChildOUs: (parentId: string) => OrganizationalUnit[];
  getAllOUs: () => OrganizationalUnit[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const STORAGE_KEY = 'bhoomi_current_account';

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [currentAccount, setCurrentAccountState] = useState<Account | null>(null);
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [currentMembership, setCurrentMembership] = useState<AccountMember | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize tenant context when user authenticates
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Reset state when user logs out
      setCurrentAccountState(null);
      setCurrentOrganizationState(null);
      setCurrentMembership(null);
      setAvailableAccounts([]);
      setAvailableOrganizations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Get accounts accessible to this user
    const userAccounts = getUserAccounts(user.id);
    setAvailableAccounts(userAccounts);

    // Get unique organizations from user's accounts
    const orgIds = [...new Set(userAccounts.map((a) => a.organizationId))];
    const userOrgs = orgIds
      .map((id) => getOrganizationById(id))
      .filter((o): o is Organization => o !== undefined);
    setAvailableOrganizations(userOrgs);

    // Restore last selected account from localStorage or use default
    const storedAccountId = localStorage.getItem(STORAGE_KEY);
    let selectedAccount: Account | undefined;

    if (storedAccountId) {
      // Verify user still has access to stored account
      selectedAccount = userAccounts.find((a) => a.id === storedAccountId);
    }

    if (!selectedAccount) {
      // Fall back to default account
      selectedAccount = getDefaultAccount(user.id);
    }

    if (selectedAccount) {
      setCurrentAccountState(selectedAccount);
      localStorage.setItem(STORAGE_KEY, selectedAccount.id);

      // Set organization based on account
      const org = getOrganizationById(selectedAccount.organizationId);
      if (org) {
        setCurrentOrganizationState(org);
      }

      // Set membership
      const membership = getUserMembership(user.id, selectedAccount.id);
      if (membership) {
        setCurrentMembership(membership);
      }
    }

    setIsLoading(false);
  }, [isAuthenticated, user]);

  // Switch to a different account
  const setCurrentAccount = useCallback(
    (accountId: string) => {
      if (!user) return;

      const account = getAccountById(accountId);
      if (!account) {
        console.error(`Account ${accountId} not found`);
        return;
      }

      // Verify user has access to this account
      const membership = getUserMembership(user.id, accountId);
      if (!membership) {
        console.error(`User ${user.id} does not have access to account ${accountId}`);
        return;
      }

      setCurrentAccountState(account);
      setCurrentMembership(membership);
      localStorage.setItem(STORAGE_KEY, accountId);

      // Update organization if it changed
      const org = getOrganizationById(account.organizationId);
      if (org && org.id !== currentOrganization?.id) {
        setCurrentOrganizationState(org);
      }
    },
    [user, currentOrganization]
  );

  // Switch to a different organization (and its master account)
  const setCurrentOrganization = useCallback(
    (orgId: string) => {
      if (!user) return;

      const org = getOrganizationById(orgId);
      if (!org) {
        console.error(`Organization ${orgId} not found`);
        return;
      }

      // Find an account in this org that the user has access to
      const orgAccounts = availableAccounts.filter((a) => a.organizationId === orgId);
      if (orgAccounts.length === 0) {
        console.error(`User does not have access to any accounts in organization ${orgId}`);
        return;
      }

      // Prefer master account if accessible, otherwise first available
      const masterAccount = orgAccounts.find((a) => a.id === org.masterAccountId);
      const targetAccount = masterAccount || orgAccounts[0];

      setCurrentOrganizationState(org);
      setCurrentAccount(targetAccount.id);
    },
    [user, availableAccounts, setCurrentAccount]
  );

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (action: string, resource?: string): boolean => {
      if (!currentMembership) return false;

      const { permissions } = currentMembership;

      for (const perm of permissions) {
        // Check if action matches
        const actionMatches = perm.actions.some((permAction) => {
          if (permAction === '*') return true;
          if (permAction === action) return true;
          // Handle wildcards like 'ec2:*' or '*:Describe*'
          const permPattern = permAction.replace(/\*/g, '.*');
          return new RegExp(`^${permPattern}$`).test(action);
        });

        if (!actionMatches) continue;

        // Check if resource matches (if specified)
        if (resource) {
          const resourceMatches = perm.resources.some((permResource) => {
            if (permResource === '*') return true;
            if (permResource === resource) return true;
            const resPattern = permResource.replace(/\*/g, '.*');
            return new RegExp(`^${resPattern}$`).test(resource);
          });

          if (!resourceMatches) continue;
        }

        // Check effect
        if (perm.effect === 'Deny') return false;
        if (perm.effect === 'Allow') return true;
      }

      return false;
    },
    [currentMembership]
  );

  // Check if user can manage the organization
  const canManageOrganization = useCallback((): boolean => {
    if (!currentMembership) return false;
    return currentMembership.role === 'ORGANIZATION_ADMIN';
  }, [currentMembership]);

  // Check if user can switch between accounts
  const canSwitchAccounts = useCallback((): boolean => {
    return availableAccounts.length > 1;
  }, [availableAccounts]);

  // Get accounts under a specific OU
  const getAccountsByOU = useCallback(
    (ouId: string): Account[] => {
      // Filter to only show accounts the user has access to
      const allOUAccounts = getAccountsByOUHelper(ouId);
      return allOUAccounts.filter((a) => availableAccounts.some((ua) => ua.id === a.id));
    },
    [availableAccounts]
  );

  // Get child OUs of a parent
  const getChildOUs = useCallback((parentId: string): OrganizationalUnit[] => {
    return getChildOUsHelper(parentId);
  }, []);

  // Get all OUs in the current organization
  const getAllOUs = useCallback((): OrganizationalUnit[] => {
    if (!currentOrganization) return [];
    // Filter OUs that belong to current organization
    // OUs are linked via parentId chain starting from organization root
    return organizationalUnits.filter((ou) => ou.arn.includes(currentOrganization.id));
  }, [currentOrganization]);

  const currentRole = currentMembership?.role || null;
  const permissions = currentMembership?.permissions || [];

  return (
    <TenantContext.Provider
      value={{
        currentOrganization,
        currentAccount,
        currentMembership,
        currentRole,
        permissions,
        availableOrganizations,
        availableAccounts,
        isLoading,
        setCurrentAccount,
        setCurrentOrganization,
        hasPermission,
        canManageOrganization,
        canSwitchAccounts,
        getAccountsByOU,
        getChildOUs,
        getAllOUs,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
