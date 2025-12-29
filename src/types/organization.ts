// Organization Feature Set
export type OrganizationFeatureSet = 'ALL' | 'CONSOLIDATED_BILLING';

// Organization Status
export type OrganizationStatus = 'ACTIVE' | 'PENDING_DELETION';

// Account Status
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_CLOSURE';

// Account Join Method
export type AccountJoinMethod = 'CREATED' | 'INVITED';

// OU Status
export type OUStatus = 'ACTIVE' | 'PENDING_DELETION';

// Policy Type
export type PolicyType =
  | 'SERVICE_CONTROL_POLICY'
  | 'TAG_POLICY'
  | 'BACKUP_POLICY'
  | 'AI_SERVICES_OPT_OUT_POLICY';

// Policy Type Summary
export interface PolicyTypeSummary {
  type: PolicyType;
  status: 'ENABLED' | 'PENDING_ENABLE' | 'PENDING_DISABLE';
}

// Organization
export interface Organization {
  id: string; // o-xxxxxxxxxx
  arn: string;
  masterAccountId: string;
  masterAccountArn: string;
  masterAccountEmail: string;
  featureSet: OrganizationFeatureSet;
  availablePolicyTypes: PolicyTypeSummary[];
  status: OrganizationStatus;
  createdAt: string;
}

// Organization Root
export interface OrganizationRoot {
  id: string; // r-xxxx
  arn: string;
  name: string;
  policyTypes: PolicyTypeSummary[];
}

// Organizational Unit
export interface OrganizationalUnit {
  id: string; // ou-xxxx-xxxxxxxx
  arn: string;
  name: string;
  parentId: string; // Root or OU ID (r-xxxx or ou-xxxx-xxxxxxxx)
  status: OUStatus;
  createdAt: string;
}

// Account
export interface Account {
  id: string; // 12-digit account ID
  arn: string;
  name: string;
  email: string;
  status: AccountStatus;
  joinedMethod: AccountJoinMethod;
  joinedTimestamp: string;
  organizationId: string;
  parentId: string; // OU ID or Root ID
  tags: Record<string, string>;
}

// Account Role
export type AccountRole =
  | 'ORGANIZATION_ADMIN'
  | 'ACCOUNT_ADMIN'
  | 'POWER_USER'
  | 'DEVELOPER'
  | 'READ_ONLY'
  | 'BILLING_ADMIN';

// Permission
export interface Permission {
  id: string;
  name: string;
  description: string;
  actions: string[];
  resources: string[];
  effect: 'Allow' | 'Deny';
}

// Account Member (for user-account associations)
export interface AccountMember {
  id: string;
  userId: string;
  accountId: string;
  role: AccountRole;
  permissions: Permission[];
  isDefault: boolean;
  addedAt: string;
  addedBy: string;
}

// Service Control Policy
export interface ServiceControlPolicy {
  id: string;
  arn: string;
  name: string;
  description: string;
  type: 'SERVICE_CONTROL_POLICY';
  awsManaged: boolean;
  content: string; // JSON policy document
  createdAt: string;
  updatedAt: string;
}

// Policy Attachment
export interface PolicyAttachment {
  policyId: string;
  targetId: string; // Root, OU, or Account ID
  targetType: 'ROOT' | 'ORGANIZATIONAL_UNIT' | 'ACCOUNT';
}

// Handshake for account invitations
export interface Handshake {
  id: string;
  arn: string;
  parties: HandshakeParty[];
  state: 'REQUESTED' | 'OPEN' | 'CANCELED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  requestedTimestamp: string;
  expirationTimestamp: string;
  action: 'INVITE' | 'ENABLE_ALL_FEATURES' | 'APPROVE_ALL_FEATURES';
}

export interface HandshakeParty {
  id: string;
  type: 'ACCOUNT' | 'ORGANIZATION' | 'EMAIL';
}

// Create Account Request
export interface CreateAccountRequest {
  accountName: string;
  email: string;
  roleName?: string;
  iamUserAccessToBilling?: 'ALLOW' | 'DENY';
  tags?: Record<string, string>;
}

// Create Account Status
export interface CreateAccountStatus {
  id: string;
  accountName: string;
  state: 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  requestedTimestamp: string;
  completedTimestamp?: string;
  accountId?: string;
  failureReason?: string;
}

// Delegated Administrator
export interface DelegatedAdministrator {
  accountId: string;
  arn: string;
  email: string;
  name: string;
  status: AccountStatus;
  joinedMethod: AccountJoinMethod;
  joinedTimestamp: string;
  delegationEnabledDate: string;
}

// Delegated Service
export interface DelegatedService {
  servicePrincipal: string;
  delegationEnabledDate: string;
}
