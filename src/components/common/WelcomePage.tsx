import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Icon from '@cloudscape-design/components/icon';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { ReactNode } from 'react';

interface Feature {
  title: string;
  description: string;
}

interface WelcomePageProps {
  title: string;
  subtitle: string;
  description: string;
  features: Feature[];
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  learnMoreLinks?: Array<{
    text: string;
    href: string;
  }>;
  icon?: ReactNode;
}

export function WelcomePage({
  title,
  subtitle,
  description,
  features,
  primaryAction,
  secondaryAction,
  learnMoreLinks,
  icon,
}: WelcomePageProps) {
  return (
    <SpaceBetween size="xl">
      {/* Hero Section */}
      <Container>
        <SpaceBetween size="l">
          <Box textAlign="center" padding={{ top: 'xl', bottom: 'l' }}>
            {icon && (
              <Box margin={{ bottom: 'm' }}>
                {icon}
              </Box>
            )}
            <Box variant="h1" fontSize="display-l" fontWeight="bold">
              {title}
            </Box>
            <Box variant="p" color="text-body-secondary" fontSize="heading-m" margin={{ top: 's' }}>
              {subtitle}
            </Box>
          </Box>

          <Box textAlign="center" padding={{ horizontal: 'xxxl' }}>
            <Box variant="p" color="text-body-secondary" fontSize="body-m">
              {description}
            </Box>
          </Box>

          <Box textAlign="center" padding={{ bottom: 'l' }}>
            <SpaceBetween size="s" direction="horizontal" alignItems="center">
              <Box margin={{ right: 's' }}>
                <Button variant="primary" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              </Box>
              {secondaryAction && (
                <Button variant="normal" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )}
            </SpaceBetween>
          </Box>
        </SpaceBetween>
      </Container>

      {/* Features Section */}
      <Container header={<Header variant="h2">Key features</Header>}>
        <ColumnLayout columns={features.length <= 3 ? features.length : 3} variant="text-grid">
          {features.map((feature, index) => (
            <SpaceBetween size="xs" key={index}>
              <Box variant="h3">
                <SpaceBetween size="xs" direction="horizontal" alignItems="center">
                  <Icon name="status-positive" variant="success" />
                  {feature.title}
                </SpaceBetween>
              </Box>
              <Box variant="p" color="text-body-secondary">
                {feature.description}
              </Box>
            </SpaceBetween>
          ))}
        </ColumnLayout>
      </Container>

      {/* Learn More Section */}
      {learnMoreLinks && learnMoreLinks.length > 0 && (
        <Container header={<Header variant="h2">Learn more</Header>}>
          <SpaceBetween size="s">
            {learnMoreLinks.map((link, index) => (
              <Box key={index}>
                <Link href={link.href} external>
                  {link.text}
                </Link>
              </Box>
            ))}
          </SpaceBetween>
        </Container>
      )}
    </SpaceBetween>
  );
}
