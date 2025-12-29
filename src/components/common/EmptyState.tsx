import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box textAlign="center" color="inherit">
      <SpaceBetween size="m">
        <Box variant="strong" fontSize="heading-m">
          {title}
        </Box>
        <Box variant="p" color="text-body-secondary">
          {description}
        </Box>
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </SpaceBetween>
    </Box>
  );
}
