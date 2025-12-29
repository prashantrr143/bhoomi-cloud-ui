import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Wizard from '@cloudscape-design/components/wizard';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Box from '@cloudscape-design/components/box';
import Checkbox from '@cloudscape-design/components/checkbox';
import Toggle from '@cloudscape-design/components/toggle';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import RadioGroup from '@cloudscape-design/components/radio-group';
import AttributeEditor from '@cloudscape-design/components/attribute-editor';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import { useTenant } from '@/contexts/TenantContext';
import { s3Buckets } from '@/data/mockData';
import type {
  S3Bucket,
  S3BlockPublicAccess,
  S3EncryptionType,
  S3StorageClass,
} from '@/types';

interface BucketConfig {
  name: string;
  region: string;
  objectOwnership: 'BucketOwnerEnforced' | 'BucketOwnerPreferred' | 'ObjectWriter';
  blockPublicAccess: S3BlockPublicAccess;
  versioning: boolean;
  encryptionType: S3EncryptionType;
  kmsKeyId: string;
  bucketKeyEnabled: boolean;
  objectLockEnabled: boolean;
  tags: { key: string; value: string }[];
}

const initialConfig: BucketConfig = {
  name: '',
  region: 'us-east-1',
  objectOwnership: 'BucketOwnerEnforced',
  blockPublicAccess: {
    blockPublicAcls: true,
    ignorePublicAcls: true,
    blockPublicPolicy: true,
    restrictPublicBuckets: true,
  },
  versioning: false,
  encryptionType: 'SSE-S3',
  kmsKeyId: '',
  bucketKeyEnabled: true,
  objectLockEnabled: false,
  tags: [],
};

const regionOptions = [
  { value: 'us-east-1', label: 'US East (N. Virginia) - us-east-1' },
  { value: 'us-east-2', label: 'US East (Ohio) - us-east-2' },
  { value: 'us-west-1', label: 'US West (N. California) - us-west-1' },
  { value: 'us-west-2', label: 'US West (Oregon) - us-west-2' },
  { value: 'eu-west-1', label: 'Europe (Ireland) - eu-west-1' },
  { value: 'eu-west-2', label: 'Europe (London) - eu-west-2' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt) - eu-central-1' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai) - ap-south-1' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore) - ap-southeast-1' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney) - ap-southeast-2' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo) - ap-northeast-1' },
];

const kmsKeyOptions = [
  { value: '', label: 'Choose a key' },
  { value: 'alias/aws/s3', label: 'alias/aws/s3 (Default)' },
  { value: 'alias/bhoomi-s3-key', label: 'alias/bhoomi-s3-key' },
  { value: 'alias/bhoomi-backup-key', label: 'alias/bhoomi-backup-key' },
];

// Bucket name validation
function validateBucketName(name: string): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: 'Bucket name is required' };
  }
  if (name.length < 3 || name.length > 63) {
    return { valid: false, error: 'Bucket name must be between 3 and 63 characters' };
  }
  if (!/^[a-z0-9]/.test(name)) {
    return { valid: false, error: 'Bucket name must start with a lowercase letter or number' };
  }
  if (!/[a-z0-9]$/.test(name)) {
    return { valid: false, error: 'Bucket name must end with a lowercase letter or number' };
  }
  if (!/^[a-z0-9.-]+$/.test(name)) {
    return { valid: false, error: 'Bucket name can only contain lowercase letters, numbers, hyphens, and periods' };
  }
  if (/\.\./.test(name)) {
    return { valid: false, error: 'Bucket name cannot contain consecutive periods' };
  }
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(name)) {
    return { valid: false, error: 'Bucket name cannot be formatted as an IP address' };
  }
  // Check for existing bucket
  if (s3Buckets.some((b) => b.name === name)) {
    return { valid: false, error: 'A bucket with this name already exists' };
  }
  return { valid: true };
}

export function S3BucketWizard() {
  const navigate = useNavigate();
  const { currentAccount } = useTenant();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [config, setConfig] = useState<BucketConfig>(initialConfig);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bucketNameValidation = useMemo(() => validateBucketName(config.name), [config.name]);

  const allPublicAccessBlocked = useMemo(() => {
    const { blockPublicAccess } = config;
    return (
      blockPublicAccess.blockPublicAcls &&
      blockPublicAccess.ignorePublicAcls &&
      blockPublicAccess.blockPublicPolicy &&
      blockPublicAccess.restrictPublicBuckets
    );
  }, [config.blockPublicAccess]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create the new bucket object
    const newBucket: S3Bucket = {
      name: config.name,
      arn: `arn:bhoomi:s3:::${config.name}`,
      region: config.region,
      createdAt: new Date().toISOString(),
      access: allPublicAccessBlocked ? 'Bucket and objects not public' : 'Private',
      size: '0 B',
      objects: 0,
      accountId: currentAccount?.id || '',
      blockPublicAccess: config.blockPublicAccess,
      versioning: { enabled: config.versioning },
      encryption: {
        type: config.encryptionType,
        kmsKeyId: config.encryptionType === 'SSE-KMS' ? config.kmsKeyId : undefined,
        bucketKeyEnabled: config.bucketKeyEnabled,
      },
      tags: config.tags.reduce(
        (acc, tag) => ({ ...acc, [tag.key]: tag.value }),
        {} as Record<string, string>
      ),
      objectLockEnabled: config.objectLockEnabled,
      defaultStorageClass: 'STANDARD',
    };

    console.log('Created bucket:', newBucket);
    setIsSubmitting(false);
    navigate('/storage/s3');
  };

  const handleCancel = () => {
    navigate('/storage/s3');
  };

  // Step 1: General Configuration
  const generalConfigStep = (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">General configuration</Header>}>
        <SpaceBetween size="l">
          <FormField
            label="Bucket name"
            description="Bucket names must be unique across all existing bucket names in Bhoomi Cloud. After you create a bucket, you cannot change its name."
            errorText={config.name && !bucketNameValidation.valid ? bucketNameValidation.error : undefined}
            constraintText="Must be 3-63 characters, lowercase letters, numbers, hyphens, and periods only."
          >
            <Input
              value={config.name}
              onChange={({ detail }) => setConfig({ ...config, name: detail.value.toLowerCase() })}
              placeholder="my-bucket-name"
            />
          </FormField>

          <FormField
            label="Region"
            description="Choose the region where you want the bucket to reside. Choosing a region close to you can reduce latency and costs."
          >
            <Select
              selectedOption={regionOptions.find((r) => r.value === config.region) || null}
              options={regionOptions}
              onChange={({ detail }) =>
                setConfig({ ...config, region: detail.selectedOption.value || 'us-east-1' })
              }
            />
          </FormField>
        </SpaceBetween>
      </Container>

      <Container header={<Header variant="h2">Object Ownership</Header>}>
        <SpaceBetween size="m">
          <Alert type="info">
            Object Ownership determines who can specify access to objects. ACLs are disabled when
            "Bucket owner enforced" is selected (recommended).
          </Alert>
          <RadioGroup
            value={config.objectOwnership}
            onChange={({ detail }) =>
              setConfig({ ...config, objectOwnership: detail.value as BucketConfig['objectOwnership'] })
            }
            items={[
              {
                value: 'BucketOwnerEnforced',
                label: 'ACLs disabled (recommended)',
                description:
                  'All objects in this bucket are owned by this account. Access is specified using only policies.',
              },
              {
                value: 'BucketOwnerPreferred',
                label: 'ACLs enabled - Bucket owner preferred',
                description:
                  'The bucket owner owns objects written by other accounts if uploaded with bucket-owner-full-control ACL.',
              },
              {
                value: 'ObjectWriter',
                label: 'ACLs enabled - Object writer',
                description: 'The uploading account owns objects that it writes to this bucket.',
              },
            ]}
          />
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );

  // Step 2: Block Public Access
  const publicAccessStep = (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h2"
            description="Block public access to buckets and objects granted through new access control lists (ACLs), any access control lists (ACLs), new public bucket or access point policies, or any public bucket or access point policies."
          >
            Block Public Access settings for this bucket
          </Header>
        }
      >
        <SpaceBetween size="m">
          <Alert type="warning">
            Turning off block all public access might result in this bucket and the objects within
            becoming public.
          </Alert>

          <Checkbox
            checked={allPublicAccessBlocked}
            onChange={({ detail }) => {
              const allBlocked = detail.checked;
              setConfig({
                ...config,
                blockPublicAccess: {
                  blockPublicAcls: allBlocked,
                  ignorePublicAcls: allBlocked,
                  blockPublicPolicy: allBlocked,
                  restrictPublicBuckets: allBlocked,
                },
              });
            }}
          >
            <Box fontWeight="bold">Block all public access</Box>
          </Checkbox>

          <SpaceBetween size="s">
            <Box margin={{ left: 'l' }}>
              <Checkbox
                checked={config.blockPublicAccess.blockPublicAcls}
                onChange={({ detail }) =>
                  setConfig({
                    ...config,
                    blockPublicAccess: { ...config.blockPublicAccess, blockPublicAcls: detail.checked },
                  })
                }
              >
                Block public access to buckets and objects granted through new access control lists (ACLs)
              </Checkbox>
            </Box>
            <Box margin={{ left: 'l' }}>
              <Checkbox
                checked={config.blockPublicAccess.ignorePublicAcls}
                onChange={({ detail }) =>
                  setConfig({
                    ...config,
                    blockPublicAccess: { ...config.blockPublicAccess, ignorePublicAcls: detail.checked },
                  })
                }
              >
                Block public access to buckets and objects granted through any access control lists (ACLs)
              </Checkbox>
            </Box>
            <Box margin={{ left: 'l' }}>
              <Checkbox
                checked={config.blockPublicAccess.blockPublicPolicy}
                onChange={({ detail }) =>
                  setConfig({
                    ...config,
                    blockPublicAccess: { ...config.blockPublicAccess, blockPublicPolicy: detail.checked },
                  })
                }
              >
                Block public access to buckets and objects granted through new public bucket or access point policies
              </Checkbox>
            </Box>
            <Box margin={{ left: 'l' }}>
              <Checkbox
                checked={config.blockPublicAccess.restrictPublicBuckets}
                onChange={({ detail }) =>
                  setConfig({
                    ...config,
                    blockPublicAccess: { ...config.blockPublicAccess, restrictPublicBuckets: detail.checked },
                  })
                }
              >
                Block public and cross-account access to buckets and objects through any public bucket or access point policies
              </Checkbox>
            </Box>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );

  // Step 3: Bucket Versioning & Encryption
  const versioningEncryptionStep = (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">Bucket Versioning</Header>}>
        <SpaceBetween size="m">
          <Box color="text-body-secondary">
            Versioning is a means of keeping multiple variants of an object in the same bucket. You
            can use versioning to preserve, retrieve, and restore every version of every object
            stored in your bucket.
          </Box>
          <Toggle
            checked={config.versioning}
            onChange={({ detail }) => setConfig({ ...config, versioning: detail.checked })}
          >
            Enable versioning
          </Toggle>
        </SpaceBetween>
      </Container>

      <Container header={<Header variant="h2">Default encryption</Header>}>
        <SpaceBetween size="l">
          <FormField
            label="Encryption type"
            description="Server-side encryption protects data at rest."
          >
            <RadioGroup
              value={config.encryptionType}
              onChange={({ detail }) =>
                setConfig({ ...config, encryptionType: detail.value as S3EncryptionType })
              }
              items={[
                {
                  value: 'SSE-S3',
                  label: 'Server-side encryption with Amazon S3 managed keys (SSE-S3)',
                  description: 'Each object is encrypted with a unique key. Uses AES-256 encryption.',
                },
                {
                  value: 'SSE-KMS',
                  label: 'Server-side encryption with KMS keys (SSE-KMS)',
                  description:
                    'Use customer managed keys stored in Key Management Service for encryption.',
                },
                {
                  value: 'None',
                  label: 'No encryption',
                  description: 'Objects are not encrypted at rest (not recommended).',
                },
              ]}
            />
          </FormField>

          {config.encryptionType === 'SSE-KMS' && (
            <>
              <FormField label="KMS key" description="Choose a KMS key to use for encryption.">
                <Select
                  selectedOption={kmsKeyOptions.find((k) => k.value === config.kmsKeyId) || kmsKeyOptions[0]}
                  options={kmsKeyOptions}
                  onChange={({ detail }) =>
                    setConfig({ ...config, kmsKeyId: detail.selectedOption.value || '' })
                  }
                  placeholder="Choose a key"
                />
              </FormField>

              <Toggle
                checked={config.bucketKeyEnabled}
                onChange={({ detail }) => setConfig({ ...config, bucketKeyEnabled: detail.checked })}
              >
                Enable Bucket Key
                <Box color="text-body-secondary" fontSize="body-s">
                  Reduces the cost of SSE-KMS by decreasing calls to KMS.
                </Box>
              </Toggle>
            </>
          )}
        </SpaceBetween>
      </Container>

      <Container header={<Header variant="h2">Advanced settings</Header>}>
        <SpaceBetween size="m">
          <Toggle
            checked={config.objectLockEnabled}
            onChange={({ detail }) => setConfig({ ...config, objectLockEnabled: detail.checked })}
          >
            Enable Object Lock
            <Box color="text-body-secondary" fontSize="body-s">
              Permanently allows objects in this bucket to be locked. This setting cannot be disabled after bucket creation.
            </Box>
          </Toggle>
          {config.objectLockEnabled && (
            <Alert type="warning">
              Object Lock can only be enabled for new buckets. Once enabled, it cannot be disabled.
              Versioning will be automatically enabled.
            </Alert>
          )}
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );

  // Step 4: Tags
  const tagsStep = (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h2"
            description="Tags help you identify and organize your buckets. You can add up to 50 tags."
          >
            Tags
          </Header>
        }
      >
        <AttributeEditor
          items={config.tags}
          addButtonText="Add tag"
          removeButtonText="Remove"
          empty="No tags associated with the bucket."
          definition={[
            {
              label: 'Key',
              control: (item, index) => (
                <Input
                  value={item.key}
                  placeholder="Enter key"
                  onChange={({ detail }) => {
                    const newTags = [...config.tags];
                    newTags[index] = { ...newTags[index], key: detail.value };
                    setConfig({ ...config, tags: newTags });
                  }}
                />
              ),
            },
            {
              label: 'Value',
              control: (item, index) => (
                <Input
                  value={item.value}
                  placeholder="Enter value"
                  onChange={({ detail }) => {
                    const newTags = [...config.tags];
                    newTags[index] = { ...newTags[index], value: detail.value };
                    setConfig({ ...config, tags: newTags });
                  }}
                />
              ),
            },
          ]}
          onAddButtonClick={() => setConfig({ ...config, tags: [...config.tags, { key: '', value: '' }] })}
          onRemoveButtonClick={({ detail }) => {
            const newTags = config.tags.filter((_, i) => i !== detail.itemIndex);
            setConfig({ ...config, tags: newTags });
          }}
        />
      </Container>
    </SpaceBetween>
  );

  // Step 5: Review
  const reviewStep = (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">General configuration</Header>}>
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Bucket name</Box>
            <div>{config.name || '-'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Region</Box>
            <div>{regionOptions.find((r) => r.value === config.region)?.label || config.region}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Object Ownership</Box>
            <div>
              {config.objectOwnership === 'BucketOwnerEnforced'
                ? 'ACLs disabled'
                : config.objectOwnership === 'BucketOwnerPreferred'
                  ? 'Bucket owner preferred'
                  : 'Object writer'}
            </div>
          </div>
          <div>
            <Box variant="awsui-key-label">Account</Box>
            <div>{currentAccount?.name} ({currentAccount?.id})</div>
          </div>
        </ColumnLayout>
      </Container>

      <Container header={<Header variant="h2">Block Public Access</Header>}>
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Block all public access</Box>
            <div>
              {allPublicAccessBlocked ? (
                <StatusIndicator type="success">On</StatusIndicator>
              ) : (
                <StatusIndicator type="warning">Off</StatusIndicator>
              )}
            </div>
          </div>
          <div>
            <Box variant="awsui-key-label">Block public ACLs</Box>
            <div>{config.blockPublicAccess.blockPublicAcls ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Ignore public ACLs</Box>
            <div>{config.blockPublicAccess.ignorePublicAcls ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Block public policy</Box>
            <div>{config.blockPublicAccess.blockPublicPolicy ? 'Yes' : 'No'}</div>
          </div>
        </ColumnLayout>
      </Container>

      <Container header={<Header variant="h2">Bucket Versioning & Encryption</Header>}>
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Bucket Versioning</Box>
            <div>
              {config.versioning ? (
                <StatusIndicator type="success">Enabled</StatusIndicator>
              ) : (
                <StatusIndicator type="info">Disabled</StatusIndicator>
              )}
            </div>
          </div>
          <div>
            <Box variant="awsui-key-label">Encryption type</Box>
            <div>{config.encryptionType}</div>
          </div>
          {config.encryptionType === 'SSE-KMS' && (
            <>
              <div>
                <Box variant="awsui-key-label">KMS key</Box>
                <div>{config.kmsKeyId || 'Default key'}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Bucket Key</Box>
                <div>{config.bucketKeyEnabled ? 'Enabled' : 'Disabled'}</div>
              </div>
            </>
          )}
          <div>
            <Box variant="awsui-key-label">Object Lock</Box>
            <div>
              {config.objectLockEnabled ? (
                <StatusIndicator type="warning">Enabled</StatusIndicator>
              ) : (
                <StatusIndicator type="info">Disabled</StatusIndicator>
              )}
            </div>
          </div>
        </ColumnLayout>
      </Container>

      {config.tags.length > 0 && (
        <Container header={<Header variant="h2">Tags ({config.tags.length})</Header>}>
          <ColumnLayout columns={2} variant="text-grid">
            {config.tags.map((tag, index) => (
              <div key={index}>
                <Box variant="awsui-key-label">{tag.key}</Box>
                <div>{tag.value}</div>
              </div>
            ))}
          </ColumnLayout>
        </Container>
      )}
    </SpaceBetween>
  );

  return (
    <Wizard
      i18nStrings={{
        stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
        collapsedStepsLabel: (stepNumber, stepsCount) => `Step ${stepNumber} of ${stepsCount}`,
        skipToButtonLabel: (step) => `Skip to ${step.title}`,
        navigationAriaLabel: 'Steps',
        cancelButton: 'Cancel',
        previousButton: 'Previous',
        nextButton: 'Next',
        submitButton: 'Create bucket',
        optional: 'optional',
      }}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onNavigate={({ detail }) => setActiveStepIndex(detail.requestedStepIndex)}
      activeStepIndex={activeStepIndex}
      isLoadingNextStep={isSubmitting}
      steps={[
        {
          title: 'General configuration',
          description: 'Configure bucket name, region, and object ownership.',
          content: generalConfigStep,
          isOptional: false,
        },
        {
          title: 'Block Public Access',
          description: 'Configure public access settings for this bucket.',
          content: publicAccessStep,
          isOptional: false,
        },
        {
          title: 'Versioning & Encryption',
          description: 'Configure versioning, encryption, and advanced settings.',
          content: versioningEncryptionStep,
          isOptional: false,
        },
        {
          title: 'Tags',
          description: 'Add tags to help organize and identify your bucket.',
          content: tagsStep,
          isOptional: true,
        },
        {
          title: 'Review and create',
          description: 'Review your configuration before creating the bucket.',
          content: reviewStep,
          isOptional: false,
        },
      ]}
    />
  );
}
