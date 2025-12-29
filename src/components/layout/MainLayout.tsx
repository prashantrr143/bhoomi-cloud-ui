import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout';
import Flashbar from '@cloudscape-design/components/flashbar';
import { Navigation } from './Navigation';
import { TopBar } from './TopBar';
import { useNotifications } from '@/hooks/useNotifications';

export function MainLayout() {
  const [navigationOpen, setNavigationOpen] = useState(true);
  const { notifications } = useNotifications();

  return (
    <>
      <TopBar />
      <AppLayout
        navigation={<Navigation />}
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        notifications={<Flashbar items={notifications} />}
        toolsHide={true}
        content={<Outlet />}
        headerSelector="#top-nav"
      />
    </>
  );
}
