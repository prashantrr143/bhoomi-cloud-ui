import { useState, useMemo } from 'react';
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
import { vpcs, instances, lambdaFunctions } from '@/data/mockData';

const TARGET_TYPES = [
  {
    value: 'instance',
    label: 'Instances',
    description: 'Register targets by instance ID. Supports EC2 instances within the specified VPC.',
  },
  {
    value: 'ip',
    label: 'IP addresses',
    description: 'Register targets by IP address. Supports IP addresses from the VPC CIDR or peered VPCs.',
  },
  {
    value: 'lambda',
    label: 'Lambda function',
    description: 'Register a Lambda function as a target. Only compatible with Application Load Balancers.',
  },
];

const PROTOCOL_OPTIONS = [
  { value: 'HTTP', label: 'HTTP' },
  { value: 'HTTPS', label: 'HTTPS' },
  { value: 'TCP', label: 'TCP' },
  { value: 'UDP', label: 'UDP' },
  { value: 'TLS', label: 'TLS' },
  { value: 'TCP_UDP', label: 'TCP_UDP' },
];

const HEALTH_CHECK_PROTOCOLS = [
  { value: 'HTTP', label: 'HTTP' },
  { value: 'HTTPS', label: 'HTTPS' },
  { value: 'TCP', label: 'TCP' },
];

const IP_ADDRESS_TYPES = [
  { value: 'ipv4', label: 'IPv4' },
  { value: 'ipv6', label: 'IPv6' },
];

const PROTOCOL_VERSIONS = [
  { value: 'HTTP1', label: 'HTTP1' },
  { value: 'HTTP2', label: 'HTTP2' },
  { value: 'GRPC', label: 'gRPC' },
];

export function CreateTargetGroupPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic configuration
  const [targetType, setTargetType] = useState('instance');
  const [targetGroupName, setTargetGroupName] = useState('');
  const [protocol, setProtocol] = useState<{ value: string; label: string }>({ value: 'HTTP', label: 'HTTP' });
  const [port, setPort] = useState('80');
  const [ipAddressType, setIpAddressType] = useState('ipv4');
  const [protocolVersion, setProtocolVersion] = useState<{ value: string; label: string }>({ value: 'HTTP1', label: 'HTTP1' });
  const [selectedVpc, setSelectedVpc] = useState<{ value: string; label: string } | null>(null);

  // Lambda specific
  const [selectedLambda, setSelectedLambda] = useState<{ value: string; label: string } | null>(null);

  // Health check settings
  const [healthCheckProtocol, setHealthCheckProtocol] = useState<{ value: string; label: string }>({ value: 'HTTP', label: 'HTTP' });
  const [healthCheckPath, setHealthCheckPath] = useState('/');
  const [healthCheckPort, setHealthCheckPort] = useState('traffic-port');
  const [healthyThreshold, setHealthyThreshold] = useState('5');
  const [unhealthyThreshold, setUnhealthyThreshold] = useState('2');
  const [timeout, setTimeout] = useState('5');
  const [interval, setInterval] = useState('30');
  const [successCodes, setSuccessCodes] = useState('200');

  // Advanced settings
  const [deregistrationDelay, setDeregistrationDelay] = useState('300');
  const [slowStartDuration, setSlowStartDuration] = useState('0');
  const [stickinessEnabled, setStickinessEnabled] = useState(false);
  const [stickinessDuration, setStickinessDuration] = useState('86400');

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

  const lambdaOptions = useMemo(
    () =>
      lambdaFunctions.map((fn) => ({
        value: fn.arn,
        label: fn.name,
        description: `Runtime: ${fn.runtime}`,
      })),
    []
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!targetGroupName.trim()) {
      newErrors.name = 'Target group name is required';
    } else if (!/^[a-zA-Z0-9-]+$/.test(targetGroupName)) {
      newErrors.name = 'Name can only contain alphanumeric characters and hyphens';
    } else if (targetGroupName.length > 32) {
      newErrors.name = 'Name must be 32 characters or less';
    }

    if (targetType !== 'lambda') {
      if (!selectedVpc) {
        newErrors.vpc = 'Please select a VPC';
      }

      if (!port || isNaN(Number(port)) || Number(port) < 1 || Number(port) > 65535) {
        newErrors.port = 'Port must be between 1 and 65535';
      }
    }

    if (targetType === 'lambda' && !selectedLambda) {
      newErrors.lambda = 'Please select a Lambda function';
    }

    // Health check validation
    if (targetType !== 'lambda') {
      if (healthCheckProtocol.value === 'HTTP' || healthCheckProtocol.value === 'HTTPS') {
        if (!healthCheckPath) {
          newErrors.healthCheckPath = 'Health check path is required';
        }
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
    navigate('/compute/target-groups', {
      state: { message: 'Target group created successfully' },
    });
  };

  const handleCancel = () => {
    navigate('/compute/target-groups');
  };

  // Reset form when target type changes
  const handleTargetTypeChange = (newType: string) => {
    setTargetType(newType);
    if (newType === 'lambda') {
      setProtocol({ value: 'HTTP', label: 'HTTP' });
      setSelectedVpc(null);
    }
  };

  const showVpcSelector = targetType !== 'lambda';
  const showHealthCheckPath = healthCheckProtocol.value === 'HTTP' || healthCheckProtocol.value === 'HTTPS';

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: 'EC2', href: '/compute/instances' },
          { text: 'Target Groups', href: '/compute/target-groups' },
          { text: 'Create target group', href: '#' },
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
            description="A target group tells a load balancer where to direct traffic to"
          >
            Create target group
          </Header>
        }
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button variant="link" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
              Create target group
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          {/* Target Type Selection */}
          <Container header={<Header variant="h2">Choose a target type</Header>}>
            <Tiles
              value={targetType}
              onChange={({ detail }) => handleTargetTypeChange(detail.value)}
              items={TARGET_TYPES}
              columns={3}
            />
          </Container>

          {/* Basic Configuration */}
          <Container header={<Header variant="h2">Basic configuration</Header>}>
            <SpaceBetween size="l">
              <FormField
                label="Target group name"
                description="The name of the target group"
                errorText={errors.name}
                constraintText="Up to 32 alphanumeric characters or hyphens"
              >
                <Input
                  value={targetGroupName}
                  onChange={({ detail }) => setTargetGroupName(detail.value)}
                  placeholder="my-target-group"
                />
              </FormField>

              {targetType === 'lambda' ? (
                <FormField
                  label="Lambda function"
                  description="Select the Lambda function to register as a target"
                  errorText={errors.lambda}
                >
                  <Select
                    selectedOption={selectedLambda}
                    onChange={({ detail }) =>
                      setSelectedLambda(detail.selectedOption as { value: string; label: string })
                    }
                    options={lambdaOptions}
                    placeholder="Select a Lambda function"
                    filteringType="auto"
                  />
                </FormField>
              ) : (
                <>
                  <ColumnLayout columns={2}>
                    <FormField label="Protocol">
                      <Select
                        selectedOption={protocol}
                        onChange={({ detail }) =>
                          setProtocol(detail.selectedOption as { value: string; label: string })
                        }
                        options={PROTOCOL_OPTIONS}
                      />
                    </FormField>

                    <FormField
                      label="Port"
                      errorText={errors.port}
                    >
                      <Input
                        type="number"
                        value={port}
                        onChange={({ detail }) => setPort(detail.value)}
                        placeholder="80"
                      />
                    </FormField>
                  </ColumnLayout>

                  <FormField label="IP address type">
                    <RadioGroup
                      value={ipAddressType}
                      onChange={({ detail }) => setIpAddressType(detail.value)}
                      items={IP_ADDRESS_TYPES}
                    />
                  </FormField>

                  {(protocol.value === 'HTTP' || protocol.value === 'HTTPS') && (
                    <FormField
                      label="Protocol version"
                      description="The protocol version used when routing traffic to targets"
                    >
                      <Select
                        selectedOption={protocolVersion}
                        onChange={({ detail }) =>
                          setProtocolVersion(detail.selectedOption as { value: string; label: string })
                        }
                        options={PROTOCOL_VERSIONS}
                      />
                    </FormField>
                  )}

                  <FormField
                    label="VPC"
                    description="The VPC containing the targets"
                    errorText={errors.vpc}
                  >
                    <Select
                      selectedOption={selectedVpc}
                      onChange={({ detail }) =>
                        setSelectedVpc(detail.selectedOption as { value: string; label: string })
                      }
                      options={vpcOptions}
                      placeholder="Select a VPC"
                      filteringType="auto"
                    />
                  </FormField>
                </>
              )}
            </SpaceBetween>
          </Container>

          {/* Health Checks - Not for Lambda with ALB invoke */}
          {targetType !== 'lambda' && (
            <Container header={<Header variant="h2">Health checks</Header>}>
              <SpaceBetween size="l">
                <FormField
                  label="Health check protocol"
                  description="The protocol the load balancer uses when performing health checks on targets"
                >
                  <Select
                    selectedOption={healthCheckProtocol}
                    onChange={({ detail }) =>
                      setHealthCheckProtocol(detail.selectedOption as { value: string; label: string })
                    }
                    options={HEALTH_CHECK_PROTOCOLS}
                  />
                </FormField>

                {showHealthCheckPath && (
                  <FormField
                    label="Health check path"
                    description="The ping path for health checks"
                    errorText={errors.healthCheckPath}
                  >
                    <Input
                      value={healthCheckPath}
                      onChange={({ detail }) => setHealthCheckPath(detail.value)}
                      placeholder="/"
                    />
                  </FormField>
                )}

                <ExpandableSection headerText="Advanced health check settings">
                  <SpaceBetween size="l">
                    <FormField
                      label="Port"
                      description="The port the load balancer uses when performing health checks"
                    >
                      <Input
                        value={healthCheckPort}
                        onChange={({ detail }) => setHealthCheckPort(detail.value)}
                        placeholder="traffic-port"
                      />
                    </FormField>

                    <ColumnLayout columns={2}>
                      <FormField
                        label="Healthy threshold"
                        description="Number of consecutive successful health checks required"
                      >
                        <Input
                          type="number"
                          value={healthyThreshold}
                          onChange={({ detail }) => setHealthyThreshold(detail.value)}
                        />
                      </FormField>

                      <FormField
                        label="Unhealthy threshold"
                        description="Number of consecutive failed health checks required"
                      >
                        <Input
                          type="number"
                          value={unhealthyThreshold}
                          onChange={({ detail }) => setUnhealthyThreshold(detail.value)}
                        />
                      </FormField>
                    </ColumnLayout>

                    <ColumnLayout columns={2}>
                      <FormField
                        label="Timeout (seconds)"
                        description="Time to wait for a response"
                      >
                        <Input
                          type="number"
                          value={timeout}
                          onChange={({ detail }) => setTimeout(detail.value)}
                        />
                      </FormField>

                      <FormField
                        label="Interval (seconds)"
                        description="Time between health checks"
                      >
                        <Input
                          type="number"
                          value={interval}
                          onChange={({ detail }) => setInterval(detail.value)}
                        />
                      </FormField>
                    </ColumnLayout>

                    {showHealthCheckPath && (
                      <FormField
                        label="Success codes"
                        description="HTTP codes to use when checking for a successful response"
                      >
                        <Input
                          value={successCodes}
                          onChange={({ detail }) => setSuccessCodes(detail.value)}
                          placeholder="200"
                        />
                      </FormField>
                    )}
                  </SpaceBetween>
                </ExpandableSection>
              </SpaceBetween>
            </Container>
          )}

          {/* Advanced Attributes */}
          <Container header={<Header variant="h2">Attributes</Header>}>
            <SpaceBetween size="l">
              {targetType !== 'lambda' && (
                <>
                  <FormField
                    label="Deregistration delay (seconds)"
                    description="Time to wait before deregistering a draining target"
                  >
                    <Input
                      type="number"
                      value={deregistrationDelay}
                      onChange={({ detail }) => setDeregistrationDelay(detail.value)}
                    />
                  </FormField>

                  <FormField
                    label="Slow start duration (seconds)"
                    description="Time for newly registered targets to warm up (0 to disable)"
                  >
                    <Input
                      type="number"
                      value={slowStartDuration}
                      onChange={({ detail }) => setSlowStartDuration(detail.value)}
                    />
                  </FormField>

                  <Checkbox
                    checked={stickinessEnabled}
                    onChange={({ detail }) => setStickinessEnabled(detail.checked)}
                  >
                    <Box>
                      <Box variant="strong">Stickiness</Box>
                      <Box variant="small" color="text-body-secondary">
                        Route requests from the same client to the same target
                      </Box>
                    </Box>
                  </Checkbox>

                  {stickinessEnabled && (
                    <FormField
                      label="Stickiness duration (seconds)"
                      description="Time period for sticky sessions"
                    >
                      <Input
                        type="number"
                        value={stickinessDuration}
                        onChange={({ detail }) => setStickinessDuration(detail.value)}
                      />
                    </FormField>
                  )}
                </>
              )}

              {targetType === 'lambda' && (
                <Alert type="info">
                  Lambda target groups support multi-value headers by default. Health checks are not
                  configurable for Lambda targets.
                </Alert>
              )}
            </SpaceBetween>
          </Container>

          {/* Preview */}
          <Container header={<Header variant="h2">Summary</Header>}>
            <ColumnLayout columns={2} variant="text-grid">
              <div>
                <Box variant="awsui-key-label">Target group name</Box>
                <Box>{targetGroupName || '-'}</Box>
              </div>
              <div>
                <Box variant="awsui-key-label">Target type</Box>
                <Box>{TARGET_TYPES.find((t) => t.value === targetType)?.label || '-'}</Box>
              </div>
              {targetType === 'lambda' ? (
                <div>
                  <Box variant="awsui-key-label">Lambda function</Box>
                  <Box>{selectedLambda?.label || '-'}</Box>
                </div>
              ) : (
                <>
                  <div>
                    <Box variant="awsui-key-label">Protocol : Port</Box>
                    <Box>{`${protocol.value} : ${port}`}</Box>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">VPC</Box>
                    <Box>{selectedVpc?.label || '-'}</Box>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">Health check</Box>
                    <Box>{`${healthCheckProtocol.value} ${showHealthCheckPath ? healthCheckPath : ''}`}</Box>
                  </div>
                </>
              )}
            </ColumnLayout>
          </Container>
        </SpaceBetween>
      </Form>
    </SpaceBetween>
  );
}
