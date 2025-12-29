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
import Textarea from '@cloudscape-design/components/textarea';
import { vpcs } from '@/data/mockData';

interface SecurityGroupRule {
  id: string;
  type: { value: string; label: string } | null;
  protocol: { value: string; label: string } | null;
  portRange: string;
  source: string;
  description: string;
}

const RULE_TYPES = [
  { value: 'custom-tcp', label: 'Custom TCP' },
  { value: 'custom-udp', label: 'Custom UDP' },
  { value: 'custom-icmp', label: 'Custom ICMP - IPv4' },
  { value: 'all-traffic', label: 'All traffic' },
  { value: 'ssh', label: 'SSH' },
  { value: 'rdp', label: 'RDP' },
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'mysql', label: 'MySQL/Aurora' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mssql', label: 'MSSQL' },
  { value: 'smtp', label: 'SMTP' },
  { value: 'smtps', label: 'SMTPS' },
  { value: 'pop3', label: 'POP3' },
  { value: 'imap', label: 'IMAP' },
  { value: 'dns-tcp', label: 'DNS (TCP)' },
  { value: 'dns-udp', label: 'DNS (UDP)' },
  { value: 'nfs', label: 'NFS' },
  { value: 'ldap', label: 'LDAP' },
];

const PROTOCOL_OPTIONS = [
  { value: 'tcp', label: 'TCP' },
  { value: 'udp', label: 'UDP' },
  { value: 'icmp', label: 'ICMP' },
  { value: 'all', label: 'All' },
];

const SOURCE_TYPE_OPTIONS = [
  { value: 'anywhere-ipv4', label: 'Anywhere-IPv4 (0.0.0.0/0)' },
  { value: 'anywhere-ipv6', label: 'Anywhere-IPv6 (::/0)' },
  { value: 'my-ip', label: 'My IP' },
  { value: 'custom', label: 'Custom' },
];

// Map rule types to their default port and protocol
const RULE_TYPE_CONFIG: Record<string, { port: string; protocol: string }> = {
  'ssh': { port: '22', protocol: 'tcp' },
  'rdp': { port: '3389', protocol: 'tcp' },
  'http': { port: '80', protocol: 'tcp' },
  'https': { port: '443', protocol: 'tcp' },
  'mysql': { port: '3306', protocol: 'tcp' },
  'postgresql': { port: '5432', protocol: 'tcp' },
  'mssql': { port: '1433', protocol: 'tcp' },
  'smtp': { port: '25', protocol: 'tcp' },
  'smtps': { port: '465', protocol: 'tcp' },
  'pop3': { port: '110', protocol: 'tcp' },
  'imap': { port: '143', protocol: 'tcp' },
  'dns-tcp': { port: '53', protocol: 'tcp' },
  'dns-udp': { port: '53', protocol: 'udp' },
  'nfs': { port: '2049', protocol: 'tcp' },
  'ldap': { port: '389', protocol: 'tcp' },
  'all-traffic': { port: 'All', protocol: 'all' },
};

const createEmptyRule = (): SecurityGroupRule => ({
  id: String(Date.now()),
  type: null,
  protocol: null,
  portRange: '',
  source: '',
  description: '',
});

export function CreateSecurityGroupPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic settings
  const [securityGroupName, setSecurityGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVpc, setSelectedVpc] = useState<{ value: string; label: string } | null>(null);

  // Rules
  const [inboundRules, setInboundRules] = useState<SecurityGroupRule[]>([]);
  const [outboundRules, setOutboundRules] = useState<SecurityGroupRule[]>([
    {
      id: 'default-outbound',
      type: { value: 'all-traffic', label: 'All traffic' },
      protocol: { value: 'all', label: 'All' },
      portRange: 'All',
      source: '0.0.0.0/0',
      description: 'Allow all outbound traffic',
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!securityGroupName.trim()) {
      newErrors.name = 'Security group name is required';
    } else if (!/^[a-zA-Z0-9\-_]+$/.test(securityGroupName)) {
      newErrors.name = 'Name can only contain alphanumeric characters, hyphens, and underscores';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!selectedVpc) {
      newErrors.vpc = 'Please select a VPC';
    }

    // Validate inbound rules
    inboundRules.forEach((rule, index) => {
      if (!rule.type) {
        newErrors[`inbound-${index}-type`] = 'Rule type is required';
      }
      if (!rule.source) {
        newErrors[`inbound-${index}-source`] = 'Source is required';
      }
    });

    // Validate outbound rules
    outboundRules.forEach((rule, index) => {
      if (!rule.type) {
        newErrors[`outbound-${index}-type`] = 'Rule type is required';
      }
      if (!rule.source) {
        newErrors[`outbound-${index}-destination`] = 'Destination is required';
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
    navigate('/networking/security-groups', {
      state: { message: 'Security group created successfully' },
    });
  };

  const handleCancel = () => {
    navigate('/networking/security-groups');
  };

  const addInboundRule = () => {
    setInboundRules([...inboundRules, createEmptyRule()]);
  };

  const removeInboundRule = (id: string) => {
    setInboundRules(inboundRules.filter((r) => r.id !== id));
  };

  const updateInboundRule = (id: string, field: keyof SecurityGroupRule, value: unknown) => {
    setInboundRules(
      inboundRules.map((r) => {
        if (r.id !== id) return r;

        const updated = { ...r, [field]: value };

        // Auto-fill port and protocol based on rule type
        if (field === 'type' && value) {
          const typeValue = (value as { value: string }).value;
          const config = RULE_TYPE_CONFIG[typeValue];
          if (config) {
            updated.portRange = config.port;
            updated.protocol = PROTOCOL_OPTIONS.find((p) => p.value === config.protocol) || null;
          } else {
            updated.portRange = '';
            updated.protocol = null;
          }
        }

        return updated;
      })
    );
  };

  const addOutboundRule = () => {
    setOutboundRules([...outboundRules, createEmptyRule()]);
  };

  const removeOutboundRule = (id: string) => {
    setOutboundRules(outboundRules.filter((r) => r.id !== id));
  };

  const updateOutboundRule = (id: string, field: keyof SecurityGroupRule, value: unknown) => {
    setOutboundRules(
      outboundRules.map((r) => {
        if (r.id !== id) return r;

        const updated = { ...r, [field]: value };

        // Auto-fill port and protocol based on rule type
        if (field === 'type' && value) {
          const typeValue = (value as { value: string }).value;
          const config = RULE_TYPE_CONFIG[typeValue];
          if (config) {
            updated.portRange = config.port;
            updated.protocol = PROTOCOL_OPTIONS.find((p) => p.value === config.protocol) || null;
          } else {
            updated.portRange = '';
            updated.protocol = null;
          }
        }

        return updated;
      })
    );
  };

  const renderRuleForm = (
    rules: SecurityGroupRule[],
    updateRule: (id: string, field: keyof SecurityGroupRule, value: unknown) => void,
    removeRule: (id: string) => void,
    addRule: () => void,
    ruleType: 'inbound' | 'outbound'
  ) => (
    <SpaceBetween size="m">
      {rules.length === 0 ? (
        <Box textAlign="center" color="text-body-secondary" padding="l">
          No {ruleType} rules. Click "Add rule" to add one.
        </Box>
      ) : (
        rules.map((rule, index) => (
          <Container
            key={rule.id}
            header={
              <Header
                variant="h3"
                actions={
                  <Button
                    variant="icon"
                    iconName="remove"
                    onClick={() => removeRule(rule.id)}
                    ariaLabel="Remove rule"
                  />
                }
              >
                Rule {index + 1}
              </Header>
            }
          >
            <ColumnLayout columns={2}>
              <FormField
                label="Type"
                errorText={errors[`${ruleType}-${index}-type`]}
              >
                <Select
                  selectedOption={rule.type}
                  onChange={({ detail }) =>
                    updateRule(rule.id, 'type', detail.selectedOption)
                  }
                  options={RULE_TYPES}
                  placeholder="Select rule type"
                  filteringType="auto"
                />
              </FormField>

              <FormField label="Protocol">
                <Select
                  selectedOption={rule.protocol}
                  onChange={({ detail }) =>
                    updateRule(rule.id, 'protocol', detail.selectedOption)
                  }
                  options={PROTOCOL_OPTIONS}
                  placeholder="Select protocol"
                  disabled={!!rule.type && !!RULE_TYPE_CONFIG[rule.type.value]}
                />
              </FormField>

              <FormField label="Port range">
                <Input
                  value={rule.portRange}
                  onChange={({ detail }) =>
                    updateRule(rule.id, 'portRange', detail.value)
                  }
                  placeholder="e.g., 22 or 1024-65535"
                  disabled={!!rule.type && !!RULE_TYPE_CONFIG[rule.type.value]}
                />
              </FormField>

              <FormField
                label={ruleType === 'inbound' ? 'Source' : 'Destination'}
                constraintText="CIDR block, security group, or prefix list"
                errorText={errors[`${ruleType}-${index}-${ruleType === 'inbound' ? 'source' : 'destination'}`]}
              >
                <Input
                  value={rule.source}
                  onChange={({ detail }) =>
                    updateRule(rule.id, 'source', detail.value)
                  }
                  placeholder="0.0.0.0/0 or sg-xxxxxx"
                />
              </FormField>

              <FormField label="Description" stretch>
                <Input
                  value={rule.description}
                  onChange={({ detail }) =>
                    updateRule(rule.id, 'description', detail.value)
                  }
                  placeholder="Optional description for this rule"
                />
              </FormField>
            </ColumnLayout>
          </Container>
        ))
      )}
      <Button onClick={addRule} iconName="add-plus">
        Add rule
      </Button>
    </SpaceBetween>
  );

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: 'Security Groups', href: '/networking/security-groups' },
          { text: 'Create security group', href: '#' },
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
            description="A security group acts as a virtual firewall for your instances"
          >
            Create security group
          </Header>
        }
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button variant="link" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
              Create security group
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          {/* Basic Details */}
          <Container header={<Header variant="h2">Basic details</Header>}>
            <SpaceBetween size="l">
              <FormField
                label="Security group name"
                description="A unique name to identify this security group"
                errorText={errors.name}
                constraintText="Can contain alphanumeric characters, hyphens, and underscores"
              >
                <Input
                  value={securityGroupName}
                  onChange={({ detail }) => setSecurityGroupName(detail.value)}
                  placeholder="my-security-group"
                />
              </FormField>

              <FormField
                label="Description"
                description="A brief description of this security group"
                errorText={errors.description}
                constraintText="Maximum 255 characters"
              >
                <Textarea
                  value={description}
                  onChange={({ detail }) => setDescription(detail.value)}
                  placeholder="Security group for web servers"
                  rows={2}
                />
              </FormField>

              <FormField
                label="VPC"
                description="The VPC where this security group will be created"
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
            </SpaceBetween>
          </Container>

          {/* Inbound Rules */}
          <Container
            header={
              <Header
                variant="h2"
                description="Inbound rules control the incoming traffic to your instances"
              >
                Inbound rules
              </Header>
            }
          >
            {renderRuleForm(
              inboundRules,
              updateInboundRule,
              removeInboundRule,
              addInboundRule,
              'inbound'
            )}
          </Container>

          {/* Outbound Rules */}
          <Container
            header={
              <Header
                variant="h2"
                description="Outbound rules control the outgoing traffic from your instances"
              >
                Outbound rules
              </Header>
            }
          >
            {renderRuleForm(
              outboundRules,
              updateOutboundRule,
              removeOutboundRule,
              addOutboundRule,
              'outbound'
            )}
          </Container>

          {/* Info Alert */}
          <Alert type="info" header="Security group rules">
            <SpaceBetween size="xs">
              <Box>Security group rules are stateful:</Box>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>If you allow inbound traffic, the response is automatically allowed outbound</li>
                <li>If you allow outbound traffic, the response is automatically allowed inbound</li>
              </ul>
              <Box>
                By default, security groups allow all outbound traffic and deny all inbound traffic.
              </Box>
            </SpaceBetween>
          </Alert>

          {/* Preview */}
          <Container header={<Header variant="h2">Preview</Header>}>
            <ColumnLayout columns={2} variant="text-grid">
              <div>
                <Box variant="awsui-key-label">Security group name</Box>
                <Box>{securityGroupName || '-'}</Box>
              </div>
              <div>
                <Box variant="awsui-key-label">VPC</Box>
                <Box>{selectedVpc?.label || '-'}</Box>
              </div>
              <div>
                <Box variant="awsui-key-label">Description</Box>
                <Box>{description || '-'}</Box>
              </div>
              <div>
                <Box variant="awsui-key-label">Rules</Box>
                <Box>
                  {inboundRules.length} inbound, {outboundRules.length} outbound
                </Box>
              </div>
            </ColumnLayout>
          </Container>
        </SpaceBetween>
      </Form>
    </SpaceBetween>
  );
}
