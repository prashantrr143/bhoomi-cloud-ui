import { useState } from 'react';
import {
  ButtonDropdown,
  SpaceBetween,
  Badge,
  Box,
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';

export function AccountSwitcher() {
  const navigate = useNavigate();
  const {
    currentAccount,
    currentOrganization,
    currentRole,
    availableAccounts,
    setCurrentAccount,
    canManageOrganization,
  } = useTenant();
  const [loading, setLoading] = useState(false);

  if (!currentAccount) {
    return null;
  }

  const handleAccountSwitch = (accountId: string) => {
    if (accountId === currentAccount.id) return;
    setLoading(true);
    setCurrentAccount(accountId);
    // Small delay to show loading state
    setTimeout(() => setLoading(false), 300);
  };

  const getRoleBadgeColor = (role: string | null): 'blue' | 'green' | 'grey' | 'red' => {
    switch (role) {
      case 'ORGANIZATION_ADMIN':
        return 'red';
      case 'ACCOUNT_ADMIN':
        return 'blue';
      case 'POWER_USER':
        return 'green';
      default:
        return 'grey';
    }
  };

  const formatRole = (role: string | null): string => {
    if (!role) return 'Unknown';
    return role
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const accountItems = availableAccounts.map((account) => ({
    id: account.id,
    text: account.name,
    description: account.id,
    disabled: account.id === currentAccount.id,
    iconName: account.id === currentAccount.id ? ('status-positive' as const) : undefined,
  }));

  const menuItems = [
    {
      id: 'current-info',
      text: 'Current Account',
      items: [
        {
          id: 'account-details',
          text: currentAccount.name,
          description: `${currentAccount.id} | ${currentOrganization?.id || 'Unknown Org'}`,
          disabled: true,
        },
      ],
    },
    {
      id: 'switch-account',
      text: 'Switch Account',
      items: accountItems,
    },
  ];

  if (canManageOrganization()) {
    menuItems.push({
      id: 'organization',
      text: 'Organization',
      items: [
        {
          id: 'manage-org',
          text: 'Manage Organization',
          description: 'View accounts, OUs, and policies',
          disabled: false,
          iconName: undefined,
        },
      ],
    });
  }

  return (
    <ButtonDropdown
      variant="normal"
      loading={loading}
      items={menuItems}
      onItemClick={({ detail }) => {
        if (detail.id === 'manage-org') {
          navigate('/organization');
        } else if (detail.id !== 'account-details' && detail.id !== 'current-info') {
          handleAccountSwitch(detail.id);
        }
      }}
    >
      <SpaceBetween direction="horizontal" size="xs">
        <Box>
          <SpaceBetween direction="vertical" size="xxxs">
            <Box variant="small" fontWeight="bold">
              {currentAccount.name}
            </Box>
            <Box variant="small" color="text-body-secondary">
              {currentAccount.id}
            </Box>
          </SpaceBetween>
        </Box>
        <Badge color={getRoleBadgeColor(currentRole)}>{formatRole(currentRole)}</Badge>
      </SpaceBetween>
    </ButtonDropdown>
  );
}
