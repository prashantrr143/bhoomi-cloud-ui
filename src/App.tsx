import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Spinner from '@cloudscape-design/components/spinner';
import Box from '@cloudscape-design/components/box';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { ProtectedRoute } from '@/components/common';
import { MainLayout } from '@/components/layout';

// Loading fallback component
function PageLoader() {
  return (
    <Box textAlign="center" padding={{ top: 'xxxl' }}>
      <Spinner size="large" />
    </Box>
  );
}

// Lazy load all page components for code splitting
// Public pages
const LandingPage = lazy(() => import('@/pages/landing').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/auth').then((m) => ({ default: m.LoginPage })));

// Dashboard
const Dashboard = lazy(() => import('@/pages/dashboard').then((m) => ({ default: m.Dashboard })));

// Organization
const OrganizationPage = lazy(() =>
  import('@/pages/organization').then((m) => ({ default: m.OrganizationPage }))
);

// Compute pages
const InstancesPage = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.InstancesPage }))
);
const InstanceDetailsPage = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.InstanceDetailsPage }))
);
const LaunchInstanceWizard = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.LaunchInstanceWizard }))
);
const KeyPairsPage = lazy(() => import('@/pages/compute').then((m) => ({ default: m.KeyPairsPage })));
const LambdaPage = lazy(() => import('@/pages/compute').then((m) => ({ default: m.LambdaPage })));
const ECSClustersPage = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.ECSClustersPage }))
);
const ECSServicesPage = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.ECSServicesPage }))
);
const EKSClustersPage = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.EKSClustersPage }))
);
const EKSNodeGroupsPage = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.EKSNodeGroupsPage }))
);
const AutoScalingPage = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.AutoScalingPage }))
);
const LoadBalancersPage = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.LoadBalancersPage }))
);
const TargetGroupsPage = lazy(() =>
  import('@/pages/compute').then((m) => ({ default: m.TargetGroupsPage }))
);

// Networking pages
const VPCsPage = lazy(() => import('@/pages/networking').then((m) => ({ default: m.VPCsPage })));
const SubnetsPage = lazy(() =>
  import('@/pages/networking').then((m) => ({ default: m.SubnetsPage }))
);
const SecurityGroupsPage = lazy(() =>
  import('@/pages/networking').then((m) => ({ default: m.SecurityGroupsPage }))
);
const RouteTablesPage = lazy(() =>
  import('@/pages/networking').then((m) => ({ default: m.RouteTablesPage }))
);
const InternetGatewaysPage = lazy(() =>
  import('@/pages/networking').then((m) => ({ default: m.InternetGatewaysPage }))
);
const NATGatewaysPage = lazy(() =>
  import('@/pages/networking').then((m) => ({ default: m.NATGatewaysPage }))
);
const ElasticIPsPage = lazy(() =>
  import('@/pages/networking').then((m) => ({ default: m.ElasticIPsPage }))
);
const NetworkACLsPage = lazy(() =>
  import('@/pages/networking').then((m) => ({ default: m.NetworkACLsPage }))
);

// Storage pages
const S3Page = lazy(() => import('@/pages/storage').then((m) => ({ default: m.S3Page })));
const S3BucketWizard = lazy(() =>
  import('@/pages/storage').then((m) => ({ default: m.S3BucketWizard }))
);
const EBSPage = lazy(() => import('@/pages/storage').then((m) => ({ default: m.EBSPage })));

// Billing pages
const BillingDashboardPage = lazy(() =>
  import('@/pages/billing').then((m) => ({ default: m.BillingDashboardPage }))
);
const BillsPage = lazy(() => import('@/pages/billing').then((m) => ({ default: m.BillsPage })));
const CostExplorerPage = lazy(() =>
  import('@/pages/billing').then((m) => ({ default: m.CostExplorerPage }))
);
const BudgetsPage = lazy(() => import('@/pages/billing').then((m) => ({ default: m.BudgetsPage })));
const CostAllocationTagsPage = lazy(() =>
  import('@/pages/billing').then((m) => ({ default: m.CostAllocationTagsPage }))
);
const PaymentMethodsPage = lazy(() =>
  import('@/pages/billing').then((m) => ({ default: m.PaymentMethodsPage }))
);
const CreditsPage = lazy(() => import('@/pages/billing').then((m) => ({ default: m.CreditsPage })));

// Monitoring pages
const MonitoringDashboardPage = lazy(() =>
  import('@/pages/monitoring').then((m) => ({ default: m.MonitoringDashboardPage }))
);
const AlarmsPage = lazy(() =>
  import('@/pages/monitoring').then((m) => ({ default: m.AlarmsPage }))
);
const MetricsPage = lazy(() =>
  import('@/pages/monitoring').then((m) => ({ default: m.MetricsPage }))
);
const LogGroupsPage = lazy(() =>
  import('@/pages/monitoring').then((m) => ({ default: m.LogGroupsPage }))
);
const LogInsightsPage = lazy(() =>
  import('@/pages/monitoring').then((m) => ({ default: m.LogInsightsPage }))
);
const EventsPage = lazy(() =>
  import('@/pages/monitoring').then((m) => ({ default: m.EventsPage }))
);
const DashboardsPage = lazy(() =>
  import('@/pages/monitoring').then((m) => ({ default: m.DashboardsPage }))
);
const SyntheticsPage = lazy(() =>
  import('@/pages/monitoring').then((m) => ({ default: m.SyntheticsPage }))
);

// IAM pages
const IAMDashboardPage = lazy(() =>
  import('@/pages/iam').then((m) => ({ default: m.IAMDashboardPage }))
);
const UsersPage = lazy(() => import('@/pages/iam').then((m) => ({ default: m.UsersPage })));
const GroupsPage = lazy(() => import('@/pages/iam').then((m) => ({ default: m.GroupsPage })));
const RolesPage = lazy(() => import('@/pages/iam').then((m) => ({ default: m.RolesPage })));
const PoliciesPage = lazy(() => import('@/pages/iam').then((m) => ({ default: m.PoliciesPage })));
const IdentityProvidersPage = lazy(() =>
  import('@/pages/iam').then((m) => ({ default: m.IdentityProvidersPage }))
);
const AddIdentityProviderPage = lazy(() =>
  import('@/pages/iam').then((m) => ({ default: m.AddIdentityProviderPage }))
);
const AccessAnalyzerPage = lazy(() =>
  import('@/pages/iam').then((m) => ({ default: m.AccessAnalyzerPage }))
);

// Settings pages
const ProfilePage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.ProfilePage }))
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes - Console */}
            <Route
              element={
                <ProtectedRoute>
                  <TenantProvider>
                    <MainLayout />
                  </TenantProvider>
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route path="/console" element={<Dashboard />} />

              {/* Organization */}
              <Route path="/organization" element={<OrganizationPage />} />
              <Route path="/organization/accounts" element={<OrganizationPage />} />
              <Route path="/organization/ous" element={<OrganizationPage />} />
              <Route path="/organization/policies" element={<OrganizationPage />} />

              {/* Compute - Redirects for parent paths */}
              <Route path="/compute" element={<Navigate to="/compute/instances" replace />} />
              <Route path="/compute/ec2" element={<Navigate to="/compute/instances" replace />} />
              <Route path="/compute/elb" element={<Navigate to="/compute/load-balancers" replace />} />
              <Route path="/compute/containers" element={<Navigate to="/compute/ecs/clusters" replace />} />
              <Route path="/compute/serverless" element={<Navigate to="/compute/lambda" replace />} />

              {/* Compute - EC2 */}
              <Route path="/compute/instances" element={<InstancesPage />} />
              <Route path="/compute/instances/launch" element={<LaunchInstanceWizard />} />
              <Route path="/compute/instances/:instanceId" element={<InstanceDetailsPage />} />
              <Route path="/compute/key-pairs" element={<KeyPairsPage />} />

              {/* Compute - Lambda */}
              <Route path="/compute/lambda" element={<LambdaPage />} />

              {/* Compute - ECS */}
              <Route path="/compute/ecs/clusters" element={<ECSClustersPage />} />
              <Route path="/compute/ecs/services" element={<ECSServicesPage />} />

              {/* Compute - EKS */}
              <Route path="/compute/eks/clusters" element={<EKSClustersPage />} />
              <Route path="/compute/eks/node-groups" element={<EKSNodeGroupsPage />} />

              {/* Compute - Auto Scaling */}
              <Route path="/compute/autoscaling" element={<AutoScalingPage />} />

              {/* Compute - Load Balancing */}
              <Route path="/compute/load-balancers" element={<LoadBalancersPage />} />
              <Route path="/compute/target-groups" element={<TargetGroupsPage />} />

              {/* Networking */}
              <Route path="/networking/vpcs" element={<VPCsPage />} />
              <Route path="/networking/subnets" element={<SubnetsPage />} />
              <Route path="/networking/route-tables" element={<RouteTablesPage />} />
              <Route path="/networking/internet-gateways" element={<InternetGatewaysPage />} />
              <Route path="/networking/nat-gateways" element={<NATGatewaysPage />} />
              <Route path="/networking/elastic-ips" element={<ElasticIPsPage />} />
              <Route path="/networking/security-groups" element={<SecurityGroupsPage />} />
              <Route path="/networking/network-acls" element={<NetworkACLsPage />} />

              {/* Storage */}
              <Route path="/storage/s3" element={<S3Page />} />
              <Route path="/storage/s3/create" element={<S3BucketWizard />} />
              <Route path="/storage/ebs" element={<EBSPage />} />

              {/* Billing & Cost Management */}
              <Route path="/billing" element={<BillingDashboardPage />} />
              <Route path="/billing/bills" element={<BillsPage />} />
              <Route path="/billing/cost-explorer" element={<CostExplorerPage />} />
              <Route path="/billing/budgets" element={<BudgetsPage />} />
              <Route path="/billing/cost-allocation-tags" element={<CostAllocationTagsPage />} />
              <Route path="/billing/payment-methods" element={<PaymentMethodsPage />} />
              <Route path="/billing/credits" element={<CreditsPage />} />

              {/* Monitoring & CloudWatch */}
              <Route path="/monitoring" element={<MonitoringDashboardPage />} />
              <Route path="/monitoring/alarms" element={<AlarmsPage />} />
              <Route path="/monitoring/metrics" element={<MetricsPage />} />
              <Route path="/monitoring/dashboards" element={<DashboardsPage />} />
              <Route path="/monitoring/logs" element={<LogGroupsPage />} />
              <Route path="/monitoring/logs/insights" element={<LogInsightsPage />} />
              <Route path="/monitoring/events" element={<EventsPage />} />
              <Route path="/monitoring/synthetics" element={<SyntheticsPage />} />

              {/* IAM - Identity and Access Management */}
              <Route path="/iam" element={<IAMDashboardPage />} />
              <Route path="/iam/users" element={<UsersPage />} />
              <Route path="/iam/users/:userId" element={<UsersPage />} />
              <Route path="/iam/groups" element={<GroupsPage />} />
              <Route path="/iam/groups/:groupId" element={<GroupsPage />} />
              <Route path="/iam/roles" element={<RolesPage />} />
              <Route path="/iam/roles/:roleId" element={<RolesPage />} />
              <Route path="/iam/policies" element={<PoliciesPage />} />
              <Route path="/iam/policies/:policyId" element={<PoliciesPage />} />
              <Route path="/iam/identity-providers" element={<IdentityProvidersPage />} />
              <Route path="/iam/identity-providers/create" element={<AddIdentityProviderPage />} />
              <Route path="/iam/identity-providers/:providerId" element={<IdentityProvidersPage />} />
              <Route path="/iam/access-analyzer" element={<AccessAnalyzerPage />} />

              {/* Settings */}
              <Route path="/settings/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
