/**
 * Centralized type-to-label mapping utilities
 */

// Payment method labels
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    card: 'Credit/Debit Card',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    net_banking: 'Net Banking',
    wallet: 'Wallet',
  };
  return labels[method] || method;
}

// Credit type labels
export function getCreditTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    promotional: 'Promotional Credit',
    referral: 'Referral Credit',
    support: 'Support Credit',
    startup: 'Startup Credit',
    enterprise: 'Enterprise Credit',
  };
  return labels[type] || type;
}

// Savings plan type labels
export function getSavingsPlanTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    compute: 'Compute Savings Plan',
    ec2_instance: 'EC2 Instance Savings Plan',
    sagemaker: 'SageMaker Savings Plan',
  };
  return labels[type] || type;
}

// Payment option labels
export function getPaymentOptionLabel(option: string): string {
  const labels: Record<string, string> = {
    no_upfront: 'No Upfront',
    partial_upfront: 'Partial Upfront',
    all_upfront: 'All Upfront',
  };
  return labels[option] || option;
}

// Instance type labels
export function getInstanceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    reserved: 'Reserved Instance',
    on_demand: 'On-Demand',
    spot: 'Spot Instance',
    dedicated: 'Dedicated Host',
  };
  return labels[type] || type;
}

// Load balancer type labels
export function getLoadBalancerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    application: 'Application Load Balancer',
    network: 'Network Load Balancer',
    gateway: 'Gateway Load Balancer',
    classic: 'Classic Load Balancer',
  };
  return labels[type] || type;
}

// EBS volume type labels
export function getVolumeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    gp2: 'General Purpose SSD (gp2)',
    gp3: 'General Purpose SSD (gp3)',
    io1: 'Provisioned IOPS SSD (io1)',
    io2: 'Provisioned IOPS SSD (io2)',
    st1: 'Throughput Optimized HDD (st1)',
    sc1: 'Cold HDD (sc1)',
    standard: 'Magnetic (standard)',
  };
  return labels[type] || type;
}

// S3 storage class labels
export function getStorageClassLabel(storageClass: string): string {
  const labels: Record<string, string> = {
    STANDARD: 'Standard',
    STANDARD_IA: 'Standard-IA',
    ONEZONE_IA: 'One Zone-IA',
    INTELLIGENT_TIERING: 'Intelligent-Tiering',
    GLACIER: 'Glacier',
    GLACIER_IR: 'Glacier Instant Retrieval',
    DEEP_ARCHIVE: 'Glacier Deep Archive',
  };
  return labels[storageClass] || storageClass;
}

// Region labels
export function getRegionLabel(region: string): string {
  const labels: Record<string, string> = {
    'ap-south-1': 'Asia Pacific (Mumbai)',
    'ap-south-2': 'Asia Pacific (Hyderabad)',
    'ap-southeast-1': 'Asia Pacific (Singapore)',
    'ap-southeast-2': 'Asia Pacific (Sydney)',
    'ap-northeast-1': 'Asia Pacific (Tokyo)',
    'ap-northeast-2': 'Asia Pacific (Seoul)',
    'us-east-1': 'US East (N. Virginia)',
    'us-east-2': 'US East (Ohio)',
    'us-west-1': 'US West (N. California)',
    'us-west-2': 'US West (Oregon)',
    'eu-west-1': 'Europe (Ireland)',
    'eu-central-1': 'Europe (Frankfurt)',
  };
  return labels[region] || region;
}

// Budget type labels
export function getBudgetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    cost: 'Cost Budget',
    usage: 'Usage Budget',
    savings_plans_coverage: 'Savings Plans Coverage',
    savings_plans_utilization: 'Savings Plans Utilization',
    ri_coverage: 'Reserved Instance Coverage',
    ri_utilization: 'Reserved Instance Utilization',
  };
  return labels[type] || type;
}

// Time unit labels
export function getTimeUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    daily: 'Daily',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annually: 'Annually',
  };
  return labels[unit] || unit;
}
