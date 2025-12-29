import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Textarea from '@cloudscape-design/components/textarea';
import Tiles from '@cloudscape-design/components/tiles';
import Wizard from '@cloudscape-design/components/wizard';
import type { SupportCaseCategory, SupportCaseSeverity } from '@/types';

const SERVICE_OPTIONS = [
  { value: 'EC2', label: 'EC2 - Elastic Compute Cloud' },
  { value: 'S3', label: 'S3 - Simple Storage Service' },
  { value: 'Lambda', label: 'Lambda - Serverless Compute' },
  { value: 'VPC', label: 'VPC - Virtual Private Cloud' },
  { value: 'IAM', label: 'IAM - Identity and Access Management' },
  { value: 'RDS', label: 'RDS - Relational Database Service' },
  { value: 'EKS', label: 'EKS - Elastic Kubernetes Service' },
  { value: 'ECS', label: 'ECS - Elastic Container Service' },
  { value: 'CloudWatch', label: 'CloudWatch - Monitoring and Observability' },
  { value: 'Billing', label: 'Billing - Account and Billing' },
  { value: 'Other', label: 'Other' },
];

const CATEGORY_OPTIONS: { value: SupportCaseCategory; label: string; description: string }[] = [
  {
    value: 'account-and-billing',
    label: 'Account and billing',
    description: 'Questions about your account, billing, or payments',
  },
  {
    value: 'service-limit-increase',
    label: 'Service limit increase',
    description: 'Request to increase service quotas or limits',
  },
  {
    value: 'technical-support',
    label: 'Technical support',
    description: 'Get help with technical issues or errors',
  },
  {
    value: 'general-guidance',
    label: 'General guidance',
    description: 'Best practices and architectural guidance',
  },
  {
    value: 'security',
    label: 'Security',
    description: 'Security vulnerabilities or concerns',
  },
  {
    value: 'abuse-report',
    label: 'Abuse report',
    description: 'Report abuse or policy violations',
  },
];

const SEVERITY_OPTIONS: { value: SupportCaseSeverity; label: string; description: string }[] = [
  {
    value: 'critical',
    label: 'Critical - Business critical system down',
    description: 'Production system completely down. Business critical application unavailable.',
  },
  {
    value: 'urgent',
    label: 'Urgent - Production system impaired',
    description: 'Important functions of production system impaired.',
  },
  {
    value: 'high',
    label: 'High - Production system impaired',
    description: 'Important functions of production system impaired, workaround available.',
  },
  {
    value: 'normal',
    label: 'Normal - System impaired',
    description: 'Non-critical functions of system impaired.',
  },
  {
    value: 'low',
    label: 'Low - General guidance',
    description: 'General development question or feature request.',
  },
];

export function CreateCasePage() {
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<SupportCaseCategory | ''>('');
  const [service, setService] = useState<{ value: string; label: string } | null>(null);
  const [severity, setSeverity] = useState<SupportCaseSeverity>('normal');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [ccEmails, setCcEmails] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate success
    setIsSubmitting(false);
    navigate('/support/cases', {
      state: { message: 'Support case created successfully' },
    });
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return category !== '';
      case 1:
        return service !== null;
      case 2:
        return subject.trim().length >= 10 && description.trim().length >= 20;
      default:
        return true;
    }
  };

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: 'Support Center', href: '/support' },
          { text: 'Cases', href: '/support/cases' },
          { text: 'Create case', href: '#' },
        ]}
        onFollow={(e) => {
          e.preventDefault();
          navigate(e.detail.href);
        }}
      />

      <Wizard
        i18nStrings={{
          stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
          collapsedStepsLabel: (stepNumber, stepsCount) =>
            `Step ${stepNumber} of ${stepsCount}`,
          skipToButtonLabel: (step) => `Skip to ${step.title}`,
          navigationAriaLabel: 'Steps',
          cancelButton: 'Cancel',
          previousButton: 'Previous',
          nextButton: 'Next',
          submitButton: 'Submit case',
          optional: 'optional',
        }}
        onCancel={() => navigate('/support/cases')}
        onSubmit={handleSubmit}
        onNavigate={({ detail }) => {
          if (detail.requestedStepIndex > activeStepIndex) {
            if (validateStep(activeStepIndex)) {
              setActiveStepIndex(detail.requestedStepIndex);
            }
          } else {
            setActiveStepIndex(detail.requestedStepIndex);
          }
        }}
        activeStepIndex={activeStepIndex}
        isLoadingNextStep={isSubmitting}
        allowSkipTo
        steps={[
          {
            title: 'Select case type',
            description: 'Choose the category that best describes your issue',
            content: (
              <Container header={<Header variant="h2">Case type</Header>}>
                <FormField label="What type of issue are you experiencing?">
                  <Tiles
                    value={category}
                    onChange={({ detail }) =>
                      setCategory(detail.value as SupportCaseCategory)
                    }
                    items={CATEGORY_OPTIONS.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                      description: opt.description,
                    }))}
                    columns={2}
                  />
                </FormField>
              </Container>
            ),
          },
          {
            title: 'Select service',
            description: 'Choose the Bhoomi Cloud service related to your issue',
            content: (
              <Container header={<Header variant="h2">Service</Header>}>
                <SpaceBetween size="l">
                  <FormField
                    label="Which service is this regarding?"
                    description="Select the service most relevant to your issue"
                  >
                    <Select
                      selectedOption={service}
                      onChange={({ detail }) =>
                        setService(detail.selectedOption as { value: string; label: string })
                      }
                      options={SERVICE_OPTIONS}
                      placeholder="Choose a service"
                      filteringType="auto"
                    />
                  </FormField>

                  {category === 'technical-support' && (
                    <FormField
                      label="Severity"
                      description="Select the severity based on the impact to your business"
                    >
                      <RadioGroup
                        value={severity}
                        onChange={({ detail }) =>
                          setSeverity(detail.value as SupportCaseSeverity)
                        }
                        items={SEVERITY_OPTIONS.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                          description: opt.description,
                        }))}
                      />
                    </FormField>
                  )}
                </SpaceBetween>
              </Container>
            ),
          },
          {
            title: 'Describe your issue',
            description: 'Provide details about your issue',
            content: (
              <Container header={<Header variant="h2">Issue details</Header>}>
                <SpaceBetween size="l">
                  <FormField
                    label="Subject"
                    description="Brief summary of your issue (minimum 10 characters)"
                    constraintText={`${subject.length} characters`}
                  >
                    <Input
                      value={subject}
                      onChange={({ detail }) => setSubject(detail.value)}
                      placeholder="Enter a brief subject for your case"
                    />
                  </FormField>

                  <FormField
                    label="Description"
                    description="Provide as much detail as possible (minimum 20 characters)"
                    constraintText={`${description.length} characters`}
                  >
                    <Textarea
                      value={description}
                      onChange={({ detail }) => setDescription(detail.value)}
                      placeholder="Describe your issue in detail. Include:&#10;- What you were trying to do&#10;- What happened instead&#10;- Any error messages received&#10;- Steps to reproduce the issue"
                      rows={8}
                    />
                  </FormField>

                  <FormField
                    label={
                      <span>
                        CC email addresses <i>- optional</i>
                      </span>
                    }
                    description="Additional email addresses to receive case updates"
                  >
                    <Input
                      value={ccEmails}
                      onChange={({ detail }) => setCcEmails(detail.value)}
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </FormField>
                </SpaceBetween>
              </Container>
            ),
          },
          {
            title: 'Review and submit',
            description: 'Review your case details before submitting',
            content: (
              <SpaceBetween size="l">
                {submitError && (
                  <Alert type="error" header="Error creating case">
                    {submitError}
                  </Alert>
                )}

                <Container header={<Header variant="h2">Case summary</Header>}>
                  <SpaceBetween size="l">
                    <Box>
                      <Box variant="awsui-key-label">Category</Box>
                      <Box>
                        {CATEGORY_OPTIONS.find((c) => c.value === category)?.label || '-'}
                      </Box>
                    </Box>
                    <Box>
                      <Box variant="awsui-key-label">Service</Box>
                      <Box>{service?.label || '-'}</Box>
                    </Box>
                    {category === 'technical-support' && (
                      <Box>
                        <Box variant="awsui-key-label">Severity</Box>
                        <Box>
                          {SEVERITY_OPTIONS.find((s) => s.value === severity)?.label || '-'}
                        </Box>
                      </Box>
                    )}
                    <Box>
                      <Box variant="awsui-key-label">Subject</Box>
                      <Box>{subject || '-'}</Box>
                    </Box>
                    <Box>
                      <Box variant="awsui-key-label">Description</Box>
                      <Box>{description || '-'}</Box>
                    </Box>
                    {ccEmails && (
                      <Box>
                        <Box variant="awsui-key-label">CC email addresses</Box>
                        <Box>{ccEmails}</Box>
                      </Box>
                    )}
                  </SpaceBetween>
                </Container>

                <Alert type="info">
                  Based on your support plan (<strong>Business</strong>), you can expect a
                  response within{' '}
                  <strong>
                    {severity === 'critical'
                      ? '15 minutes'
                      : severity === 'urgent'
                      ? '1 hour'
                      : severity === 'high'
                      ? '4 hours'
                      : '12 hours'}
                  </strong>{' '}
                  for this severity level.
                </Alert>
              </SpaceBetween>
            ),
          },
        ]}
      />
    </SpaceBetween>
  );
}
