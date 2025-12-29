import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { bhoomiLogoDataUrl } from '@/components/common';

export function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    currentAccount,
    availableAccounts,
    setCurrentAccount,
    currentRole,
    canManageOrganization,
  } = useTenant();

  const formatRole = useCallback((role: string | null): string => {
    if (!role) return 'Unknown';
    return role
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  const handleUserMenuClick = useCallback(
    (itemId: string) => {
      switch (itemId) {
        case 'signout':
          logout();
          navigate('/login');
          break;
        case 'manage-organization':
          navigate('/organization');
          break;
        case 'profile':
        case 'preferences':
        case 'security':
          navigate('/settings/profile');
          break;
        default:
          // Check if it's an account switch
          if (itemId.startsWith('switch-')) {
            const accountId = itemId.replace('switch-', '');
            setCurrentAccount(accountId);
          }
          break;
      }
    },
    [logout, navigate, setCurrentAccount]
  );

  // Memoize account switch menu items
  const accountSwitchItems = useMemo(
    () =>
      availableAccounts.map((account) => ({
        id: `switch-${account.id}`,
        text: account.name,
        description: account.id,
        disabled: account.id === currentAccount?.id,
      })),
    [availableAccounts, currentAccount?.id]
  );

  // Memoize the onItemClick handler
  const handleAccountMenuClick = useCallback(
    ({ detail }: { detail: { id: string } }) => handleUserMenuClick(detail.id),
    [handleUserMenuClick]
  );

  // Memoize utilities array to prevent re-renders
  const utilities = useMemo(
    () => [
      {
        type: 'menu-dropdown' as const,
        text: currentAccount?.name || 'Select Account',
        description: currentAccount
          ? `${currentAccount.id} | ${formatRole(currentRole)}`
          : undefined,
        iconName: 'share' as const,
        ariaLabel: 'Account switcher',
        items: [
          {
            id: 'current-account',
            text: 'Current Account',
            items: [
              {
                id: 'account-info',
                text: currentAccount?.name || 'No account selected',
                description: currentAccount?.id,
                disabled: true,
              },
            ],
          },
          ...(availableAccounts.length > 1
            ? [
                {
                  id: 'switch-accounts',
                  text: 'Switch Account',
                  items: accountSwitchItems,
                },
              ]
            : []),
        ],
        onItemClick: handleAccountMenuClick,
      },
      {
        type: 'button' as const,
        iconName: 'notification' as const,
        ariaLabel: 'Notifications',
        badge: true,
        disableUtilityCollapse: false,
      },
      {
        type: 'button' as const,
        iconName: 'settings' as const,
        ariaLabel: 'Settings',
        disableUtilityCollapse: false,
      },
      {
        type: 'menu-dropdown' as const,
        iconName: 'user-profile' as const,
        ariaLabel: 'User settings',
        title: user?.name || 'User',
        description: user?.email,
        items: [
          { id: 'profile', text: 'Profile' },
          { id: 'preferences', text: 'Preferences' },
          { id: 'security', text: 'Security' },
          ...(canManageOrganization()
            ? [
                {
                  id: 'organization',
                  text: 'Organization',
                  items: [{ id: 'manage-organization', text: 'Manage Organization' }],
                },
              ]
            : []),
          { id: 'signout', text: 'Sign out' },
        ],
        onItemClick: handleAccountMenuClick,
      },
    ],
    [
      currentAccount,
      currentRole,
      formatRole,
      availableAccounts.length,
      accountSwitchItems,
      handleAccountMenuClick,
      user?.name,
      user?.email,
      canManageOrganization,
    ]
  );

  return (
    <TopNavigation
      identity={{
        href: '/console',
        title: 'Bhoomi Cloud',
        logo: {
          src: bhoomiLogoDataUrl,
          alt: 'Bhoomi Cloud',
        },
      }}
      utilities={utilities}
    />
  );
}
