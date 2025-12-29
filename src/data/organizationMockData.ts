import type {
  Organization,
  OrganizationalUnit,
  OrganizationRoot,
  Account,
  AccountMember,
  AccountRole,
  Permission,
  ServiceControlPolicy,
} from '@/types/organization';

// Organizations
export const organizations: Organization[] = [
  {
    id: 'o-bhoomi001',
    arn: 'arn:bhoomi:organizations::123456789012:organization/o-bhoomi001',
    masterAccountId: '123456789012',
    masterAccountArn: 'arn:bhoomi:organizations::123456789012:account/o-bhoomi001/123456789012',
    masterAccountEmail: 'master@bhoomi.cloud',
    featureSet: 'ALL',
    availablePolicyTypes: [
      { type: 'SERVICE_CONTROL_POLICY', status: 'ENABLED' },
      { type: 'TAG_POLICY', status: 'ENABLED' },
    ],
    status: 'ACTIVE',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'o-partner001',
    arn: 'arn:bhoomi:organizations::999888777666:organization/o-partner001',
    masterAccountId: '999888777666',
    masterAccountArn: 'arn:bhoomi:organizations::999888777666:account/o-partner001/999888777666',
    masterAccountEmail: 'admin@partner.example.com',
    featureSet: 'CONSOLIDATED_BILLING',
    availablePolicyTypes: [],
    status: 'ACTIVE',
    createdAt: '2024-01-15T00:00:00Z',
  },
];

// Organization Roots
export const organizationRoots: OrganizationRoot[] = [
  {
    id: 'r-bhoomi',
    arn: 'arn:bhoomi:organizations::123456789012:root/o-bhoomi001/r-bhoomi',
    name: 'Root',
    policyTypes: [
      { type: 'SERVICE_CONTROL_POLICY', status: 'ENABLED' },
      { type: 'TAG_POLICY', status: 'ENABLED' },
    ],
  },
  {
    id: 'r-partner',
    arn: 'arn:bhoomi:organizations::999888777666:root/o-partner001/r-partner',
    name: 'Root',
    policyTypes: [],
  },
];

// Organizational Units
export const organizationalUnits: OrganizationalUnit[] = [
  // Bhoomi Org OUs
  {
    id: 'ou-bhoomi-prod',
    arn: 'arn:bhoomi:organizations::123456789012:ou/o-bhoomi001/ou-bhoomi-prod',
    name: 'Production',
    parentId: 'r-bhoomi',
    status: 'ACTIVE',
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 'ou-bhoomi-dev',
    arn: 'arn:bhoomi:organizations::123456789012:ou/o-bhoomi001/ou-bhoomi-dev',
    name: 'Development',
    parentId: 'r-bhoomi',
    status: 'ACTIVE',
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 'ou-bhoomi-sandbox',
    arn: 'arn:bhoomi:organizations::123456789012:ou/o-bhoomi001/ou-bhoomi-sandbox',
    name: 'Sandbox',
    parentId: 'ou-bhoomi-dev',
    status: 'ACTIVE',
    createdAt: '2023-06-01T00:00:00Z',
  },
  // Partner Org OUs
  {
    id: 'ou-partner-workloads',
    arn: 'arn:bhoomi:organizations::999888777666:ou/o-partner001/ou-partner-workloads',
    name: 'Workloads',
    parentId: 'r-partner',
    status: 'ACTIVE',
    createdAt: '2024-02-01T00:00:00Z',
  },
];

// Accounts
export const accounts: Account[] = [
  // Bhoomi Organization Accounts
  {
    id: '123456789012',
    arn: 'arn:bhoomi:organizations::123456789012:account/o-bhoomi001/123456789012',
    name: 'Bhoomi Master Account',
    email: 'master@bhoomi.cloud',
    status: 'ACTIVE',
    joinedMethod: 'CREATED',
    joinedTimestamp: '2023-01-01T00:00:00Z',
    organizationId: 'o-bhoomi001',
    parentId: 'r-bhoomi',
    tags: { Environment: 'management', CostCenter: 'CC-MGMT' },
  },
  {
    id: '234567890123',
    arn: 'arn:bhoomi:organizations::123456789012:account/o-bhoomi001/234567890123',
    name: 'Production Workloads',
    email: 'prod@bhoomi.cloud',
    status: 'ACTIVE',
    joinedMethod: 'CREATED',
    joinedTimestamp: '2023-02-01T00:00:00Z',
    organizationId: 'o-bhoomi001',
    parentId: 'ou-bhoomi-prod',
    tags: { Environment: 'production', CostCenter: 'CC-PROD' },
  },
  {
    id: '345678901234',
    arn: 'arn:bhoomi:organizations::123456789012:account/o-bhoomi001/345678901234',
    name: 'Development',
    email: 'dev@bhoomi.cloud',
    status: 'ACTIVE',
    joinedMethod: 'CREATED',
    joinedTimestamp: '2023-02-15T00:00:00Z',
    organizationId: 'o-bhoomi001',
    parentId: 'ou-bhoomi-dev',
    tags: { Environment: 'development', CostCenter: 'CC-DEV' },
  },
  {
    id: '456789012345',
    arn: 'arn:bhoomi:organizations::123456789012:account/o-bhoomi001/456789012345',
    name: 'Sandbox',
    email: 'sandbox@bhoomi.cloud',
    status: 'ACTIVE',
    joinedMethod: 'INVITED',
    joinedTimestamp: '2023-06-15T00:00:00Z',
    organizationId: 'o-bhoomi001',
    parentId: 'ou-bhoomi-sandbox',
    tags: { Environment: 'sandbox', CostCenter: 'CC-DEV' },
  },
  // Partner Organization Accounts
  {
    id: '999888777666',
    arn: 'arn:bhoomi:organizations::999888777666:account/o-partner001/999888777666',
    name: 'Partner Master',
    email: 'admin@partner.example.com',
    status: 'ACTIVE',
    joinedMethod: 'CREATED',
    joinedTimestamp: '2024-01-15T00:00:00Z',
    organizationId: 'o-partner001',
    parentId: 'r-partner',
    tags: { Environment: 'management' },
  },
  {
    id: '888777666555',
    arn: 'arn:bhoomi:organizations::999888777666:account/o-partner001/888777666555',
    name: 'Partner Workloads',
    email: 'workloads@partner.example.com',
    status: 'ACTIVE',
    joinedMethod: 'CREATED',
    joinedTimestamp: '2024-02-01T00:00:00Z',
    organizationId: 'o-partner001',
    parentId: 'ou-partner-workloads',
    tags: { Environment: 'production' },
  },
];

// Default Permissions by Role
export const defaultPermissions: Record<AccountRole, Permission[]> = {
  ORGANIZATION_ADMIN: [
    {
      id: 'perm-org-admin',
      name: 'OrganizationFullAccess',
      description: 'Full access to organization management',
      actions: ['*'],
      resources: ['*'],
      effect: 'Allow',
    },
  ],
  ACCOUNT_ADMIN: [
    {
      id: 'perm-account-admin',
      name: 'AccountFullAccess',
      description: 'Full access within account',
      actions: ['*'],
      resources: ['*'],
      effect: 'Allow',
    },
  ],
  POWER_USER: [
    {
      id: 'perm-power-user',
      name: 'PowerUserAccess',
      description: 'Full access except IAM and Organization',
      actions: ['ec2:*', 's3:*', 'lambda:*', 'ecs:*', 'eks:*', 'cloudwatch:*', 'logs:*'],
      resources: ['*'],
      effect: 'Allow',
    },
  ],
  DEVELOPER: [
    {
      id: 'perm-developer',
      name: 'DeveloperAccess',
      description: 'Development resource access',
      actions: [
        'ec2:Describe*',
        'ec2:Start*',
        'ec2:Stop*',
        'ec2:Reboot*',
        's3:*',
        'lambda:*',
        'logs:*',
        'cloudwatch:Get*',
        'cloudwatch:List*',
      ],
      resources: ['*'],
      effect: 'Allow',
    },
  ],
  READ_ONLY: [
    {
      id: 'perm-readonly',
      name: 'ReadOnlyAccess',
      description: 'Read-only access to all resources',
      actions: ['*:Describe*', '*:List*', '*:Get*'],
      resources: ['*'],
      effect: 'Allow',
    },
  ],
  BILLING_ADMIN: [
    {
      id: 'perm-billing',
      name: 'BillingFullAccess',
      description: 'Full access to billing',
      actions: ['billing:*', 'budgets:*', 'cost-explorer:*', 'ce:*'],
      resources: ['*'],
      effect: 'Allow',
    },
  ],
};

// Account Members (User-Account associations)
export const accountMembers: AccountMember[] = [
  // Org Admin user (user-001) has access to all Bhoomi accounts
  {
    id: 'member-001',
    userId: 'user-001',
    accountId: '123456789012',
    role: 'ORGANIZATION_ADMIN',
    permissions: defaultPermissions.ORGANIZATION_ADMIN,
    isDefault: true,
    addedAt: '2023-01-01T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'member-002',
    userId: 'user-001',
    accountId: '234567890123',
    role: 'ACCOUNT_ADMIN',
    permissions: defaultPermissions.ACCOUNT_ADMIN,
    isDefault: false,
    addedAt: '2023-02-01T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'member-003',
    userId: 'user-001',
    accountId: '345678901234',
    role: 'ACCOUNT_ADMIN',
    permissions: defaultPermissions.ACCOUNT_ADMIN,
    isDefault: false,
    addedAt: '2023-02-15T00:00:00Z',
    addedBy: 'system',
  },
  {
    id: 'member-004',
    userId: 'user-001',
    accountId: '456789012345',
    role: 'ACCOUNT_ADMIN',
    permissions: defaultPermissions.ACCOUNT_ADMIN,
    isDefault: false,
    addedAt: '2023-06-15T00:00:00Z',
    addedBy: 'system',
  },
  // Developer user (user-002) has access to Dev + Sandbox only
  {
    id: 'member-005',
    userId: 'user-002',
    accountId: '345678901234',
    role: 'DEVELOPER',
    permissions: defaultPermissions.DEVELOPER,
    isDefault: true,
    addedAt: '2023-03-01T00:00:00Z',
    addedBy: 'user-001',
  },
  {
    id: 'member-006',
    userId: 'user-002',
    accountId: '456789012345',
    role: 'POWER_USER',
    permissions: defaultPermissions.POWER_USER,
    isDefault: false,
    addedAt: '2023-06-20T00:00:00Z',
    addedBy: 'user-001',
  },
];

// Service Control Policies
export const serviceControlPolicies: ServiceControlPolicy[] = [
  {
    id: 'p-FullAWSAccess',
    arn: 'arn:bhoomi:organizations::bhoomi:policy/service_control_policy/p-FullAWSAccess',
    name: 'FullBhoomiAccess',
    description: 'Allows access to every operation',
    type: 'SERVICE_CONTROL_POLICY',
    awsManaged: true,
    content: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: '*',
          Resource: '*',
        },
      ],
    }),
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'p-DenyDeleteS3',
    arn: 'arn:bhoomi:organizations::123456789012:policy/service_control_policy/p-DenyDeleteS3',
    name: 'DenyS3BucketDeletion',
    description: 'Prevents deletion of S3 buckets',
    type: 'SERVICE_CONTROL_POLICY',
    awsManaged: false,
    content: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Deny',
          Action: ['s3:DeleteBucket', 's3:DeleteObject'],
          Resource: '*',
        },
      ],
    }),
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-03-01T00:00:00Z',
  },
  {
    id: 'p-RequireIMDSv2',
    arn: 'arn:bhoomi:organizations::123456789012:policy/service_control_policy/p-RequireIMDSv2',
    name: 'RequireIMDSv2',
    description: 'Requires IMDSv2 for EC2 instances',
    type: 'SERVICE_CONTROL_POLICY',
    awsManaged: false,
    content: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Deny',
          Action: 'ec2:RunInstances',
          Resource: 'arn:bhoomi:ec2:*:*:instance/*',
          Condition: {
            StringNotEquals: {
              'ec2:MetadataHttpTokens': 'required',
            },
          },
        },
      ],
    }),
    createdAt: '2023-04-15T00:00:00Z',
    updatedAt: '2023-04-15T00:00:00Z',
  },
];

// Helper functions
export function getAccountsByOrganization(organizationId: string): Account[] {
  return accounts.filter((a) => a.organizationId === organizationId);
}

export function getAccountsByOU(ouId: string): Account[] {
  return accounts.filter((a) => a.parentId === ouId);
}

export function getChildOUs(parentId: string): OrganizationalUnit[] {
  return organizationalUnits.filter((ou) => ou.parentId === parentId);
}

export function getOrganizationById(id: string): Organization | undefined {
  return organizations.find((o) => o.id === id);
}

export function getAccountById(id: string): Account | undefined {
  return accounts.find((a) => a.id === id);
}

export function getUserAccounts(userId: string): Account[] {
  const userMemberships = accountMembers.filter((m) => m.userId === userId);
  return userMemberships
    .map((m) => accounts.find((a) => a.id === m.accountId))
    .filter((a): a is Account => a !== undefined);
}

export function getUserMembership(userId: string, accountId: string): AccountMember | undefined {
  return accountMembers.find((m) => m.userId === userId && m.accountId === accountId);
}

export function getDefaultAccount(userId: string): Account | undefined {
  const defaultMembership = accountMembers.find((m) => m.userId === userId && m.isDefault);
  if (defaultMembership) {
    return accounts.find((a) => a.id === defaultMembership.accountId);
  }
  // Fall back to first account
  const firstMembership = accountMembers.find((m) => m.userId === userId);
  if (firstMembership) {
    return accounts.find((a) => a.id === firstMembership.accountId);
  }
  return undefined;
}
