import { useState } from 'react';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Tiles from '@cloudscape-design/components/tiles';
import Multiselect from '@cloudscape-design/components/multiselect';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Alert from '@cloudscape-design/components/alert';

interface CreateLoadBalancerModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (data: CreateLoadBalancerData) => void;
}

interface CreateLoadBalancerData {
  name: string;
  type: string;
  scheme: string;
  vpcId: string;
  subnets: string[];
  securityGroups: string[];
}

const VPCS = [
  { value: 'vpc-0a1b2c3d4e5f6g7h8', label: 'production-vpc (10.0.0.0/16)' },
  { value: 'vpc-1b2c3d4e5f6g7h8i', label: 'development-vpc (172.16.0.0/16)' },
];

const SUBNETS = [
  { value: 'subnet-0a1b2c3d4e5f6g7h8', label: 'public-subnet-1a (us-east-1a)' },
  { value: 'subnet-1b2c3d4e5f6g7h8i', label: 'public-subnet-1b (us-east-1b)' },
  { value: 'subnet-2c3d4e5f6g7h8i9j', label: 'private-subnet-1a (us-east-1a)' },
  { value: 'subnet-3d4e5f6g7h8i9j0k', label: 'private-subnet-1b (us-east-1b)' },
];

const SECURITY_GROUPS = [
  { value: 'sg-0a1b2c3d4e5f6g7h8', label: 'web-server-sg' },
  { value: 'sg-1b2c3d4e5f6g7h8i', label: 'db-server-sg' },
  { value: 'sg-2c3d4e5f6g7h8i9j', label: 'default' },
];

export function CreateLoadBalancerModal({ visible, onDismiss, onCreate }: CreateLoadBalancerModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('application');
  const [scheme, setScheme] = useState('internet-facing');
  const [vpcId, setVpcId] = useState<{ value: string; label: string } | null>(null);
  const [subnets, setSubnets] = useState<Array<{ value: string; label: string }>>([]);
  const [securityGroups, setSecurityGroups] = useState<Array<{ value: string; label: string }>>([]);

  const handleCreate = () => {
    onCreate({
      name,
      type,
      scheme,
      vpcId: vpcId?.value || '',
      subnets: subnets.map((s) => s.value),
      securityGroups: securityGroups.map((sg) => sg.value),
    });
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setType('application');
    setScheme('internet-facing');
    setVpcId(null);
    setSubnets([]);
    setSecurityGroups([]);
  };

  const isValid = name && vpcId && subnets.length >= 2;

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size="large"
      header="Create load balancer"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={!isValid}>
              Create load balancer
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">Load balancer type</Header>}>
            <Tiles
              value={type}
              onChange={({ detail }) => setType(detail.value)}
              items={[
                {
                  value: 'application',
                  label: 'Application Load Balancer',
                  description: 'HTTP/HTTPS traffic, Layer 7, path-based routing',
                },
                {
                  value: 'network',
                  label: 'Network Load Balancer',
                  description: 'TCP/UDP/TLS traffic, Layer 4, ultra-low latency',
                },
                {
                  value: 'gateway',
                  label: 'Gateway Load Balancer',
                  description: 'Third-party virtual appliances',
                },
              ]}
            />
          </Container>

          <Container header={<Header variant="h2">Basic configuration</Header>}>
            <SpaceBetween size="m">
              <FormField label="Load balancer name">
                <Input
                  value={name}
                  onChange={({ detail }) => setName(detail.value)}
                  placeholder="my-load-balancer"
                />
              </FormField>

              <FormField label="Scheme">
                <RadioGroup
                  value={scheme}
                  onChange={({ detail }) => setScheme(detail.value)}
                  items={[
                    {
                      value: 'internet-facing',
                      label: 'Internet-facing',
                      description: 'Routes requests from clients over the internet',
                    },
                    {
                      value: 'internal',
                      label: 'Internal',
                      description: 'Routes requests from clients with access to the VPC',
                    },
                  ]}
                />
              </FormField>
            </SpaceBetween>
          </Container>

          <Container header={<Header variant="h2">Network mapping</Header>}>
            <SpaceBetween size="m">
              <FormField label="VPC">
                <Select
                  selectedOption={vpcId}
                  onChange={({ detail }) => setVpcId(detail.selectedOption as typeof vpcId)}
                  options={VPCS}
                  placeholder="Select a VPC"
                />
              </FormField>

              <FormField
                label="Mappings"
                description="Select at least two subnets in different availability zones"
              >
                <Multiselect
                  selectedOptions={subnets}
                  onChange={({ detail }) => setSubnets(detail.selectedOptions as typeof subnets)}
                  options={SUBNETS}
                  placeholder="Select subnets"
                />
              </FormField>

              {type === 'application' && (
                <FormField label="Security groups">
                  <Multiselect
                    selectedOptions={securityGroups}
                    onChange={({ detail }) =>
                      setSecurityGroups(detail.selectedOptions as typeof securityGroups)
                    }
                    options={SECURITY_GROUPS}
                    placeholder="Select security groups"
                  />
                </FormField>
              )}
            </SpaceBetween>
          </Container>

          <Alert type="info">
            After creating the load balancer, you'll need to configure listeners and target groups
            to route traffic to your targets.
          </Alert>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
