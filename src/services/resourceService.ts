import type {
  Instance,
  VPC,
  Subnet,
  SecurityGroup,
  S3Bucket,
  EBSVolume,
  LambdaFunction,
  ECSCluster,
  ECSService,
  ECSTask,
  EKSCluster,
  EKSNodeGroup,
  AutoScalingGroup,
  ScalingPolicy,
  LoadBalancer,
  TargetGroup,
  RouteTable,
  InternetGateway,
  NATGateway,
  ElasticIP,
  NetworkACL,
  KeyPair,
  LaunchTemplate,
  Invoice,
  Budget,
  CloudWatchAlarm,
  CloudWatchDashboard,
  LogGroup,
  IAMUser,
  IAMGroup,
  IAMRole,
  IAMPolicy,
} from '@/types';

import {
  instances,
  vpcs,
  subnets,
  securityGroups,
  s3Buckets,
  ebsVolumes,
  lambdaFunctions,
  ecsClusters,
  ecsServices,
  ecsTasks,
  eksClusters,
  eksNodeGroups,
  autoScalingGroups,
  scalingPolicies,
  loadBalancers,
  targetGroups,
  routeTables,
  internetGateways,
  natGateways,
  elasticIPs,
  networkACLs,
  keyPairs,
  launchTemplates,
  invoices,
  budgets,
  cloudWatchAlarms,
  cloudWatchDashboards,
  logGroups,
  iamUsers,
  iamGroups,
  iamRoles,
  iamPolicies,
} from '@/data/mockData';

export interface ResourceFilters {
  accountId?: string;
  accountIds?: string[];
  region?: string;
  status?: string;
}

type ResourceWithAccountId = { accountId?: string };

function filterByAccount<T extends ResourceWithAccountId>(
  resources: T[],
  filters: ResourceFilters
): T[] {
  let filtered = [...resources];

  if (filters.accountId) {
    filtered = filtered.filter((r) => r.accountId === filters.accountId);
  } else if (filters.accountIds && filters.accountIds.length > 0) {
    filtered = filtered.filter((r) => r.accountId && filters.accountIds!.includes(r.accountId));
  }

  return filtered;
}

function filterByStatus<T extends { status?: string }>(resources: T[], status?: string): T[] {
  if (!status) return resources;
  return resources.filter((r) => r.status === status);
}

export const resourceService = {
  // EC2 Instances
  getInstances(filters: ResourceFilters = {}): Instance[] {
    let result = filterByAccount(instances, filters);
    result = filterByStatus(result, filters.status);
    return result;
  },

  getInstance(id: string, filters: ResourceFilters = {}): Instance | undefined {
    const filtered = this.getInstances(filters);
    return filtered.find((i) => i.id === id);
  },

  // VPCs
  getVPCs(filters: ResourceFilters = {}): VPC[] {
    return filterByAccount(vpcs, filters);
  },

  getVPC(id: string, filters: ResourceFilters = {}): VPC | undefined {
    const filtered = this.getVPCs(filters);
    return filtered.find((v) => v.id === id);
  },

  // Subnets
  getSubnets(filters: ResourceFilters = {}): Subnet[] {
    return filterByAccount(subnets, filters);
  },

  getSubnet(id: string, filters: ResourceFilters = {}): Subnet | undefined {
    const filtered = this.getSubnets(filters);
    return filtered.find((s) => s.id === id);
  },

  // Security Groups
  getSecurityGroups(filters: ResourceFilters = {}): SecurityGroup[] {
    return filterByAccount(securityGroups, filters);
  },

  getSecurityGroup(id: string, filters: ResourceFilters = {}): SecurityGroup | undefined {
    const filtered = this.getSecurityGroups(filters);
    return filtered.find((sg) => sg.id === id);
  },

  // S3 Buckets
  getS3Buckets(filters: ResourceFilters = {}): S3Bucket[] {
    return filterByAccount(s3Buckets, filters);
  },

  getS3Bucket(name: string, filters: ResourceFilters = {}): S3Bucket | undefined {
    const filtered = this.getS3Buckets(filters);
    return filtered.find((b) => b.name === name);
  },

  // EBS Volumes
  getEBSVolumes(filters: ResourceFilters = {}): EBSVolume[] {
    let result = filterByAccount(ebsVolumes, filters);
    result = filterByStatus(result, filters.status);
    return result;
  },

  getEBSVolume(id: string, filters: ResourceFilters = {}): EBSVolume | undefined {
    const filtered = this.getEBSVolumes(filters);
    return filtered.find((v) => v.id === id);
  },

  // Lambda Functions
  getLambdaFunctions(filters: ResourceFilters = {}): LambdaFunction[] {
    return filterByAccount(lambdaFunctions, filters);
  },

  getLambdaFunction(name: string, filters: ResourceFilters = {}): LambdaFunction | undefined {
    const filtered = this.getLambdaFunctions(filters);
    return filtered.find((f) => f.functionName === name);
  },

  // ECS Clusters
  getECSClusters(filters: ResourceFilters = {}): ECSCluster[] {
    let result = filterByAccount(ecsClusters, filters);
    result = filterByStatus(result, filters.status);
    return result;
  },

  getECSCluster(name: string, filters: ResourceFilters = {}): ECSCluster | undefined {
    const filtered = this.getECSClusters(filters);
    return filtered.find((c) => c.clusterName === name);
  },

  // ECS Services
  getECSServices(filters: ResourceFilters = {}): ECSService[] {
    let result = filterByAccount(ecsServices, filters);
    result = filterByStatus(result, filters.status);
    return result;
  },

  getECSService(name: string, filters: ResourceFilters = {}): ECSService | undefined {
    const filtered = this.getECSServices(filters);
    return filtered.find((s) => s.serviceName === name);
  },

  // ECS Tasks
  getECSTasks(filters: ResourceFilters = {}): ECSTask[] {
    return filterByAccount(ecsTasks, filters);
  },

  // EKS Clusters
  getEKSClusters(filters: ResourceFilters = {}): EKSCluster[] {
    let result = filterByAccount(eksClusters, filters);
    result = filterByStatus(result, filters.status);
    return result;
  },

  getEKSCluster(name: string, filters: ResourceFilters = {}): EKSCluster | undefined {
    const filtered = this.getEKSClusters(filters);
    return filtered.find((c) => c.name === name);
  },

  // EKS Node Groups
  getEKSNodeGroups(filters: ResourceFilters = {}): EKSNodeGroup[] {
    let result = filterByAccount(eksNodeGroups, filters);
    result = filterByStatus(result, filters.status);
    return result;
  },

  // Auto Scaling Groups
  getAutoScalingGroups(filters: ResourceFilters = {}): AutoScalingGroup[] {
    return filterByAccount(autoScalingGroups, filters);
  },

  getAutoScalingGroup(name: string, filters: ResourceFilters = {}): AutoScalingGroup | undefined {
    const filtered = this.getAutoScalingGroups(filters);
    return filtered.find((asg) => asg.autoScalingGroupName === name);
  },

  // Scaling Policies
  getScalingPolicies(filters: ResourceFilters = {}): ScalingPolicy[] {
    return filterByAccount(scalingPolicies, filters);
  },

  // Load Balancers
  getLoadBalancers(filters: ResourceFilters = {}): LoadBalancer[] {
    return filterByAccount(loadBalancers, filters);
  },

  getLoadBalancer(arn: string, filters: ResourceFilters = {}): LoadBalancer | undefined {
    const filtered = this.getLoadBalancers(filters);
    return filtered.find((lb) => lb.loadBalancerArn === arn);
  },

  // Target Groups
  getTargetGroups(filters: ResourceFilters = {}): TargetGroup[] {
    return filterByAccount(targetGroups, filters);
  },

  getTargetGroup(arn: string, filters: ResourceFilters = {}): TargetGroup | undefined {
    const filtered = this.getTargetGroups(filters);
    return filtered.find((tg) => tg.targetGroupArn === arn);
  },

  // Route Tables
  getRouteTables(filters: ResourceFilters = {}): RouteTable[] {
    return filterByAccount(routeTables, filters);
  },

  getRouteTable(id: string, filters: ResourceFilters = {}): RouteTable | undefined {
    const filtered = this.getRouteTables(filters);
    return filtered.find((rt) => rt.routeTableId === id);
  },

  // Internet Gateways
  getInternetGateways(filters: ResourceFilters = {}): InternetGateway[] {
    return filterByAccount(internetGateways, filters);
  },

  getInternetGateway(id: string, filters: ResourceFilters = {}): InternetGateway | undefined {
    const filtered = this.getInternetGateways(filters);
    return filtered.find((igw) => igw.internetGatewayId === id);
  },

  // NAT Gateways
  getNATGateways(filters: ResourceFilters = {}): NATGateway[] {
    let result = filterByAccount(natGateways, filters);
    result = filterByStatus(result, filters.status);
    return result;
  },

  getNATGateway(id: string, filters: ResourceFilters = {}): NATGateway | undefined {
    const filtered = this.getNATGateways(filters);
    return filtered.find((nat) => nat.natGatewayId === id);
  },

  // Elastic IPs
  getElasticIPs(filters: ResourceFilters = {}): ElasticIP[] {
    return filterByAccount(elasticIPs, filters);
  },

  getElasticIP(allocationId: string, filters: ResourceFilters = {}): ElasticIP | undefined {
    const filtered = this.getElasticIPs(filters);
    return filtered.find((eip) => eip.allocationId === allocationId);
  },

  // Network ACLs
  getNetworkACLs(filters: ResourceFilters = {}): NetworkACL[] {
    return filterByAccount(networkACLs, filters);
  },

  getNetworkACL(id: string, filters: ResourceFilters = {}): NetworkACL | undefined {
    const filtered = this.getNetworkACLs(filters);
    return filtered.find((nacl) => nacl.networkAclId === id);
  },

  // Key Pairs
  getKeyPairs(filters: ResourceFilters = {}): KeyPair[] {
    return filterByAccount(keyPairs, filters);
  },

  getKeyPair(name: string, filters: ResourceFilters = {}): KeyPair | undefined {
    const filtered = this.getKeyPairs(filters);
    return filtered.find((kp) => kp.keyName === name);
  },

  // Launch Templates
  getLaunchTemplates(filters: ResourceFilters = {}): LaunchTemplate[] {
    return filterByAccount(launchTemplates, filters);
  },

  getLaunchTemplate(id: string, filters: ResourceFilters = {}): LaunchTemplate | undefined {
    const filtered = this.getLaunchTemplates(filters);
    return filtered.find((lt) => lt.launchTemplateId === id);
  },

  // Invoices (Billing)
  getInvoices(filters: ResourceFilters = {}): Invoice[] {
    return filterByAccount(invoices, filters);
  },

  getInvoice(id: string, filters: ResourceFilters = {}): Invoice | undefined {
    const filtered = this.getInvoices(filters);
    return filtered.find((inv) => inv.invoiceId === id);
  },

  // Budgets
  getBudgets(filters: ResourceFilters = {}): Budget[] {
    return filterByAccount(budgets, filters);
  },

  getBudget(name: string, filters: ResourceFilters = {}): Budget | undefined {
    const filtered = this.getBudgets(filters);
    return filtered.find((b) => b.budgetName === name);
  },

  // CloudWatch Alarms
  getCloudWatchAlarms(filters: ResourceFilters = {}): CloudWatchAlarm[] {
    return filterByAccount(cloudWatchAlarms, filters);
  },

  getCloudWatchAlarm(name: string, filters: ResourceFilters = {}): CloudWatchAlarm | undefined {
    const filtered = this.getCloudWatchAlarms(filters);
    return filtered.find((a) => a.alarmName === name);
  },

  // CloudWatch Dashboards
  getCloudWatchDashboards(filters: ResourceFilters = {}): CloudWatchDashboard[] {
    return filterByAccount(cloudWatchDashboards, filters);
  },

  getCloudWatchDashboard(
    name: string,
    filters: ResourceFilters = {}
  ): CloudWatchDashboard | undefined {
    const filtered = this.getCloudWatchDashboards(filters);
    return filtered.find((d) => d.dashboardName === name);
  },

  // Log Groups
  getLogGroups(filters: ResourceFilters = {}): LogGroup[] {
    return filterByAccount(logGroups, filters);
  },

  getLogGroup(name: string, filters: ResourceFilters = {}): LogGroup | undefined {
    const filtered = this.getLogGroups(filters);
    return filtered.find((lg) => lg.logGroupName === name);
  },

  // IAM Users
  getIAMUsers(filters: ResourceFilters = {}): IAMUser[] {
    return filterByAccount(iamUsers, filters);
  },

  getIAMUser(name: string, filters: ResourceFilters = {}): IAMUser | undefined {
    const filtered = this.getIAMUsers(filters);
    return filtered.find((u) => u.userName === name);
  },

  // IAM Groups
  getIAMGroups(filters: ResourceFilters = {}): IAMGroup[] {
    return filterByAccount(iamGroups, filters);
  },

  getIAMGroup(name: string, filters: ResourceFilters = {}): IAMGroup | undefined {
    const filtered = this.getIAMGroups(filters);
    return filtered.find((g) => g.groupName === name);
  },

  // IAM Roles
  getIAMRoles(filters: ResourceFilters = {}): IAMRole[] {
    return filterByAccount(iamRoles, filters);
  },

  getIAMRole(name: string, filters: ResourceFilters = {}): IAMRole | undefined {
    const filtered = this.getIAMRoles(filters);
    return filtered.find((r) => r.roleName === name);
  },

  // IAM Policies
  getIAMPolicies(filters: ResourceFilters = {}): IAMPolicy[] {
    return filterByAccount(iamPolicies, filters);
  },

  getIAMPolicy(arn: string, filters: ResourceFilters = {}): IAMPolicy | undefined {
    const filtered = this.getIAMPolicies(filters);
    return filtered.find((p) => p.arn === arn);
  },

  // Aggregate counts for dashboard
  getResourceCounts(filters: ResourceFilters = {}): Record<string, number> {
    return {
      instances: this.getInstances(filters).length,
      vpcs: this.getVPCs(filters).length,
      subnets: this.getSubnets(filters).length,
      securityGroups: this.getSecurityGroups(filters).length,
      s3Buckets: this.getS3Buckets(filters).length,
      ebsVolumes: this.getEBSVolumes(filters).length,
      lambdaFunctions: this.getLambdaFunctions(filters).length,
      ecsClusters: this.getECSClusters(filters).length,
      ecsServices: this.getECSServices(filters).length,
      eksClusters: this.getEKSClusters(filters).length,
      autoScalingGroups: this.getAutoScalingGroups(filters).length,
      loadBalancers: this.getLoadBalancers(filters).length,
      iamUsers: this.getIAMUsers(filters).length,
      iamRoles: this.getIAMRoles(filters).length,
    };
  },
};
