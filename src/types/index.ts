export type ResourceStatus =
  | 'running'
  | 'stopped'
  | 'pending'
  | 'terminated'
  | 'available'
  | 'in-use'
  | 'error';

// EC2 Instance Network Interface
export interface InstanceNetworkInterface {
  networkInterfaceId: string;
  subnetId: string;
  vpcId: string;
  privateIpAddress: string;
  publicIpAddress?: string;
  macAddress: string;
  securityGroups: { id: string; name: string }[];
  status: 'available' | 'in-use' | 'attaching' | 'detaching';
  attachmentId: string;
  deviceIndex: number;
  deleteOnTermination: boolean;
  sourceDestCheck: boolean;
}

// EC2 Instance Block Device Mapping
export interface InstanceBlockDevice {
  deviceName: string;
  volumeId: string;
  volumeType: 'gp3' | 'gp2' | 'io1' | 'io2' | 'st1' | 'sc1' | 'standard';
  volumeSize: number;
  iops?: number;
  throughput?: number;
  deleteOnTermination: boolean;
  encrypted: boolean;
  status: 'attaching' | 'attached' | 'detaching' | 'detached';
}

// EC2 Instance Monitoring State
export interface InstanceMonitoring {
  state: 'disabled' | 'disabling' | 'enabled' | 'pending';
}

// EC2 Instance Placement
export interface InstancePlacement {
  availabilityZone: string;
  tenancy: 'default' | 'dedicated' | 'host';
  groupName?: string;
  hostId?: string;
  spreadDomain?: string;
  partitionNumber?: number;
}

// EC2 Instance State
export interface InstanceState {
  code: number;
  name: 'pending' | 'running' | 'shutting-down' | 'terminated' | 'stopping' | 'stopped';
}

// EC2 Instance CPU Options
export interface InstanceCpuOptions {
  coreCount: number;
  threadsPerCore: number;
}

// EC2 Instance Capacity Reservation
export interface InstanceCapacityReservation {
  capacityReservationId?: string;
  preference: 'open' | 'none';
}

// EC2 Instance Maintenance Options
export interface InstanceMaintenanceOptions {
  autoRecovery: 'disabled' | 'default';
}

// EC2 Instance Metadata Options
export interface InstanceMetadataOptions {
  state: 'pending' | 'applied';
  httpTokens: 'optional' | 'required';
  httpPutResponseHopLimit: number;
  httpEndpoint: 'enabled' | 'disabled';
  instanceMetadataTags: 'enabled' | 'disabled';
}

// EC2 Instance State Transition
export interface InstanceStateTransition {
  timestamp: string;
  previousState: string;
  currentState: string;
}

// Full EC2 Instance Interface (AWS-like detail)
export interface Instance {
  // Basic Info
  id: string;
  name: string;
  type: string;
  status: ResourceStatus;
  launchTime: string;

  // Instance Identity
  imageId: string;
  imageName: string;
  platform: 'Linux/UNIX' | 'Windows' | 'macOS';
  platformDetails: string;
  architecture: 'x86_64' | 'arm64' | 'i386';

  // State Information
  state: InstanceState;
  stateTransitionReason?: string;
  stateReason?: { code: string; message: string };

  // Host and Placement
  placement: InstancePlacement;
  availabilityZone: string;
  hypervisor: 'ovm' | 'xen' | 'nitro';
  virtualizationType: 'hvm' | 'paravirtual';

  // Network Configuration
  vpcId: string;
  subnetId: string;
  privateIp: string;
  privateDnsName: string;
  publicIp?: string;
  publicDnsName?: string;
  elasticIpAddress?: string;
  elasticIpAllocationId?: string;
  networkInterfaces: InstanceNetworkInterface[];
  sourceDestCheck: boolean;

  // Security
  securityGroups: { id: string; name: string }[];
  keyPairName?: string;
  iamInstanceProfile?: {
    arn: string;
    id: string;
    name: string;
  };

  // Storage
  rootDeviceType: 'ebs' | 'instance-store';
  rootDeviceName: string;
  blockDeviceMappings: InstanceBlockDevice[];
  ebsOptimized: boolean;

  // Compute
  cpuOptions: InstanceCpuOptions;

  // Monitoring & Maintenance
  monitoring: InstanceMonitoring;
  maintenanceOptions: InstanceMaintenanceOptions;

  // Metadata
  metadataOptions: InstanceMetadataOptions;

  // Capacity
  capacityReservationSpecification: InstanceCapacityReservation;

  // Lifecycle
  instanceLifecycle?: 'spot' | 'scheduled';
  spotInstanceRequestId?: string;

  // Tags
  tags: Record<string, string>;

  // Owner
  ownerId: string;
  accountId: string;

  // Nitro Enclave support
  enclaveOptions: { enabled: boolean };

  // Boot mode
  bootMode?: 'legacy-bios' | 'uefi' | 'uefi-preferred';

  // Hibernation
  hibernationOptions: { configured: boolean };

  // License
  licenses?: { licenseConfigurationArn: string }[];

  // Usage operation
  usageOperation: string;
  usageOperationUpdateTime: string;
}

export interface VPC {
  id: string;
  name: string;
  cidrBlock: string;
  state: ResourceStatus;
  isDefault: boolean;
  tenancy: string;
  accountId: string;
}

export interface Subnet {
  id: string;
  name: string;
  vpcId: string;
  cidrBlock: string;
  availabilityZone: string;
  availableIps: number;
  state: ResourceStatus;
  accountId: string;
}

export interface SecurityGroup {
  id: string;
  name: string;
  description: string;
  vpcId: string;
  inboundRules: number;
  outboundRules: number;
  accountId: string;
}

export type S3AccessLevel = 'Public' | 'Private' | 'Bucket and objects not public';
export type S3EncryptionType = 'SSE-S3' | 'SSE-KMS' | 'None';
export type S3StorageClass = 'STANDARD' | 'INTELLIGENT_TIERING' | 'STANDARD_IA' | 'ONEZONE_IA' | 'GLACIER' | 'GLACIER_IR' | 'DEEP_ARCHIVE';

export interface S3BlockPublicAccess {
  blockPublicAcls: boolean;
  ignorePublicAcls: boolean;
  blockPublicPolicy: boolean;
  restrictPublicBuckets: boolean;
}

export interface S3Encryption {
  type: S3EncryptionType;
  kmsKeyId?: string;
  kmsKeyArn?: string;
  bucketKeyEnabled?: boolean;
}

export interface S3Versioning {
  enabled: boolean;
  mfaDelete?: boolean;
}

export interface S3Logging {
  enabled: boolean;
  targetBucket?: string;
  targetPrefix?: string;
}

export interface S3LifecycleRule {
  id: string;
  prefix?: string;
  enabled: boolean;
  transitions?: {
    days: number;
    storageClass: S3StorageClass;
  }[];
  expiration?: {
    days?: number;
    expiredObjectDeleteMarker?: boolean;
  };
  noncurrentVersionExpiration?: {
    days: number;
  };
}

export interface S3Bucket {
  name: string;
  arn?: string;
  region: string;
  createdAt: string;
  access: S3AccessLevel;
  size: string;
  objects: number;
  accountId: string;
  // Extended configuration
  blockPublicAccess?: S3BlockPublicAccess;
  versioning?: S3Versioning;
  encryption?: S3Encryption;
  logging?: S3Logging;
  tags?: Record<string, string>;
  defaultStorageClass?: S3StorageClass;
  lifecycleRules?: S3LifecycleRule[];
  objectLockEnabled?: boolean;
  transferAcceleration?: boolean;
  requestPayerEnabled?: boolean;
}

export interface EBSVolume {
  id: string;
  name: string;
  size: number;
  volumeType: string;
  state: ResourceStatus;
  attachedTo?: string;
  availabilityZone: string;
  iops: number;
  encrypted: boolean;
  accountId: string;
}

export interface NavigationItem {
  type: 'link' | 'section' | 'divider';
  text?: string;
  href?: string;
  items?: NavigationItem[];
}

// Lambda Types
export type LambdaRuntime =
  | 'nodejs20.x' | 'nodejs18.x'
  | 'python3.12' | 'python3.11' | 'python3.10'
  | 'java21' | 'java17'
  | 'go1.x'
  | 'dotnet8' | 'dotnet6';

export interface LambdaFunction {
  name: string;
  description: string;
  runtime: LambdaRuntime;
  handler: string;
  memorySize: number;
  timeout: number;
  codeSize: string;
  lastModified: string;
  state: 'Active' | 'Pending' | 'Inactive' | 'Failed';
  invocations: number;
  errors: number;
  arn: string;
  accountId: string;
}

// ECS Types
export type ECSClusterStatus = 'ACTIVE' | 'PROVISIONING' | 'DEPROVISIONING' | 'FAILED' | 'INACTIVE';

export interface ECSCluster {
  name: string;
  arn: string;
  status: ECSClusterStatus;
  runningTasks: number;
  pendingTasks: number;
  activeServices: number;
  registeredContainerInstances: number;
  capacityProviders: string[];
  accountId: string;
}

export interface ECSService {
  name: string;
  clusterName: string;
  status: 'ACTIVE' | 'DRAINING' | 'INACTIVE';
  desiredCount: number;
  runningCount: number;
  pendingCount: number;
  launchType: 'EC2' | 'FARGATE' | 'EXTERNAL';
  taskDefinition: string;
  createdAt: string;
  accountId: string;
}

export interface ECSTask {
  taskId: string;
  clusterName: string;
  taskDefinition: string;
  status: 'RUNNING' | 'PENDING' | 'STOPPED' | 'PROVISIONING';
  launchType: 'EC2' | 'FARGATE';
  cpu: string;
  memory: string;
  startedAt: string;
  containerInstanceId?: string;
  accountId: string;
}

// EKS Types
export type EKSClusterStatus = 'CREATING' | 'ACTIVE' | 'DELETING' | 'FAILED' | 'UPDATING';

export interface EKSCluster {
  name: string;
  arn: string;
  status: EKSClusterStatus;
  version: string;
  endpoint: string;
  roleArn: string;
  vpcId: string;
  subnetIds: string[];
  securityGroupIds: string[];
  createdAt: string;
  accountId: string;
}

export interface EKSNodeGroup {
  name: string;
  clusterName: string;
  status: 'CREATING' | 'ACTIVE' | 'UPDATING' | 'DELETING' | 'DEGRADED';
  instanceTypes: string[];
  desiredSize: number;
  minSize: number;
  maxSize: number;
  diskSize: number;
  amiType: string;
  nodeRole: string;
  accountId: string;
}

// Auto Scaling Types
export interface AutoScalingGroup {
  name: string;
  launchTemplate: string;
  desiredCapacity: number;
  minSize: number;
  maxSize: number;
  availabilityZones: string[];
  healthCheckType: 'EC2' | 'ELB';
  instances: number;
  healthyInstances: number;
  unhealthyInstances: number;
  status: 'Active' | 'Updating' | 'Deleting';
  targetGroups: string[];
  createdAt: string;
  accountId: string;
}

export interface ScalingPolicy {
  name: string;
  asgName: string;
  policyType: 'TargetTrackingScaling' | 'StepScaling' | 'SimpleScaling';
  metricType: 'CPUUtilization' | 'NetworkIn' | 'NetworkOut' | 'ALBRequestCount';
  targetValue?: number;
  cooldown: number;
  enabled: boolean;
  accountId: string;
}

// Load Balancer Types
export type LoadBalancerType = 'application' | 'network' | 'gateway' | 'classic';
export type LoadBalancerState = 'active' | 'provisioning' | 'active_impaired' | 'failed';

export interface LoadBalancer {
  name: string;
  arn: string;
  dnsName: string;
  type: LoadBalancerType;
  scheme: 'internet-facing' | 'internal';
  state: LoadBalancerState;
  vpcId: string;
  availabilityZones: string[];
  securityGroups?: string[];
  createdAt: string;
  accountId: string;
}

export interface TargetGroup {
  name: string;
  arn: string;
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP' | 'TLS';
  port: number;
  vpcId: string;
  targetType: 'instance' | 'ip' | 'lambda';
  healthCheckPath?: string;
  healthyTargets: number;
  unhealthyTargets: number;
  loadBalancerArns: string[];
  accountId: string;
}

export interface Listener {
  arn: string;
  loadBalancerArn: string;
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP' | 'TLS';
  port: number;
  defaultActions: string[];
  sslPolicy?: string;
}

// Route Table Types
export interface RouteTableRoute {
  destination: string;
  target: string;
  status: 'active' | 'blackhole';
}

export interface RouteTable {
  id: string;
  name: string;
  vpcId: string;
  routes: RouteTableRoute[];
  associations: string[];
  isMain: boolean;
  accountId: string;
}

// Internet Gateway Types
export interface InternetGateway {
  id: string;
  name: string;
  state: 'available' | 'attaching' | 'attached' | 'detaching' | 'detached';
  vpcId?: string;
  accountId: string;
}

// NAT Gateway Types
export interface NATGateway {
  id: string;
  name: string;
  state: 'pending' | 'available' | 'deleting' | 'deleted' | 'failed';
  subnetId: string;
  vpcId: string;
  elasticIp: string;
  privateIp: string;
  createdAt: string;
  accountId: string;
}

// Elastic IP Types
export interface ElasticIP {
  allocationId: string;
  publicIp: string;
  name: string;
  associationId?: string;
  instanceId?: string;
  networkInterfaceId?: string;
  privateIp?: string;
  domain: 'vpc' | 'standard';
  accountId: string;
}

// Network ACL Types
export interface NetworkACLEntry {
  ruleNumber: number;
  protocol: string;
  ruleAction: 'allow' | 'deny';
  cidrBlock: string;
  portRange?: string;
}

export interface NetworkACL {
  id: string;
  name: string;
  vpcId: string;
  isDefault: boolean;
  inboundRules: NetworkACLEntry[];
  outboundRules: NetworkACLEntry[];
  associations: string[];
  accountId: string;
}

// EC2 Provisioning Types
export type InstanceFamily =
  | 'general'
  | 'compute'
  | 'memory'
  | 'storage'
  | 'accelerated'
  | 'hpc';

export interface InstanceType {
  name: string;
  family: InstanceFamily;
  vCPUs: number;
  memory: string;
  storage: string;
  networkPerformance: string;
  pricePerHour: number;
  description: string;
}

export type AMIPlatform = 'linux' | 'windows' | 'macos';
export type AMIArchitecture = 'x86_64' | 'arm64';

export interface AMI {
  id: string;
  name: string;
  description: string;
  platform: AMIPlatform;
  architecture: AMIArchitecture;
  owner: 'bhoomi' | 'marketplace' | 'community' | 'private';
  rootDeviceType: 'ebs' | 'instance-store';
  virtualizationType: 'hvm' | 'paravirtual';
  createdAt: string;
  isFreeTier: boolean;
}

export interface KeyPair {
  name: string;
  fingerprint: string;
  type: 'rsa' | 'ed25519';
  createdAt: string;
  accountId: string;
}

export interface LaunchTemplate {
  id: string;
  name: string;
  version: number;
  defaultVersion: number;
  createdAt: string;
  createdBy: string;
  instanceType?: string;
  amiId?: string;
  keyPairName?: string;
  accountId: string;
}

export interface EC2LaunchConfig {
  name: string;
  amiId: string;
  instanceType: string;
  keyPairName?: string;
  vpcId: string;
  subnetId: string;
  securityGroupIds: string[];
  storageConfig: StorageConfig[];
  publicIpEnabled: boolean;
  iamRole?: string;
  userData?: string;
  tags: Record<string, string>;
  instanceCount: number;
}

export interface StorageConfig {
  deviceName: string;
  volumeType: 'gp3' | 'gp2' | 'io1' | 'io2' | 'st1' | 'sc1' | 'standard';
  volumeSize: number;
  iops?: number;
  throughput?: number;
  encrypted: boolean;
  deleteOnTermination: boolean;
}

// ============================================
// Billing & Cost Management Types
// ============================================

// Invoice Types
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'processing';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'upi' | 'net_banking';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  credits: number;
  total: number;
  currency: string;
  pdfUrl?: string;
  accountId: string;
}

export interface InvoiceLineItem {
  invoiceId: string;
  service: string;
  description: string;
  usage: string;
  rate: number;
  amount: number;
  region: string;
}

// Payment Types
export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  paidAt: string;
}

export interface PaymentMethodInfo {
  id: string;
  type: PaymentMethod;
  isDefault: boolean;
  lastFourDigits?: string;
  cardBrand?: string;
  bankName?: string;
  upiId?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName: string;
  addedAt: string;
}

// Cost Explorer Types
export type CostGranularity = 'daily' | 'monthly' | 'hourly';
export type CostGroupBy = 'service' | 'region' | 'account' | 'usage_type' | 'tag';

export interface CostDataPoint {
  date: string;
  cost: number;
  service?: string;
  region?: string;
  usageType?: string;
}

export interface CostByService {
  service: string;
  cost: number;
  percentageOfTotal: number;
  change: number; // percentage change from previous period
}

export interface CostByRegion {
  region: string;
  regionName: string;
  cost: number;
  percentageOfTotal: number;
}

export interface CostForecast {
  forecastedAmount: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  startDate: string;
  endDate: string;
}

export interface CostAnomaly {
  id: string;
  service: string;
  detectedAt: string;
  expectedCost: number;
  actualCost: number;
  impact: number;
  status: 'open' | 'acknowledged' | 'resolved';
  rootCause?: string;
}

// Budget Types
export type BudgetType = 'cost' | 'usage' | 'savings_plan' | 'reservation';
export type BudgetTimeUnit = 'monthly' | 'quarterly' | 'annually';
export type AlertThresholdType = 'percentage' | 'absolute';

export interface Budget {
  id: string;
  name: string;
  type: BudgetType;
  amount: number;
  currency: string;
  timeUnit: BudgetTimeUnit;
  startDate: string;
  endDate?: string;
  currentSpend: number;
  forecastedSpend: number;
  filters: BudgetFilter;
  alerts: BudgetAlert[];
  createdAt: string;
  updatedAt: string;
  accountId: string;
}

export interface BudgetFilter {
  services?: string[];
  regions?: string[];
  tags?: Record<string, string>;
  linkedAccounts?: string[];
}

export interface BudgetAlert {
  id: string;
  thresholdType: AlertThresholdType;
  threshold: number;
  notificationType: 'actual' | 'forecasted';
  emails: string[];
  snsTopicArn?: string;
  triggered: boolean;
  triggeredAt?: string;
}

// Cost Allocation Tags
export interface CostAllocationTag {
  key: string;
  status: 'active' | 'inactive';
  type: 'user_defined' | 'aws_generated';
  lastUpdatedAt: string;
  values: string[];
}

// Credits & Promotional Credits
export type CreditType = 'promotional' | 'support' | 'refund' | 'enterprise';
export type CreditStatus = 'active' | 'expired' | 'depleted';

export interface Credit {
  id: string;
  name: string;
  type: CreditType;
  originalAmount: number;
  remainingAmount: number;
  currency: string;
  status: CreditStatus;
  expirationDate: string;
  applicableServices: string[] | 'all';
  createdAt: string;
}

// Savings Plans & Reserved Instances
export type SavingsPlanType = 'compute' | 'ec2_instance' | 'sagemaker';
export type SavingsPlanPaymentOption = 'no_upfront' | 'partial_upfront' | 'all_upfront';

export interface SavingsPlan {
  id: string;
  type: SavingsPlanType;
  commitment: number;
  currency: string;
  paymentOption: SavingsPlanPaymentOption;
  term: 1 | 3; // years
  startDate: string;
  endDate: string;
  utilizationPercentage: number;
  savingsPercentage: number;
  status: 'active' | 'expired' | 'queued';
}

export interface ReservedInstance {
  id: string;
  instanceType: string;
  platform: string;
  region: string;
  instanceCount: number;
  term: 1 | 3; // years
  offeringClass: 'standard' | 'convertible';
  paymentOption: 'no_upfront' | 'partial_upfront' | 'all_upfront';
  startDate: string;
  endDate: string;
  utilizationPercentage: number;
  status: 'active' | 'expired' | 'payment-pending';
}

// Free Tier Usage
export interface FreeTierUsage {
  service: string;
  usageType: string;
  limit: number;
  used: number;
  unit: string;
  percentageUsed: number;
  forecastedUsage: number;
  resetDate: string;
}

// Billing Preferences
export interface BillingPreferences {
  invoiceDeliveryEmail: string;
  currency: string;
  taxSettings: TaxSettings;
  paymentTerms: number; // days
  autoPayEnabled: boolean;
  defaultPaymentMethodId?: string;
}

export interface TaxSettings {
  gstNumber?: string;
  panNumber?: string;
  businessName: string;
  billingAddress: BillingAddress;
  taxExempt: boolean;
  taxExemptionCertificate?: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Usage Reports
export interface UsageReport {
  id: string;
  name: string;
  reportType: 'cost_and_usage' | 'reservation_utilization' | 'savings_plans_utilization';
  granularity: CostGranularity;
  format: 'csv' | 'parquet';
  compression: 'gzip' | 'zip' | 'none';
  s3Bucket: string;
  s3Prefix: string;
  status: 'active' | 'disabled';
  createdAt: string;
  lastDelivery?: string;
}

// ============================================
// Monitoring & CloudWatch Types
// ============================================

// Metric Types
export type MetricNamespace =
  | 'AWS/EC2'
  | 'AWS/ECS'
  | 'AWS/EKS'
  | 'AWS/Lambda'
  | 'AWS/RDS'
  | 'AWS/S3'
  | 'AWS/ELB'
  | 'AWS/ApplicationELB'
  | 'AWS/NetworkELB'
  | 'AWS/AutoScaling'
  | 'AWS/EBS'
  | 'AWS/VPC'
  | 'Custom';

export type MetricStatistic = 'Average' | 'Sum' | 'Minimum' | 'Maximum' | 'SampleCount' | 'p99' | 'p95' | 'p90' | 'p50';

export interface MetricDimension {
  name: string;
  value: string;
}

export interface Metric {
  namespace: MetricNamespace;
  metricName: string;
  dimensions: MetricDimension[];
  unit?: string;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  unit?: string;
}

export interface MetricDataResult {
  metric: Metric;
  datapoints: MetricDataPoint[];
  label?: string;
}

// Alarm Types
export type AlarmState = 'OK' | 'ALARM' | 'INSUFFICIENT_DATA';
export type ComparisonOperator =
  | 'GreaterThanOrEqualToThreshold'
  | 'GreaterThanThreshold'
  | 'LessThanThreshold'
  | 'LessThanOrEqualToThreshold';

export type AlarmActionsEnabled = boolean;

export interface AlarmAction {
  type: 'SNS' | 'AutoScaling' | 'EC2' | 'Lambda';
  arn: string;
  name: string;
}

export interface CloudWatchAlarm {
  id: string;
  name: string;
  description?: string;
  namespace: MetricNamespace;
  metricName: string;
  dimensions: MetricDimension[];
  statistic: MetricStatistic;
  period: number; // seconds
  evaluationPeriods: number;
  threshold: number;
  comparisonOperator: ComparisonOperator;
  state: AlarmState;
  stateReason?: string;
  stateUpdatedAt: string;
  actionsEnabled: boolean;
  alarmActions: AlarmAction[];
  okActions: AlarmAction[];
  insufficientDataActions: AlarmAction[];
  createdAt: string;
  updatedAt: string;
  accountId: string;
}

export interface AlarmHistoryItem {
  alarmName: string;
  timestamp: string;
  historyItemType: 'StateUpdate' | 'ConfigurationUpdate' | 'Action';
  historySummary: string;
  historyData?: string;
}

// Dashboard Types
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'text' | 'alarm' | 'log' | 'explorer';
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: DashboardWidgetProperties;
}

export interface DashboardWidgetProperties {
  metrics?: Metric[];
  stat?: MetricStatistic;
  period?: number;
  region?: string;
  title?: string;
  markdown?: string;
  alarms?: string[];
  query?: string;
  view?: 'timeSeries' | 'singleValue' | 'gauge' | 'bar' | 'pie';
  stacked?: boolean;
  yAxis?: {
    left?: { min?: number; max?: number; label?: string };
    right?: { min?: number; max?: number; label?: string };
  };
}

export interface CloudWatchDashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  accountId: string;
}

// Log Types
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogGroup {
  name: string;
  arn: string;
  createdAt: string;
  retentionInDays: number | 'Never Expire';
  storedBytes: number;
  logStreamCount: number;
  metricFilterCount: number;
  kmsKeyId?: string;
  tags: Record<string, string>;
  accountId: string;
}

export interface LogStream {
  name: string;
  logGroupName: string;
  createdAt: string;
  firstEventAt?: string;
  lastEventAt?: string;
  lastIngestionTime?: string;
  uploadSequenceToken?: string;
  storedBytes: number;
}

export interface LogEvent {
  timestamp: string;
  message: string;
  ingestionTime: string;
  logStreamName: string;
}

export interface LogInsightsQuery {
  id: string;
  name: string;
  query: string;
  logGroups: string[];
  createdAt: string;
  lastRunAt?: string;
  isSaved: boolean;
}

export interface LogInsightsResult {
  queryId: string;
  status: 'Scheduled' | 'Running' | 'Complete' | 'Failed' | 'Cancelled';
  statistics?: {
    recordsMatched: number;
    recordsScanned: number;
    bytesScanned: number;
  };
  results: Record<string, string>[];
}

export interface MetricFilter {
  name: string;
  logGroupName: string;
  filterPattern: string;
  metricTransformations: MetricTransformation[];
  createdAt: string;
}

export interface MetricTransformation {
  metricName: string;
  metricNamespace: string;
  metricValue: string;
  defaultValue?: number;
  unit?: string;
}

export interface SubscriptionFilter {
  name: string;
  logGroupName: string;
  filterPattern: string;
  destinationArn: string;
  roleArn?: string;
  distribution?: 'Random' | 'ByLogStream';
  createdAt: string;
}

// Events/EventBridge Types
export type EventState = 'ENABLED' | 'DISABLED';
export type EventRuleState = 'ENABLED' | 'DISABLED';

export interface EventBus {
  name: string;
  arn: string;
  policy?: string;
  createdAt: string;
  isDefault: boolean;
}

export interface EventRule {
  id: string;
  name: string;
  description?: string;
  eventBusName: string;
  eventPattern?: string;
  scheduleExpression?: string;
  state: EventRuleState;
  targets: EventTarget[];
  createdAt: string;
  updatedAt: string;
}

export interface EventTarget {
  id: string;
  arn: string;
  roleArn?: string;
  input?: string;
  inputPath?: string;
  inputTransformer?: {
    inputPathsMap: Record<string, string>;
    inputTemplate: string;
  };
}

// Synthetics (Canaries) Types
export type CanaryState = 'CREATING' | 'READY' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'ERROR' | 'DELETING';
export type CanaryRunState = 'RUNNING' | 'PASSED' | 'FAILED';

export interface SyntheticCanary {
  id: string;
  name: string;
  status: CanaryState;
  schedule: string;
  runtimeVersion: string;
  handler: string;
  successRetentionPeriod: number;
  failureRetentionPeriod: number;
  s3Location: string;
  vpcConfig?: {
    vpcId: string;
    subnetIds: string[];
    securityGroupIds: string[];
  };
  lastRunStatus?: CanaryRunState;
  lastRunTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanaryRun {
  id: string;
  canaryName: string;
  status: CanaryRunState;
  startedAt: string;
  completedAt?: string;
  artifactS3Location: string;
  timeline?: {
    started: string;
    completed?: string;
  };
}

// Service Health Types
export interface ServiceHealth {
  service: string;
  region: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  lastUpdated: string;
  message?: string;
}

export interface HealthEvent {
  id: string;
  service: string;
  region: string;
  eventType: 'issue' | 'scheduledChange' | 'accountNotification';
  status: 'open' | 'upcoming' | 'closed';
  startTime: string;
  endTime?: string;
  lastUpdatedTime: string;
  description: string;
  affectedResources?: string[];
}

// Application Insights Types
export interface ApplicationInsightsApp {
  id: string;
  name: string;
  resourceGroup: string;
  lifeCycle: 'ACTIVE' | 'NOT_CONFIGURED' | 'DELETING';
  opsCenterEnabled: boolean;
  cweMonitorEnabled: boolean;
  detectedProblems: number;
  createdAt: string;
}

export interface DetectedProblem {
  id: string;
  applicationName: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'ONGOING' | 'RESOLVED' | 'IGNORED';
  affectedResource: string;
  startTime: string;
  endTime?: string;
  insights: string;
  feedback?: 'USEFUL' | 'NOT_USEFUL';
}

// Container Insights Types
export interface ContainerInsightsCluster {
  clusterName: string;
  clusterType: 'ECS' | 'EKS';
  status: 'Active' | 'Inactive';
  nodeCount: number;
  podCount: number;
  containerCount: number;
  cpuUtilization: number;
  memoryUtilization: number;
  networkRxBytes: number;
  networkTxBytes: number;
}

// X-Ray Tracing Types
export interface XRayTrace {
  id: string;
  duration: number;
  responseTime: number;
  hasFault: boolean;
  hasError: boolean;
  hasThrottle: boolean;
  isPartial: boolean;
  http?: {
    url: string;
    method: string;
    statusCode: number;
  };
  users?: string[];
  serviceIds: {
    name: string;
    type: string;
    accountId: string;
  }[];
}

export interface XRayServiceMap {
  services: XRayService[];
  edges: XRayEdge[];
}

export interface XRayService {
  referenceId: number;
  name: string;
  type: string;
  state: 'active' | 'unknown';
  accountId?: string;
  responseTimeHistogram?: number[];
  durationHistogram?: number[];
  summaryStatistics?: {
    okCount: number;
    errorStatistics: {
      throttleCount: number;
      otherCount: number;
      totalCount: number;
    };
    faultStatistics: {
      otherCount: number;
      totalCount: number;
    };
    totalCount: number;
    totalResponseTime: number;
  };
}

export interface XRayEdge {
  referenceId: number;
  sourceReferenceId: number;
  destinationReferenceId: number;
  summaryStatistics?: {
    okCount: number;
    errorStatistics: {
      throttleCount: number;
      otherCount: number;
      totalCount: number;
    };
    faultStatistics: {
      otherCount: number;
      totalCount: number;
    };
    totalCount: number;
    totalResponseTime: number;
  };
}

// ============================================
// IAM (Identity and Access Management) Types
// ============================================

// IAM User Types
export type IAMUserStatus = 'Active' | 'Inactive';

export interface IAMAccessKey {
  accessKeyId: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastUsedAt?: string;
  lastUsedService?: string;
  lastUsedRegion?: string;
}

export interface IAMMFADevice {
  serialNumber: string;
  type: 'virtual' | 'hardware' | 'sms';
  enabledAt: string;
}

export interface IAMLoginProfile {
  createdAt: string;
  passwordLastUsed?: string;
  passwordResetRequired: boolean;
}

export interface IAMUser {
  id: string;
  userName: string;
  arn: string;
  path: string;
  createdAt: string;
  passwordLastUsed?: string;
  consoleAccess: boolean;
  programmaticAccess: boolean;
  mfaEnabled: boolean;
  accessKeys: IAMAccessKey[];
  mfaDevices: IAMMFADevice[];
  loginProfile?: IAMLoginProfile;
  groups: string[];
  attachedPolicies: string[];
  inlinePolicies: string[];
  permissionsBoundary?: string;
  tags: Record<string, string>;
  accountId: string;
}

// IAM Group Types
export interface IAMGroup {
  id: string;
  groupName: string;
  arn: string;
  path: string;
  createdAt: string;
  userCount: number;
  users: string[];
  attachedPolicies: string[];
  inlinePolicies: string[];
  accountId: string;
}

// IAM Role Types
export type IAMRoleTrustEntityType = 'AWS service' | 'AWS account' | 'Web identity' | 'SAML 2.0 federation' | 'Custom trust policy';

export interface IAMRoleTrustPolicy {
  version: string;
  statement: {
    effect: 'Allow' | 'Deny';
    principal: Record<string, string | string[]>;
    action: string | string[];
    condition?: Record<string, Record<string, string | string[]>>;
  }[];
}

export interface IAMRole {
  id: string;
  roleName: string;
  arn: string;
  path: string;
  createdAt: string;
  description?: string;
  maxSessionDuration: number;
  trustEntityType: IAMRoleTrustEntityType;
  trustedEntities: string[];
  trustPolicy: IAMRoleTrustPolicy;
  attachedPolicies: string[];
  inlinePolicies: string[];
  permissionsBoundary?: string;
  lastUsedAt?: string;
  lastUsedRegion?: string;
  tags: Record<string, string>;
  accountId: string;
}

// IAM Policy Types
export type IAMPolicyType = 'AWS managed' | 'Customer managed';
export type IAMPolicyScope = 'All' | 'AWS managed' | 'Customer managed';

export interface IAMPolicyVersion {
  versionId: string;
  isDefaultVersion: boolean;
  createdAt: string;
  document: IAMPolicyDocument;
}

export interface IAMPolicyStatement {
  sid?: string;
  effect: 'Allow' | 'Deny';
  action: string | string[];
  resource: string | string[];
  condition?: Record<string, Record<string, string | string[]>>;
}

export interface IAMPolicyDocument {
  version: string;
  statement: IAMPolicyStatement[];
}

export interface IAMPolicy {
  id: string;
  policyName: string;
  arn: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  type: IAMPolicyType;
  attachmentCount: number;
  permissionsBoundaryUsageCount: number;
  isAttachable: boolean;
  defaultVersionId: string;
  versions: IAMPolicyVersion[];
  attachedUsers: string[];
  attachedGroups: string[];
  attachedRoles: string[];
  tags: Record<string, string>;
  accountId: string;
}

// IAM Identity Provider Types
export type IAMIdentityProviderType = 'SAML' | 'OIDC';

export interface IAMSAMLProvider {
  id: string;
  name: string;
  arn: string;
  type: 'SAML';
  createdAt: string;
  validUntil?: string;
  metadataDocument: string;
  tags: Record<string, string>;
}

export interface IAMOIDCProvider {
  id: string;
  name: string;
  arn: string;
  type: 'OIDC';
  url: string;
  clientIds: string[];
  thumbprints: string[];
  createdAt: string;
  tags: Record<string, string>;
}

export type IAMIdentityProvider = IAMSAMLProvider | IAMOIDCProvider;

// IAM Account Settings
export interface IAMPasswordPolicy {
  minimumPasswordLength: number;
  requireSymbols: boolean;
  requireNumbers: boolean;
  requireUppercaseCharacters: boolean;
  requireLowercaseCharacters: boolean;
  allowUsersToChangePassword: boolean;
  expirePasswords: boolean;
  maxPasswordAge?: number;
  passwordReusePrevention?: number;
  hardExpiry: boolean;
}

export interface IAMAccountSummary {
  users: number;
  usersQuota: number;
  groups: number;
  groupsQuota: number;
  roles: number;
  rolesQuota: number;
  policies: number;
  policiesQuota: number;
  serverCertificates: number;
  serverCertificatesQuota: number;
  mfaDevices: number;
  mfaDevicesInUse: number;
  accountAccessKeysPresent: number;
  accountMFAEnabled: boolean;
  accountSigningCertificatesPresent: number;
  attachedPoliciesPerGroupQuota: number;
  attachedPoliciesPerRoleQuota: number;
  attachedPoliciesPerUserQuota: number;
  groupPolicySizeQuota: number;
  instanceProfiles: number;
  instanceProfilesQuota: number;
  providers: number;
}

// IAM Access Analyzer
export interface IAMAccessAnalyzer {
  id: string;
  name: string;
  arn: string;
  type: 'ACCOUNT' | 'ORGANIZATION';
  status: 'ACTIVE' | 'CREATING' | 'DISABLED' | 'FAILED';
  createdAt: string;
  lastResourceAnalyzed?: string;
  lastResourceAnalyzedAt?: string;
  findingsCount: number;
  tags: Record<string, string>;
}

export interface IAMAccessAnalyzerFinding {
  id: string;
  analyzerArn: string;
  resourceType: 'AWS::S3::Bucket' | 'AWS::IAM::Role' | 'AWS::KMS::Key' | 'AWS::Lambda::Function' | 'AWS::SQS::Queue' | 'AWS::SecretsManager::Secret';
  resource: string;
  resourceOwnerAccount: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'RESOLVED';
  condition: Record<string, string>;
  action: string[];
  principal: Record<string, string>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// IAM Credential Report
export interface IAMCredentialReportEntry {
  user: string;
  arn: string;
  userCreationTime: string;
  passwordEnabled: boolean;
  passwordLastUsed?: string;
  passwordLastChanged?: string;
  passwordNextRotation?: string;
  mfaActive: boolean;
  accessKey1Active: boolean;
  accessKey1LastRotated?: string;
  accessKey1LastUsedDate?: string;
  accessKey1LastUsedRegion?: string;
  accessKey1LastUsedService?: string;
  accessKey2Active: boolean;
  accessKey2LastRotated?: string;
  accessKey2LastUsedDate?: string;
  accessKey2LastUsedRegion?: string;
  accessKey2LastUsedService?: string;
  cert1Active: boolean;
  cert1LastRotated?: string;
  cert2Active: boolean;
  cert2LastRotated?: string;
}

// IAM Service-Linked Roles
export interface IAMServiceLinkedRole {
  roleName: string;
  arn: string;
  serviceName: string;
  description: string;
  createdAt: string;
  deletionTaskId?: string;
}

// Organization Types
export * from './organization';

// ============================================
// Support Types
// ============================================

// Support Case Types
export type SupportCaseSeverity = 'low' | 'normal' | 'high' | 'urgent' | 'critical';
export type SupportCaseStatus = 'open' | 'pending-customer-action' | 'pending-bhoomi-action' | 'resolved' | 'closed';
export type SupportCaseCategory =
  | 'account-and-billing'
  | 'service-limit-increase'
  | 'technical-support'
  | 'general-guidance'
  | 'security'
  | 'abuse-report';

export type SupportService =
  | 'EC2'
  | 'S3'
  | 'Lambda'
  | 'ECS'
  | 'EKS'
  | 'VPC'
  | 'IAM'
  | 'CloudWatch'
  | 'Billing'
  | 'Account'
  | 'Other';

export interface SupportCaseAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface SupportCaseCommunication {
  id: string;
  body: string;
  submittedBy: string;
  submitterType: 'customer' | 'bhoomi-support';
  submittedAt: string;
  attachments: SupportCaseAttachment[];
}

export interface SupportCase {
  id: string;
  caseId: string;
  displayId: string;
  subject: string;
  status: SupportCaseStatus;
  severity: SupportCaseSeverity;
  category: SupportCaseCategory;
  service: SupportService;
  description: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  submittedBy: string;
  ccEmailAddresses: string[];
  communications: SupportCaseCommunication[];
  language: string;
  accountId: string;
}

// Support Plan Types
export type SupportPlanType = 'basic' | 'developer' | 'business' | 'enterprise';

export interface SupportPlan {
  type: SupportPlanType;
  name: string;
  description: string;
  monthlyPrice: number | 'Contact Sales';
  features: string[];
  responseTime: {
    critical?: string;
    urgent?: string;
    high?: string;
    normal?: string;
    low?: string;
  };
  supportChannels: ('documentation' | 'forums' | 'email' | 'chat' | 'phone' | 'tam')[];
  technicalAccountManager: boolean;
  trainingCredits: number;
  conciergeSupport: boolean;
}

// Trusted Advisor Types
export type TrustedAdvisorCategory =
  | 'cost-optimizing'
  | 'performance'
  | 'security'
  | 'fault-tolerance'
  | 'service-limits';

export type TrustedAdvisorStatus = 'ok' | 'warning' | 'error' | 'not-available';

export interface TrustedAdvisorCheck {
  id: string;
  name: string;
  description: string;
  category: TrustedAdvisorCategory;
  status: TrustedAdvisorStatus;
  resourcesSummary: {
    resourcesProcessed: number;
    resourcesFlagged: number;
    resourcesIgnored: number;
    resourcesSuppressed: number;
  };
  flaggedResources: TrustedAdvisorFlaggedResource[];
  estimatedMonthlySavings?: number;
  estimatedPercentSavings?: number;
  lastRefreshedAt: string;
}

export interface TrustedAdvisorFlaggedResource {
  id: string;
  status: 'ok' | 'warning' | 'error';
  region?: string;
  resourceId: string;
  metadata: Record<string, string>;
  isSuppressed: boolean;
}

// Health Dashboard Types
export interface ServiceHealthEvent {
  id: string;
  service: SupportService | string;
  region: string;
  eventTypeCode: string;
  eventTypeCategory: 'issue' | 'accountNotification' | 'scheduledChange';
  statusCode: 'open' | 'upcoming' | 'closed';
  startTime: string;
  endTime?: string;
  lastUpdatedTime: string;
  eventScopeCode: 'ACCOUNT_SPECIFIC' | 'PUBLIC';
  description: string;
  affectedEntities: string[];
}

// Knowledge Base Types
export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  service: SupportService;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  helpfulCount: number;
  relatedArticles: string[];
}

// Support Contact Types
export interface SupportContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isPrimary: boolean;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    cases: boolean;
    healthEvents: boolean;
  };
}
