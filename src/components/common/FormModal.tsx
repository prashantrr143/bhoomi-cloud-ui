/**
 * Reusable form modal wrapper component
 */

import React from 'react';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';

export interface FormModalProps {
  visible: boolean;
  onDismiss: () => void;
  header: string;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  size?: 'small' | 'medium' | 'large' | 'max';
  children: React.ReactNode;
}

export function FormModal({
  visible,
  onDismiss,
  header,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  loading = false,
  submitDisabled = false,
  size = 'medium',
  children,
}: FormModalProps) {
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={header}
      size={size}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
              loading={loading}
              disabled={submitDisabled || loading}
            >
              {submitLabel}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      {children}
    </Modal>
  );
}

export default FormModal;
