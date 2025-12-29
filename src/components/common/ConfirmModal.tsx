/**
 * Reusable confirmation modal component
 */

import React from 'react';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Alert from '@cloudscape-design/components/alert';

export interface ConfirmModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  header: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: 'warning' | 'error' | 'info';
}

export function ConfirmModal({
  visible,
  onDismiss,
  onConfirm,
  header,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  variant = 'warning',
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={header}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
            >
              {confirmLabel}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Alert type={variant}>{message}</Alert>
    </Modal>
  );
}

export default ConfirmModal;
