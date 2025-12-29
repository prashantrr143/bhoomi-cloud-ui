import { useCallback, useMemo } from 'react';
import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';

const navigationItems: SideNavigationProps.Item[] = [
  {
    type: 'link',
    text: 'Dashboard',
    href: '/console',
  },
  {
    type: 'section',
    text: 'Compute',
    items: [
      { type: 'link', text: 'Instances', href: '/compute/instances' },
      { type: 'link', text: 'Auto Scaling Groups', href: '/compute/autoscaling' },
      { type: 'link', text: 'Key Pairs', href: '/compute/key-pairs' },
      { type: 'link', text: 'Load Balancers', href: '/compute/load-balancers' },
      { type: 'link', text: 'Target Groups', href: '/compute/target-groups' },
      { type: 'link', text: 'ECS Clusters', href: '/compute/ecs/clusters' },
      { type: 'link', text: 'ECS Services', href: '/compute/ecs/services' },
      { type: 'link', text: 'EKS Clusters', href: '/compute/eks/clusters' },
      { type: 'link', text: 'EKS Node Groups', href: '/compute/eks/node-groups' },
      { type: 'link', text: 'Lambda Functions', href: '/compute/lambda' },
    ],
  },
  {
    type: 'section',
    text: 'Networking',
    items: [
      { type: 'link', text: 'VPCs', href: '/networking/vpcs' },
      { type: 'link', text: 'Subnets', href: '/networking/subnets' },
      { type: 'link', text: 'Route Tables', href: '/networking/route-tables' },
      { type: 'link', text: 'Internet Gateways', href: '/networking/internet-gateways' },
      { type: 'link', text: 'NAT Gateways', href: '/networking/nat-gateways' },
      { type: 'link', text: 'Elastic IPs', href: '/networking/elastic-ips' },
      { type: 'link', text: 'Security Groups', href: '/networking/security-groups' },
      { type: 'link', text: 'Network ACLs', href: '/networking/network-acls' },
    ],
  },
  {
    type: 'section',
    text: 'Storage',
    items: [
      { type: 'link', text: 'S3 Buckets', href: '/storage/s3' },
      { type: 'link', text: 'EBS Volumes', href: '/storage/ebs' },
    ],
  },
  {
    type: 'section',
    text: 'Security & Identity',
    items: [
      { type: 'link', text: 'IAM Dashboard', href: '/iam' },
      { type: 'link', text: 'Users', href: '/iam/users' },
      { type: 'link', text: 'Groups', href: '/iam/groups' },
      { type: 'link', text: 'Roles', href: '/iam/roles' },
      { type: 'link', text: 'Policies', href: '/iam/policies' },
      { type: 'link', text: 'Identity Providers', href: '/iam/identity-providers' },
      { type: 'link', text: 'Access Analyzer', href: '/iam/access-analyzer' },
    ],
  },
  {
    type: 'section',
    text: 'Monitoring',
    items: [
      { type: 'link', text: 'CloudWatch Dashboard', href: '/monitoring' },
      { type: 'link', text: 'Alarms', href: '/monitoring/alarms' },
      { type: 'link', text: 'Metrics', href: '/monitoring/metrics' },
      { type: 'link', text: 'Dashboards', href: '/monitoring/dashboards' },
      { type: 'link', text: 'Log Groups', href: '/monitoring/logs' },
      { type: 'link', text: 'Logs Insights', href: '/monitoring/logs/insights' },
      { type: 'link', text: 'EventBridge', href: '/monitoring/events' },
      { type: 'link', text: 'Synthetics', href: '/monitoring/synthetics' },
    ],
  },
  { type: 'divider' },
  {
    type: 'section',
    text: 'Billing & Cost Management',
    items: [
      { type: 'link', text: 'Billing Dashboard', href: '/billing' },
      { type: 'link', text: 'Bills & Payments', href: '/billing/bills' },
      { type: 'link', text: 'Cost Explorer', href: '/billing/cost-explorer' },
      { type: 'link', text: 'Budgets', href: '/billing/budgets' },
      { type: 'link', text: 'Cost Allocation Tags', href: '/billing/cost-allocation-tags' },
      { type: 'link', text: 'Payment Methods', href: '/billing/payment-methods' },
      { type: 'link', text: 'Credits & Savings', href: '/billing/credits' },
    ],
  },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentAccount } = useTenant();

  const handleFollow = useCallback(
    (event: CustomEvent<SideNavigationProps.FollowDetail>) => {
      event.preventDefault();
      navigate(event.detail.href);
    },
    [navigate]
  );

  // Memoize header to prevent re-renders
  const header = useMemo(
    () => ({
      text: currentAccount
        ? `${currentAccount.name} (${currentAccount.id.slice(-4)})`
        : 'Bhoomi Cloud',
      href: '/console',
    }),
    [currentAccount]
  );

  return (
    <SideNavigation
      header={header}
      items={navigationItems}
      activeHref={location.pathname}
      onFollow={handleFollow}
    />
  );
}
