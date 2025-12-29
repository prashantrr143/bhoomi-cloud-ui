import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tiles from '@cloudscape-design/components/tiles';
import Wizard from '@cloudscape-design/components/wizard';
import Alert from '@cloudscape-design/components/alert';
import Textarea from '@cloudscape-design/components/textarea';
import AttributeEditor from '@cloudscape-design/components/attribute-editor';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import FileUpload from '@cloudscape-design/components/file-upload';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import { IAMIdentityProviderType } from '@/types';

interface TagItem {
  key: string;
  value: string;
}

interface ClientIdItem {
  clientId: string;
}

interface ThumbprintItem {
  thumbprint: string;
}

export function AddIdentityProviderPage() {
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Provider Type
  const [providerType, setProviderType] = useState<IAMIdentityProviderType | ''>('');

  // Step 2: Provider Configuration - Common
  const [providerName, setProviderName] = useState('');
  const [providerNameError, setProviderNameError] = useState('');

  // SAML Configuration
  const [samlMetadataOption, setSamlMetadataOption] = useState<'url' | 'file'>('url');
  const [samlMetadataUrl, setSamlMetadataUrl] = useState('');
  const [samlMetadataFile, setSamlMetadataFile] = useState<File[]>([]);
  const [samlMetadataError, setSamlMetadataError] = useState('');

  // OIDC Configuration
  const [oidcIssuerUrl, setOidcIssuerUrl] = useState('');
  const [oidcIssuerUrlError, setOidcIssuerUrlError] = useState('');
  const [clientIds, setClientIds] = useState<ClientIdItem[]>([{ clientId: '' }]);
  const [thumbprints, setThumbprints] = useState<ThumbprintItem[]>([]);
  const [thumbprintsFetched, setThumbprintsFetched] = useState(false);
  const [fetchingThumbprints, setFetchingThumbprints] = useState(false);

  // Step 3: Tags
  const [tags, setTags] = useState<TagItem[]>([]);

  const validateProviderName = (name: string): boolean => {
    if (!name.trim()) {
      setProviderNameError('Provider name is required');
      return false;
    }
    if (!/^[\w+=,.@-]+$/.test(name)) {
      setProviderNameError(
        'Provider name can only contain alphanumeric characters and the following: +=,.@-'
      );
      return false;
    }
    if (name.length > 128) {
      setProviderNameError('Provider name must be 128 characters or fewer');
      return false;
    }
    setProviderNameError('');
    return true;
  };

  const validateSamlConfig = (): boolean => {
    if (samlMetadataOption === 'url' && !samlMetadataUrl.trim()) {
      setSamlMetadataError('Metadata URL is required');
      return false;
    }
    if (samlMetadataOption === 'file' && samlMetadataFile.length === 0) {
      setSamlMetadataError('Metadata file is required');
      return false;
    }
    if (samlMetadataOption === 'url' && !isValidUrl(samlMetadataUrl)) {
      setSamlMetadataError('Please enter a valid URL');
      return false;
    }
    setSamlMetadataError('');
    return true;
  };

  const validateOidcConfig = (): boolean => {
    if (!oidcIssuerUrl.trim()) {
      setOidcIssuerUrlError('Provider URL is required');
      return false;
    }
    if (!isValidUrl(oidcIssuerUrl)) {
      setOidcIssuerUrlError('Please enter a valid HTTPS URL');
      return false;
    }
    if (!oidcIssuerUrl.startsWith('https://')) {
      setOidcIssuerUrlError('Provider URL must use HTTPS');
      return false;
    }
    setOidcIssuerUrlError('');
    return true;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchThumbprints = async () => {
    if (!validateOidcConfig()) return;

    setFetchingThumbprints(true);
    // Simulate API call to fetch thumbprints
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate mock thumbprints
    const mockThumbprint =
      Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    setThumbprints([{ thumbprint: mockThumbprint }]);
    setThumbprintsFetched(true);
    setFetchingThumbprints(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create provider object (in real app, this would be sent to API)
    const newProvider = {
      name: providerName,
      type: providerType,
      ...(providerType === 'SAML'
        ? {
            samlConfig: {
              metadataUrl: samlMetadataOption === 'url' ? samlMetadataUrl : undefined,
              metadataDocument: samlMetadataOption === 'file' ? 'uploaded' : undefined,
            },
          }
        : {
            oidcConfig: {
              issuerUrl: oidcIssuerUrl,
              clientIds: clientIds.filter((c) => c.clientId.trim()).map((c) => c.clientId),
              thumbprints: thumbprints.map((t) => t.thumbprint),
            },
          }),
      tags: tags.reduce(
        (acc, tag) => {
          if (tag.key.trim()) {
            acc[tag.key] = tag.value;
          }
          return acc;
        },
        {} as Record<string, string>
      ),
    };

    console.log('Creating identity provider:', newProvider);
    setIsSubmitting(false);
    navigate('/iam/identity-providers');
  };

  const canProceedFromStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return !!providerType;
      case 1:
        if (!validateProviderName(providerName)) return false;
        if (providerType === 'SAML') {
          return validateSamlConfig();
        } else {
          return validateOidcConfig() && thumbprintsFetched;
        }
      case 2:
        return true;
      default:
        return false;
    }
  };

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
        submitButton: 'Add provider',
        optional: 'optional',
      }}
      onNavigate={({ detail }) => {
        if (detail.requestedStepIndex > activeStepIndex) {
          if (canProceedFromStep(activeStepIndex)) {
            setActiveStepIndex(detail.requestedStepIndex);
          }
        } else {
          setActiveStepIndex(detail.requestedStepIndex);
        }
      }}
      onCancel={() => navigate('/iam/identity-providers')}
      onSubmit={handleSubmit}
      activeStepIndex={activeStepIndex}
      isLoadingNextStep={isSubmitting}
      steps={[
        {
          title: 'Choose provider type',
          description: 'Select the type of identity provider you want to add.',
          content: (
            <Container header={<Header variant="h2">Provider type</Header>}>
              <SpaceBetween size="l">
                <Tiles
                  value={providerType}
                  onChange={({ detail }) =>
                    setProviderType(detail.value as IAMIdentityProviderType)
                  }
                  items={[
                    {
                      value: 'SAML',
                      label: 'SAML',
                      description:
                        'Security Assertion Markup Language 2.0 for enterprise single sign-on. Use this for identity providers like Okta, OneLogin, Azure AD, or your own SAML provider.',
                    },
                    {
                      value: 'OIDC',
                      label: 'OpenID Connect',
                      description:
                        'OpenID Connect for web and mobile authentication. Use this for identity providers like Google, GitHub, or any OIDC-compliant provider.',
                    },
                  ]}
                />

                {providerType === 'SAML' && (
                  <Alert type="info" header="About SAML providers">
                    SAML 2.0 is an XML-based standard for exchanging authentication and
                    authorization data between an identity provider (IdP) and a service provider
                    (SP). Your identity provider will provide you with a metadata document or URL.
                  </Alert>
                )}

                {providerType === 'OIDC' && (
                  <Alert type="info" header="About OpenID Connect providers">
                    OpenID Connect is a simple identity layer on top of the OAuth 2.0 protocol. It
                    allows clients to verify the identity of end-users and obtain basic profile
                    information. You'll need the provider URL (issuer) and optionally audience/client
                    IDs.
                  </Alert>
                )}
              </SpaceBetween>
            </Container>
          ),
        },
        {
          title: 'Configure provider',
          description:
            providerType === 'SAML'
              ? 'Configure your SAML identity provider.'
              : 'Configure your OpenID Connect identity provider.',
          content: (
            <SpaceBetween size="l">
              <Container header={<Header variant="h2">Provider details</Header>}>
                <FormField
                  label="Provider name"
                  description="A unique name for this identity provider"
                  constraintText="Up to 128 characters. Alphanumeric characters and +=,.@- allowed."
                  errorText={providerNameError}
                >
                  <Input
                    value={providerName}
                    onChange={({ detail }) => {
                      setProviderName(detail.value);
                      if (providerNameError) validateProviderName(detail.value);
                    }}
                    placeholder="my-identity-provider"
                  />
                </FormField>
              </Container>

              {providerType === 'SAML' && (
                <Container header={<Header variant="h2">SAML metadata</Header>}>
                  <SpaceBetween size="l">
                    <FormField
                      label="Metadata source"
                      description="Choose how to provide your SAML metadata"
                    >
                      <Tiles
                        value={samlMetadataOption}
                        onChange={({ detail }) =>
                          setSamlMetadataOption(detail.value as 'url' | 'file')
                        }
                        items={[
                          {
                            value: 'url',
                            label: 'Metadata URL',
                            description: 'Provide a URL where the SAML metadata can be fetched',
                          },
                          {
                            value: 'file',
                            label: 'Upload metadata file',
                            description: 'Upload an XML metadata document',
                          },
                        ]}
                      />
                    </FormField>

                    {samlMetadataOption === 'url' && (
                      <FormField
                        label="Metadata document URL"
                        description="The URL where Bhoomi Cloud can fetch the SAML metadata document"
                        errorText={samlMetadataError}
                      >
                        <Input
                          value={samlMetadataUrl}
                          onChange={({ detail }) => {
                            setSamlMetadataUrl(detail.value);
                            if (samlMetadataError) setSamlMetadataError('');
                          }}
                          placeholder="https://your-idp.example.com/saml/metadata"
                          type="url"
                        />
                      </FormField>
                    )}

                    {samlMetadataOption === 'file' && (
                      <FormField
                        label="Metadata document"
                        description="Upload your SAML metadata XML file"
                        errorText={samlMetadataError}
                      >
                        <FileUpload
                          value={samlMetadataFile}
                          onChange={({ detail }) => {
                            setSamlMetadataFile(detail.value);
                            if (samlMetadataError) setSamlMetadataError('');
                          }}
                          i18nStrings={{
                            uploadButtonText: (multiple) => (multiple ? 'Choose files' : 'Choose file'),
                            dropzoneText: (multiple) =>
                              multiple ? 'Drop files to upload' : 'Drop file to upload',
                            removeFileAriaLabel: (fileIndex) => `Remove file ${fileIndex + 1}`,
                            limitShowFewer: 'Show fewer files',
                            limitShowMore: 'Show more files',
                            errorIconAriaLabel: 'Error',
                          }}
                          accept=".xml"
                          constraintText="XML file only"
                        />
                      </FormField>
                    )}

                    <Alert type="info">
                      The SAML metadata document contains the identity provider's public key
                      certificate, entity ID, and endpoint URLs for authentication requests.
                    </Alert>
                  </SpaceBetween>
                </Container>
              )}

              {providerType === 'OIDC' && (
                <SpaceBetween size="l">
                  <Container header={<Header variant="h2">Provider URL</Header>}>
                    <SpaceBetween size="l">
                      <FormField
                        label="Provider URL"
                        description="The URL of the OpenID Connect identity provider. This is the issuer URL without the /.well-known/openid-configuration path."
                        errorText={oidcIssuerUrlError}
                      >
                        <Input
                          value={oidcIssuerUrl}
                          onChange={({ detail }) => {
                            setOidcIssuerUrl(detail.value);
                            if (oidcIssuerUrlError) setOidcIssuerUrlError('');
                            setThumbprintsFetched(false);
                          }}
                          placeholder="https://accounts.google.com"
                          type="url"
                        />
                      </FormField>

                      <Box>
                        <Button
                          onClick={fetchThumbprints}
                          loading={fetchingThumbprints}
                          disabled={!oidcIssuerUrl.trim() || fetchingThumbprints}
                        >
                          Get thumbprint
                        </Button>
                      </Box>

                      {thumbprintsFetched && thumbprints.length > 0 && (
                        <Alert type="success" header="Thumbprint retrieved">
                          <SpaceBetween size="xs">
                            <Box>
                              The server certificate thumbprint has been retrieved from the provider.
                            </Box>
                            <Box variant="code">{thumbprints[0]?.thumbprint}</Box>
                          </SpaceBetween>
                        </Alert>
                      )}
                    </SpaceBetween>
                  </Container>

                  <Container
                    header={
                      <Header
                        variant="h2"
                        description="Client IDs (audiences) that are allowed to authenticate with this provider"
                      >
                        Audience
                      </Header>
                    }
                  >
                    <AttributeEditor
                      onAddButtonClick={() => setClientIds([...clientIds, { clientId: '' }])}
                      onRemoveButtonClick={({ detail: { itemIndex } }) =>
                        setClientIds(clientIds.filter((_, index) => index !== itemIndex))
                      }
                      items={clientIds}
                      addButtonText="Add audience"
                      removeButtonText="Remove"
                      empty="No audiences configured. Add an audience to restrict which clients can authenticate."
                      definition={[
                        {
                          label: 'Audience / Client ID',
                          control: (item, itemIndex) => (
                            <Input
                              value={item.clientId}
                              onChange={({ detail }) => {
                                const newClientIds = [...clientIds];
                                newClientIds[itemIndex] = { clientId: detail.value };
                                setClientIds(newClientIds);
                              }}
                              placeholder="sts.amazonaws.com"
                            />
                          ),
                        },
                      ]}
                    />
                  </Container>

                  <Container
                    header={
                      <Header
                        variant="h2"
                        description="Server certificate thumbprints for the OIDC provider"
                      >
                        Thumbprints
                      </Header>
                    }
                  >
                    <AttributeEditor
                      onAddButtonClick={() => setThumbprints([...thumbprints, { thumbprint: '' }])}
                      onRemoveButtonClick={({ detail: { itemIndex } }) =>
                        setThumbprints(thumbprints.filter((_, index) => index !== itemIndex))
                      }
                      items={thumbprints}
                      addButtonText="Add thumbprint"
                      removeButtonText="Remove"
                      empty="No thumbprints configured. Use 'Get thumbprint' above or add manually."
                      definition={[
                        {
                          label: 'Thumbprint (40 hex characters)',
                          control: (item, itemIndex) => (
                            <Input
                              value={item.thumbprint}
                              onChange={({ detail }) => {
                                const newThumbprints = [...thumbprints];
                                newThumbprints[itemIndex] = { thumbprint: detail.value };
                                setThumbprints(newThumbprints);
                              }}
                              placeholder="a1b2c3d4e5f6..."
                            />
                          ),
                        },
                      ]}
                    />
                  </Container>
                </SpaceBetween>
              )}
            </SpaceBetween>
          ),
        },
        {
          title: 'Add tags',
          isOptional: true,
          description: 'Tags help you organize and identify your resources.',
          content: (
            <Container
              header={
                <Header
                  variant="h2"
                  description="A tag is a label that you assign to Bhoomi Cloud resources. Each tag consists of a key and an optional value."
                >
                  Tags
                </Header>
              }
            >
              <AttributeEditor
                onAddButtonClick={() => setTags([...tags, { key: '', value: '' }])}
                onRemoveButtonClick={({ detail: { itemIndex } }) =>
                  setTags(tags.filter((_, index) => index !== itemIndex))
                }
                items={tags}
                addButtonText="Add new tag"
                removeButtonText="Remove"
                empty="No tags added. Tags help you organize and identify your resources."
                definition={[
                  {
                    label: 'Key',
                    control: (item, itemIndex) => (
                      <Input
                        value={item.key}
                        onChange={({ detail }) => {
                          const newTags = [...tags];
                          newTags[itemIndex] = { ...newTags[itemIndex], key: detail.value };
                          setTags(newTags);
                        }}
                        placeholder="Environment"
                      />
                    ),
                  },
                  {
                    label: 'Value - optional',
                    control: (item, itemIndex) => (
                      <Input
                        value={item.value}
                        onChange={({ detail }) => {
                          const newTags = [...tags];
                          newTags[itemIndex] = { ...newTags[itemIndex], value: detail.value };
                          setTags(newTags);
                        }}
                        placeholder="Production"
                      />
                    ),
                  },
                ]}
              />
            </Container>
          ),
        },
        {
          title: 'Review and create',
          description: 'Review your identity provider configuration before creating.',
          content: (
            <SpaceBetween size="l">
              <Container header={<Header variant="h2">Review configuration</Header>}>
                <ColumnLayout columns={2} variant="text-grid">
                  <SpaceBetween size="l">
                    <Box>
                      <Box variant="awsui-key-label">Provider name</Box>
                      <Box>{providerName || '-'}</Box>
                    </Box>
                    <Box>
                      <Box variant="awsui-key-label">Provider type</Box>
                      <Box>{providerType === 'SAML' ? 'SAML 2.0' : 'OpenID Connect'}</Box>
                    </Box>
                  </SpaceBetween>
                  <SpaceBetween size="l">
                    <Box>
                      <Box variant="awsui-key-label">Tags</Box>
                      <Box>
                        {tags.filter((t) => t.key.trim()).length > 0
                          ? `${tags.filter((t) => t.key.trim()).length} tag(s)`
                          : 'No tags'}
                      </Box>
                    </Box>
                  </SpaceBetween>
                </ColumnLayout>
              </Container>

              {providerType === 'SAML' && (
                <Container header={<Header variant="h2">SAML configuration</Header>}>
                  <SpaceBetween size="l">
                    <Box>
                      <Box variant="awsui-key-label">Metadata source</Box>
                      <Box>{samlMetadataOption === 'url' ? 'URL' : 'Uploaded file'}</Box>
                    </Box>
                    {samlMetadataOption === 'url' && (
                      <Box>
                        <Box variant="awsui-key-label">Metadata URL</Box>
                        <Box>{samlMetadataUrl}</Box>
                      </Box>
                    )}
                    {samlMetadataOption === 'file' && (
                      <Box>
                        <Box variant="awsui-key-label">Metadata file</Box>
                        <Box>{samlMetadataFile[0]?.name || '-'}</Box>
                      </Box>
                    )}
                  </SpaceBetween>
                </Container>
              )}

              {providerType === 'OIDC' && (
                <Container header={<Header variant="h2">OIDC configuration</Header>}>
                  <SpaceBetween size="l">
                    <Box>
                      <Box variant="awsui-key-label">Provider URL</Box>
                      <Box>{oidcIssuerUrl}</Box>
                    </Box>
                    <Box>
                      <Box variant="awsui-key-label">Audiences</Box>
                      {clientIds.filter((c) => c.clientId.trim()).length > 0 ? (
                        <SpaceBetween size="xs">
                          {clientIds
                            .filter((c) => c.clientId.trim())
                            .map((c, i) => (
                              <Box key={i}>{c.clientId}</Box>
                            ))}
                        </SpaceBetween>
                      ) : (
                        <Box color="text-status-inactive">No audiences configured</Box>
                      )}
                    </Box>
                    <Box>
                      <Box variant="awsui-key-label">Thumbprints</Box>
                      {thumbprints.length > 0 ? (
                        <SpaceBetween size="xs">
                          {thumbprints.map((t, i) => (
                            <Box key={i} variant="code">
                              {t.thumbprint}
                            </Box>
                          ))}
                        </SpaceBetween>
                      ) : (
                        <Box color="text-status-inactive">No thumbprints</Box>
                      )}
                    </Box>
                  </SpaceBetween>
                </Container>
              )}

              {tags.filter((t) => t.key.trim()).length > 0 && (
                <Container header={<Header variant="h2">Tags</Header>}>
                  <ColumnLayout columns={2}>
                    {tags
                      .filter((t) => t.key.trim())
                      .map((tag, i) => (
                        <Box key={i}>
                          <Box variant="awsui-key-label">{tag.key}</Box>
                          <Box>{tag.value || '-'}</Box>
                        </Box>
                      ))}
                  </ColumnLayout>
                </Container>
              )}

              <Alert type="info" header="What happens next?">
                <SpaceBetween size="xs">
                  <Box>
                    After creating this identity provider, you'll need to create an IAM role that
                    trusts this provider. The role will define what permissions federated users will
                    have.
                  </Box>
                  <Link href="/iam/roles/create">Learn more about creating roles</Link>
                </SpaceBetween>
              </Alert>
            </SpaceBetween>
          ),
        },
      ]}
    />
  );
}
