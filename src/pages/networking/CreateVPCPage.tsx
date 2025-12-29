import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Button from '@cloudscape-design/components/button';
import Checkbox from '@cloudscape-design/components/checkbox';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tiles from '@cloudscape-design/components/tiles';

const TENANCY_OPTIONS = [
  { value: 'default', label: 'Default', description: 'Your instance runs on shared hardware' },
  { value: 'dedicated', label: 'Dedicated', description: 'Your instance runs on single-tenant hardware' },
];

const AVAILABILITY_ZONES = [
  { value: 'ap-south-1a', label: 'ap-south-1a' },
  { value: 'ap-south-1b', label: 'ap-south-1b' },
  { value: 'ap-south-1c', label: 'ap-south-1c' },
];

export function CreateVPCPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // VPC Settings
  const [vpcName, setVpcName] = useState('');
  const [ipv4Cidr, setIpv4Cidr] = useState('10.0.0.0/16');
  const [ipv6Cidr, setIpv6Cidr] = useState<'none' | 'amazon' | 'byoip'>('none');
  const [tenancy, setTenancy] = useState('default');

  // DNS Settings
  const [enableDnsHostnames, setEnableDnsHostnames] = useState(true);
  const [enableDnsResolution, setEnableDnsResolution] = useState(true);

  // VPC Settings - VPC only vs VPC and more
  const [vpcType, setVpcType] = useState<'vpc-only' | 'vpc-etc'>('vpc-only');

  // For VPC with subnets
  const [numberOfAzs, setNumberOfAzs] = useState<{ value: string; label: string }>({ value: '2', label: '2' });
  const [numberOfPublicSubnets, setNumberOfPublicSubnets] = useState<{ value: string; label: string }>({ value: '2', label: '2' });
  const [numberOfPrivateSubnets, setNumberOfPrivateSubnets] = useState<{ value: string; label: string }>({ value: '2', label: '2' });
  const [natGateway, setNatGateway] = useState<'none' | 'single' | 'one-per-az'>('none');
  const [vpcEndpoints, setVpcEndpoints] = useState<'none' | 's3'>('none');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!vpcName.trim()) {
      newErrors.vpcName = 'VPC name is required';
    }

    // Validate CIDR block format
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (!cidrRegex.test(ipv4Cidr)) {
      newErrors.ipv4Cidr = 'Invalid CIDR block format. Example: 10.0.0.0/16';
    } else {
      // Validate CIDR range
      const parts = ipv4Cidr.split('/');
      const prefix = parseInt(parts[1], 10);
      if (prefix < 16 || prefix > 28) {
        newErrors.ipv4Cidr = 'CIDR block must be between /16 and /28';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    navigate('/networking/vpcs', {
      state: { message: 'VPC created successfully' },
    });
  };

  const handleCancel = () => {
    navigate('/networking/vpcs');
  };

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: 'VPCs', href: '/networking/vpcs' },
          { text: 'Create VPC', href: '#' },
        ]}
        onFollow={(e) => {
          e.preventDefault();
          navigate(e.detail.href);
        }}
      />

      <Form
        header={
          <Header
            variant="h1"
            description="Create a virtual private cloud to launch Bhoomi Cloud resources"
          >
            Create VPC
          </Header>
        }
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button variant="link" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
              Create VPC
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          {/* Resources to create */}
          <Container header={<Header variant="h2">Resources to create</Header>}>
            <Tiles
              value={vpcType}
              onChange={({ detail }) => setVpcType(detail.value as 'vpc-only' | 'vpc-etc')}
              items={[
                {
                  value: 'vpc-only',
                  label: 'VPC only',
                  description: 'Create only a VPC without any subnets, internet gateways, or NAT gateways',
                },
                {
                  value: 'vpc-etc',
                  label: 'VPC and more',
                  description: 'Create a VPC with subnets, route tables, and network connections in multiple Availability Zones',
                },
              ]}
            />
          </Container>

          {/* VPC Settings */}
          <Container header={<Header variant="h2">VPC settings</Header>}>
            <SpaceBetween size="l">
              <FormField
                label="Name tag"
                description="A name for your VPC. The name tag will be applied to the VPC."
                errorText={errors.vpcName}
              >
                <Input
                  value={vpcName}
                  onChange={({ detail }) => setVpcName(detail.value)}
                  placeholder="my-vpc"
                />
              </FormField>

              <FormField
                label="IPv4 CIDR block"
                description="Specify the IPv4 CIDR block for the VPC. The allowed block size is between a /16 netmask and /28 netmask."
                errorText={errors.ipv4Cidr}
                constraintText="Example: 10.0.0.0/16"
              >
                <Input
                  value={ipv4Cidr}
                  onChange={({ detail }) => setIpv4Cidr(detail.value)}
                  placeholder="10.0.0.0/16"
                />
              </FormField>

              <FormField
                label="IPv6 CIDR block"
                description="Optionally associate an IPv6 CIDR block with the VPC"
              >
                <RadioGroup
                  value={ipv6Cidr}
                  onChange={({ detail }) => setIpv6Cidr(detail.value as 'none' | 'amazon' | 'byoip')}
                  items={[
                    { value: 'none', label: 'No IPv6 CIDR block' },
                    { value: 'amazon', label: 'Bhoomi Cloud-provided IPv6 CIDR block' },
                    { value: 'byoip', label: 'IPv6 CIDR block from your BYOIP pool', disabled: true },
                  ]}
                />
              </FormField>

              <FormField
                label="Tenancy"
                description="Tenancy defines how EC2 instances are distributed across physical hardware"
              >
                <RadioGroup
                  value={tenancy}
                  onChange={({ detail }) => setTenancy(detail.value)}
                  items={TENANCY_OPTIONS}
                />
              </FormField>
            </SpaceBetween>
          </Container>

          {/* VPC and more configuration */}
          {vpcType === 'vpc-etc' && (
            <Container header={<Header variant="h2">Subnet configuration</Header>}>
              <SpaceBetween size="l">
                <ColumnLayout columns={2}>
                  <FormField label="Number of Availability Zones (AZs)">
                    <Select
                      selectedOption={numberOfAzs}
                      onChange={({ detail }) =>
                        setNumberOfAzs(detail.selectedOption as { value: string; label: string })
                      }
                      options={[
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3', label: '3' },
                      ]}
                    />
                  </FormField>
                  <Box />
                </ColumnLayout>

                <ColumnLayout columns={2}>
                  <FormField
                    label="Number of public subnets"
                    description="Public subnets have a route to an internet gateway"
                  >
                    <Select
                      selectedOption={numberOfPublicSubnets}
                      onChange={({ detail }) =>
                        setNumberOfPublicSubnets(detail.selectedOption as { value: string; label: string })
                      }
                      options={[
                        { value: '0', label: '0' },
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3', label: '3' },
                      ]}
                    />
                  </FormField>

                  <FormField
                    label="Number of private subnets"
                    description="Private subnets do not have a route to an internet gateway"
                  >
                    <Select
                      selectedOption={numberOfPrivateSubnets}
                      onChange={({ detail }) =>
                        setNumberOfPrivateSubnets(detail.selectedOption as { value: string; label: string })
                      }
                      options={[
                        { value: '0', label: '0' },
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3', label: '3' },
                      ]}
                    />
                  </FormField>
                </ColumnLayout>

                <FormField
                  label="NAT gateways"
                  description="NAT gateways enable instances in private subnets to connect to the internet"
                >
                  <RadioGroup
                    value={natGateway}
                    onChange={({ detail }) => setNatGateway(detail.value as 'none' | 'single' | 'one-per-az')}
                    items={[
                      { value: 'none', label: 'None' },
                      { value: 'single', label: 'In 1 AZ', description: 'Lower cost, less resilient' },
                      { value: 'one-per-az', label: 'In each AZ', description: 'Higher cost, more resilient' },
                    ]}
                  />
                </FormField>

                <FormField
                  label="VPC endpoints"
                  description="VPC endpoints provide private connectivity to supported services"
                >
                  <RadioGroup
                    value={vpcEndpoints}
                    onChange={({ detail }) => setVpcEndpoints(detail.value as 'none' | 's3')}
                    items={[
                      { value: 'none', label: 'None' },
                      { value: 's3', label: 'S3 Gateway' },
                    ]}
                  />
                </FormField>

                {natGateway !== 'none' && (
                  <Alert type="info">
                    NAT gateways incur hourly charges and data processing charges. See the{' '}
                    <a href="#">pricing page</a> for details.
                  </Alert>
                )}
              </SpaceBetween>
            </Container>
          )}

          {/* DNS Settings */}
          <Container header={<Header variant="h2">DNS options</Header>}>
            <SpaceBetween size="m">
              <Checkbox
                checked={enableDnsResolution}
                onChange={({ detail }) => setEnableDnsResolution(detail.checked)}
              >
                <Box>
                  <Box variant="strong">Enable DNS resolution</Box>
                  <Box variant="small" color="text-body-secondary">
                    Enables DNS resolution in the VPC. When enabled, DNS queries to Bhoomi Cloud public DNS servers resolve to private IP addresses.
                  </Box>
                </Box>
              </Checkbox>

              <Checkbox
                checked={enableDnsHostnames}
                onChange={({ detail }) => setEnableDnsHostnames(detail.checked)}
              >
                <Box>
                  <Box variant="strong">Enable DNS hostnames</Box>
                  <Box variant="small" color="text-body-secondary">
                    Enables DNS hostnames in the VPC. When enabled, instances with public IP addresses get corresponding public DNS hostnames.
                  </Box>
                </Box>
              </Checkbox>
            </SpaceBetween>
          </Container>

          {/* Preview */}
          <Container header={<Header variant="h2">Preview</Header>}>
            <SpaceBetween size="s">
              <ColumnLayout columns={2} variant="text-grid">
                <div>
                  <Box variant="awsui-key-label">VPC name</Box>
                  <Box>{vpcName || '-'}</Box>
                </div>
                <div>
                  <Box variant="awsui-key-label">IPv4 CIDR</Box>
                  <Box>{ipv4Cidr}</Box>
                </div>
                <div>
                  <Box variant="awsui-key-label">IPv6 CIDR</Box>
                  <Box>{ipv6Cidr === 'none' ? 'No IPv6' : ipv6Cidr === 'amazon' ? 'Bhoomi Cloud provided' : 'BYOIP'}</Box>
                </div>
                <div>
                  <Box variant="awsui-key-label">Tenancy</Box>
                  <Box>{tenancy}</Box>
                </div>
              </ColumnLayout>

              {vpcType === 'vpc-etc' && (
                <>
                  <Box variant="h4" padding={{ top: 'm' }}>Resources to be created</Box>
                  <ColumnLayout columns={3} variant="text-grid">
                    <div>
                      <Box variant="awsui-key-label">Availability Zones</Box>
                      <Box>{numberOfAzs.value}</Box>
                    </div>
                    <div>
                      <Box variant="awsui-key-label">Public subnets</Box>
                      <Box>{numberOfPublicSubnets.value}</Box>
                    </div>
                    <div>
                      <Box variant="awsui-key-label">Private subnets</Box>
                      <Box>{numberOfPrivateSubnets.value}</Box>
                    </div>
                    <div>
                      <Box variant="awsui-key-label">NAT gateways</Box>
                      <Box>{natGateway === 'none' ? '0' : natGateway === 'single' ? '1' : numberOfAzs.value}</Box>
                    </div>
                    <div>
                      <Box variant="awsui-key-label">VPC endpoints</Box>
                      <Box>{vpcEndpoints === 'none' ? '0' : '1 (S3)'}</Box>
                    </div>
                    <div>
                      <Box variant="awsui-key-label">Route tables</Box>
                      <Box>
                        {parseInt(numberOfPublicSubnets.value) > 0 ? 1 : 0} public,{' '}
                        {parseInt(numberOfPrivateSubnets.value) > 0 ? parseInt(numberOfAzs.value) : 0} private
                      </Box>
                    </div>
                  </ColumnLayout>
                </>
              )}
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Form>
    </SpaceBetween>
  );
}
