import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import { vpcs } from '@/data/mockData';

const AVAILABILITY_ZONES = [
  { value: 'ap-south-1a', label: 'ap-south-1a' },
  { value: 'ap-south-1b', label: 'ap-south-1b' },
  { value: 'ap-south-1c', label: 'ap-south-1c' },
];

interface SubnetConfig {
  id: string;
  name: string;
  availabilityZone: { value: string; label: string } | null;
  cidrBlock: string;
}

export function CreateSubnetPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // VPC Selection
  const [selectedVpc, setSelectedVpc] = useState<{ value: string; label: string } | null>(null);

  // Subnet configurations (for multiple subnets)
  const [subnets, setSubnets] = useState<SubnetConfig[]>([
    {
      id: '1',
      name: '',
      availabilityZone: null,
      cidrBlock: '',
    },
  ]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vpcOptions = useMemo(
    () =>
      vpcs.map((vpc) => ({
        value: vpc.id,
        label: `${vpc.name} (${vpc.id})`,
        description: vpc.cidrBlock,
      })),
    []
  );

  const selectedVpcData = useMemo(
    () => vpcs.find((vpc) => vpc.id === selectedVpc?.value),
    [selectedVpc]
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedVpc) {
      newErrors.vpc = 'Please select a VPC';
    }

    subnets.forEach((subnet, index) => {
      if (!subnet.name.trim()) {
        newErrors[`subnet-${index}-name`] = 'Subnet name is required';
      }

      if (!subnet.availabilityZone) {
        newErrors[`subnet-${index}-az`] = 'Availability Zone is required';
      }

      if (!subnet.cidrBlock) {
        newErrors[`subnet-${index}-cidr`] = 'CIDR block is required';
      } else {
        // Validate CIDR format
        const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
        if (!cidrRegex.test(subnet.cidrBlock)) {
          newErrors[`subnet-${index}-cidr`] = 'Invalid CIDR block format';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    navigate('/networking/subnets', {
      state: { message: `${subnets.length} subnet(s) created successfully` },
    });
  };

  const handleCancel = () => {
    navigate('/networking/subnets');
  };

  const addSubnet = () => {
    setSubnets([
      ...subnets,
      {
        id: String(Date.now()),
        name: '',
        availabilityZone: null,
        cidrBlock: '',
      },
    ]);
  };

  const removeSubnet = (id: string) => {
    if (subnets.length > 1) {
      setSubnets(subnets.filter((s) => s.id !== id));
    }
  };

  const updateSubnet = (id: string, field: keyof SubnetConfig, value: unknown) => {
    setSubnets(
      subnets.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Calculate suggested CIDR blocks based on VPC CIDR and number of subnets
  const suggestCidrBlocks = () => {
    if (!selectedVpcData) return;

    const vpcCidr = selectedVpcData.cidrBlock;
    const [baseIp, prefix] = vpcCidr.split('/');
    const vpcPrefix = parseInt(prefix, 10);
    const subnetPrefix = Math.min(vpcPrefix + 4, 28); // Each subnet gets /20 by default, max /28

    const ipParts = baseIp.split('.').map(Number);

    const updatedSubnets = subnets.map((subnet, index) => {
      // Calculate offset for each subnet
      const subnetSize = Math.pow(2, 32 - subnetPrefix);
      const offset = index * subnetSize;

      // Add offset to base IP
      let ip = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3] + offset;
      const newIp = [
        (ip >> 24) & 255,
        (ip >> 16) & 255,
        (ip >> 8) & 255,
        ip & 255,
      ].join('.');

      return {
        ...subnet,
        cidrBlock: subnet.cidrBlock || `${newIp}/${subnetPrefix}`,
      };
    });

    setSubnets(updatedSubnets);
  };

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: 'Subnets', href: '/networking/subnets' },
          { text: 'Create subnet', href: '#' },
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
            description="Create one or more subnets in a VPC"
          >
            Create subnet
          </Header>
        }
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button variant="link" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
              Create subnet
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          {/* VPC Selection */}
          <Container header={<Header variant="h2">VPC</Header>}>
            <FormField
              label="VPC ID"
              description="Select the VPC where you want to create the subnet"
              errorText={errors.vpc}
            >
              <Select
                selectedOption={selectedVpc}
                onChange={({ detail }) => {
                  setSelectedVpc(detail.selectedOption as { value: string; label: string });
                }}
                options={vpcOptions}
                placeholder="Select a VPC"
                filteringType="auto"
              />
            </FormField>

            {selectedVpcData && (
              <Box padding={{ top: 'm' }}>
                <ColumnLayout columns={3} variant="text-grid">
                  <div>
                    <Box variant="awsui-key-label">VPC CIDR</Box>
                    <Box>{selectedVpcData.cidrBlock}</Box>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">Tenancy</Box>
                    <Box>{selectedVpcData.tenancy}</Box>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">State</Box>
                    <Box>{selectedVpcData.state}</Box>
                  </div>
                </ColumnLayout>
              </Box>
            )}
          </Container>

          {/* Subnet Settings */}
          <Container
            header={
              <Header
                variant="h2"
                actions={
                  <SpaceBetween size="xs" direction="horizontal">
                    {selectedVpcData && (
                      <Button onClick={suggestCidrBlocks}>Suggest CIDR blocks</Button>
                    )}
                    <Button onClick={addSubnet} iconName="add-plus">
                      Add new subnet
                    </Button>
                  </SpaceBetween>
                }
              >
                Subnet settings
              </Header>
            }
          >
            <SpaceBetween size="l">
              {subnets.map((subnet, index) => (
                <Container
                  key={subnet.id}
                  header={
                    <Header
                      variant="h3"
                      actions={
                        subnets.length > 1 && (
                          <Button
                            variant="icon"
                            iconName="remove"
                            onClick={() => removeSubnet(subnet.id)}
                            ariaLabel="Remove subnet"
                          />
                        )
                      }
                    >
                      Subnet {index + 1}
                    </Header>
                  }
                >
                  <ColumnLayout columns={3}>
                    <FormField
                      label="Subnet name"
                      errorText={errors[`subnet-${index}-name`]}
                    >
                      <Input
                        value={subnet.name}
                        onChange={({ detail }) =>
                          updateSubnet(subnet.id, 'name', detail.value)
                        }
                        placeholder={`my-subnet-${index + 1}`}
                      />
                    </FormField>

                    <FormField
                      label="Availability Zone"
                      errorText={errors[`subnet-${index}-az`]}
                    >
                      <Select
                        selectedOption={subnet.availabilityZone}
                        onChange={({ detail }) =>
                          updateSubnet(
                            subnet.id,
                            'availabilityZone',
                            detail.selectedOption as { value: string; label: string }
                          )
                        }
                        options={AVAILABILITY_ZONES}
                        placeholder="Select an Availability Zone"
                      />
                    </FormField>

                    <FormField
                      label="IPv4 CIDR block"
                      constraintText="Must be within the VPC CIDR range"
                      errorText={errors[`subnet-${index}-cidr`]}
                    >
                      <Input
                        value={subnet.cidrBlock}
                        onChange={({ detail }) =>
                          updateSubnet(subnet.id, 'cidrBlock', detail.value)
                        }
                        placeholder="10.0.1.0/24"
                      />
                    </FormField>
                  </ColumnLayout>
                </Container>
              ))}
            </SpaceBetween>
          </Container>

          {/* Info Alert */}
          <Alert type="info" header="Subnet sizing">
            <SpaceBetween size="xs">
              <Box>
                Bhoomi Cloud reserves 5 IP addresses in each subnet for internal networking:
              </Box>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Network address (first IP)</li>
                <li>Router address (second IP)</li>
                <li>DNS server address (third IP)</li>
                <li>Future use (fourth IP)</li>
                <li>Broadcast address (last IP)</li>
              </ul>
              <Box>
                For example, a /24 subnet has 256 IPs, but only 251 are available for your use.
              </Box>
            </SpaceBetween>
          </Alert>

          {/* Preview */}
          {subnets.length > 0 && selectedVpc && (
            <Container header={<Header variant="h2">Preview</Header>}>
              <Table
                items={subnets}
                columnDefinitions={[
                  {
                    id: 'name',
                    header: 'Subnet name',
                    cell: (item) => item.name || '-',
                  },
                  {
                    id: 'az',
                    header: 'Availability Zone',
                    cell: (item) => item.availabilityZone?.label || '-',
                  },
                  {
                    id: 'cidr',
                    header: 'IPv4 CIDR',
                    cell: (item) => item.cidrBlock || '-',
                  },
                  {
                    id: 'availableIps',
                    header: 'Available IPs',
                    cell: (item) => {
                      if (!item.cidrBlock) return '-';
                      const parts = item.cidrBlock.split('/');
                      if (parts.length !== 2) return '-';
                      const prefix = parseInt(parts[1], 10);
                      const total = Math.pow(2, 32 - prefix);
                      return Math.max(0, total - 5); // Subtract 5 reserved IPs
                    },
                  },
                ]}
                variant="embedded"
              />
            </Container>
          )}
        </SpaceBetween>
      </Form>
    </SpaceBetween>
  );
}
