import { useMemo, useCallback } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { resourceService, type ResourceFilters } from '@/services/resourceService';

/**
 * Hook that returns tenant-filtered resources based on TenantContext.
 * - If user is org admin → can optionally get resources from all available accounts
 * - Otherwise → returns current account's resources only
 *
 * Resources are now lazily computed using getters to avoid computing all resources
 * when only a few are needed.
 */
export function useAccountResources() {
  const { currentAccount, availableAccounts, canManageOrganization } = useTenant();

  // Memoize org admin check to avoid function calls on each access
  const isOrgAdmin = useMemo(() => canManageOrganization(), [canManageOrganization]);

  // Get the filter to use for resource queries
  const currentFilters = useMemo((): ResourceFilters => {
    if (!currentAccount) return {};
    return { accountId: currentAccount.id };
  }, [currentAccount]);

  // Get filters for all available accounts (for org admins)
  const allAccountsFilters = useMemo((): ResourceFilters => {
    if (!isOrgAdmin) return currentFilters;
    return { accountIds: availableAccounts.map((a) => a.id) };
  }, [isOrgAdmin, availableAccounts, currentFilters]);

  // Create memoized resource getters - these only compute when accessed
  // EC2
  const instances = useMemo(
    () => resourceService.getInstances(currentFilters),
    [currentFilters]
  );

  const allInstances = useMemo(
    () => resourceService.getInstances(allAccountsFilters),
    [allAccountsFilters]
  );

  // Networking
  const vpcs = useMemo(
    () => resourceService.getVPCs(currentFilters),
    [currentFilters]
  );

  const allVPCs = useMemo(
    () => resourceService.getVPCs(allAccountsFilters),
    [allAccountsFilters]
  );

  const subnets = useMemo(
    () => resourceService.getSubnets(currentFilters),
    [currentFilters]
  );

  const allSubnets = useMemo(
    () => resourceService.getSubnets(allAccountsFilters),
    [allAccountsFilters]
  );

  const securityGroups = useMemo(
    () => resourceService.getSecurityGroups(currentFilters),
    [currentFilters]
  );

  const allSecurityGroups = useMemo(
    () => resourceService.getSecurityGroups(allAccountsFilters),
    [allAccountsFilters]
  );

  const routeTables = useMemo(
    () => resourceService.getRouteTables(currentFilters),
    [currentFilters]
  );

  const internetGateways = useMemo(
    () => resourceService.getInternetGateways(currentFilters),
    [currentFilters]
  );

  const natGateways = useMemo(
    () => resourceService.getNATGateways(currentFilters),
    [currentFilters]
  );

  const elasticIPs = useMemo(
    () => resourceService.getElasticIPs(currentFilters),
    [currentFilters]
  );

  const networkACLs = useMemo(
    () => resourceService.getNetworkACLs(currentFilters),
    [currentFilters]
  );

  // Storage
  const s3Buckets = useMemo(
    () => resourceService.getS3Buckets(currentFilters),
    [currentFilters]
  );

  const allS3Buckets = useMemo(
    () => resourceService.getS3Buckets(allAccountsFilters),
    [allAccountsFilters]
  );

  const ebsVolumes = useMemo(
    () => resourceService.getEBSVolumes(currentFilters),
    [currentFilters]
  );

  const allEBSVolumes = useMemo(
    () => resourceService.getEBSVolumes(allAccountsFilters),
    [allAccountsFilters]
  );

  // Serverless
  const lambdaFunctions = useMemo(
    () => resourceService.getLambdaFunctions(currentFilters),
    [currentFilters]
  );

  const allLambdaFunctions = useMemo(
    () => resourceService.getLambdaFunctions(allAccountsFilters),
    [allAccountsFilters]
  );

  // Containers
  const ecsClusters = useMemo(
    () => resourceService.getECSClusters(currentFilters),
    [currentFilters]
  );

  const ecsServices = useMemo(
    () => resourceService.getECSServices(currentFilters),
    [currentFilters]
  );

  const ecsTasks = useMemo(
    () => resourceService.getECSTasks(currentFilters),
    [currentFilters]
  );

  const eksClusters = useMemo(
    () => resourceService.getEKSClusters(currentFilters),
    [currentFilters]
  );

  const eksNodeGroups = useMemo(
    () => resourceService.getEKSNodeGroups(currentFilters),
    [currentFilters]
  );

  // Compute
  const autoScalingGroups = useMemo(
    () => resourceService.getAutoScalingGroups(currentFilters),
    [currentFilters]
  );

  const scalingPolicies = useMemo(
    () => resourceService.getScalingPolicies(currentFilters),
    [currentFilters]
  );

  const loadBalancers = useMemo(
    () => resourceService.getLoadBalancers(currentFilters),
    [currentFilters]
  );

  const targetGroups = useMemo(
    () => resourceService.getTargetGroups(currentFilters),
    [currentFilters]
  );

  const keyPairs = useMemo(
    () => resourceService.getKeyPairs(currentFilters),
    [currentFilters]
  );

  const launchTemplates = useMemo(
    () => resourceService.getLaunchTemplates(currentFilters),
    [currentFilters]
  );

  // Billing
  const invoices = useMemo(
    () => resourceService.getInvoices(currentFilters),
    [currentFilters]
  );

  const budgets = useMemo(
    () => resourceService.getBudgets(currentFilters),
    [currentFilters]
  );

  // Monitoring
  const cloudWatchAlarms = useMemo(
    () => resourceService.getCloudWatchAlarms(currentFilters),
    [currentFilters]
  );

  const cloudWatchDashboards = useMemo(
    () => resourceService.getCloudWatchDashboards(currentFilters),
    [currentFilters]
  );

  const logGroups = useMemo(
    () => resourceService.getLogGroups(currentFilters),
    [currentFilters]
  );

  // IAM
  const iamUsers = useMemo(
    () => resourceService.getIAMUsers(currentFilters),
    [currentFilters]
  );

  const iamGroups = useMemo(
    () => resourceService.getIAMGroups(currentFilters),
    [currentFilters]
  );

  const iamRoles = useMemo(
    () => resourceService.getIAMRoles(currentFilters),
    [currentFilters]
  );

  const iamPolicies = useMemo(
    () => resourceService.getIAMPolicies(currentFilters),
    [currentFilters]
  );

  // Counts
  const resourceCounts = useMemo(
    () => resourceService.getResourceCounts(currentFilters),
    [currentFilters]
  );

  const allResourceCounts = useMemo(
    () => resourceService.getResourceCounts(allAccountsFilters),
    [allAccountsFilters]
  );

  return {
    // EC2
    instances,
    allInstances,
    // Networking
    vpcs,
    allVPCs,
    subnets,
    allSubnets,
    securityGroups,
    allSecurityGroups,
    routeTables,
    internetGateways,
    natGateways,
    elasticIPs,
    networkACLs,
    // Storage
    s3Buckets,
    allS3Buckets,
    ebsVolumes,
    allEBSVolumes,
    // Serverless
    lambdaFunctions,
    allLambdaFunctions,
    // Containers
    ecsClusters,
    ecsServices,
    ecsTasks,
    eksClusters,
    eksNodeGroups,
    // Compute
    autoScalingGroups,
    scalingPolicies,
    loadBalancers,
    targetGroups,
    keyPairs,
    launchTemplates,
    // Billing
    invoices,
    budgets,
    // Monitoring
    cloudWatchAlarms,
    cloudWatchDashboards,
    logGroups,
    // IAM
    iamUsers,
    iamGroups,
    iamRoles,
    iamPolicies,
    // Counts
    resourceCounts,
    allResourceCounts,
    // Filters and metadata
    currentFilters,
    allAccountsFilters,
    currentAccountId: currentAccount?.id,
    isOrgAdmin,
  };
}

/**
 * Hook for getting a single resource by ID with tenant filtering
 */
export function useAccountResource<T>(
  getter: (id: string, filters: ResourceFilters) => T | undefined,
  id: string
): T | undefined {
  const { currentAccount } = useTenant();

  return useMemo(() => {
    if (!currentAccount) return undefined;
    return getter(id, { accountId: currentAccount.id });
  }, [getter, id, currentAccount]);
}
