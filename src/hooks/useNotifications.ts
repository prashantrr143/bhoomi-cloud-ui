import { useState, useCallback } from 'react';
import type { FlashbarProps } from '@cloudscape-design/components/flashbar';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  type: NotificationType;
  content: string;
  dismissible?: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<FlashbarProps.MessageDefinition[]>([]);

  const addNotification = useCallback(({ type, content, dismissible = true }: Notification) => {
    const id = `notification-${Date.now()}`;
    setNotifications((prev) => [
      ...prev,
      {
        id,
        type,
        content,
        dismissible,
        onDismiss: () => {
          setNotifications((current) => current.filter((n) => n.id !== id));
        },
      },
    ]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    clearNotifications,
  };
}
