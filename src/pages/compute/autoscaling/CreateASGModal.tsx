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
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Multiselect from '@cloudscape-design/components/multiselect';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Slider from '@cloudscape-design/components/slider';

interface CreateASGModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (data: CreateASGData) => void;
}

interface CreateASGData {
  name: string;
  launchTemplate: string;
  minSize: number;
  maxSize: number;
  desiredCapacity: number;
  availabilityZones: string[];
  healthCheckType: string;
  healthCheckGracePeriod: number;
}

const LAUNCH_TEMPLATES = [
  { value: 'web-server-template-v2', label: 'web-server-template-v2' },
  { value: 'api-server-template-v3', label: 'api-server-template-v3' },
  { value: 'worker-template-v1', label: 'worker-template-v1' },
];

const AVAILABILITY_ZONES = [
  { value: 'us-east-1a', label: 'us-east-1a' },
  { value: 'us-east-1b', label: 'us-east-1b' },
  { value: 'us-east-1c', label: 'us-east-1c' },
  { value: 'us-east-1d', label: 'us-east-1d' },
];

export function CreateASGModal({ visible, onDismiss, onCreate }: CreateASGModalProps) {
  const [name, setName] = useState('');
  const [launchTemplate, setLaunchTemplate] = useState<{ value: string; label: string } | null>(null);
  const [minSize, setMinSize] = useState(1);
  const [maxSize, setMaxSize] = useState(4);
  const [desiredCapacity, setDesiredCapacity] = useState(2);
  const [availabilityZones, setAvailabilityZones] = useState<Array<{ value: string; label: string }>>([]);
  const [healthCheckType, setHealthCheckType] = useState('EC2');
  const [healthCheckGracePeriod, setHealthCheckGracePeriod] = useState(300);

  const handleCreate = () => {
    onCreate({
      name,
      launchTemplate: launchTemplate?.value || '',
      minSize,
      maxSize,
      desiredCapacity,
      availabilityZones: availabilityZones.map((az) => az.value),
      healthCheckType,
      healthCheckGracePeriod,
    });
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setLaunchTemplate(null);
    setMinSize(1);
    setMaxSize(4);
    setDesiredCapacity(2);
    setAvailabilityZones([]);
    setHealthCheckType('EC2');
    setHealthCheckGracePeriod(300);
  };

  const isValid = name && launchTemplate && availabilityZones.length > 0;

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size="large"
      header="Create Auto Scaling group"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={!isValid}>
              Create
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">Choose launch template</Header>}>
            <SpaceBetween size="m">
              <FormField label="Auto Scaling group name">
                <Input
                  value={name}
                  onChange={({ detail }) => setName(detail.value)}
                  placeholder="my-asg"
                />
              </FormField>

              <FormField label="Launch template">
                <Select
                  selectedOption={launchTemplate}
                  onChange={({ detail }) =>
                    setLaunchTemplate(detail.selectedOption as typeof launchTemplate)
                  }
                  options={LAUNCH_TEMPLATES}
                  placeholder="Select a launch template"
                />
              </FormField>
            </SpaceBetween>
          </Container>

          <Container header={<Header variant="h2">Network</Header>}>
            <FormField
              label="Availability zones"
              description="Select at least one availability zone"
            >
              <Multiselect
                selectedOptions={availabilityZones}
                onChange={({ detail }) =>
                  setAvailabilityZones(detail.selectedOptions as typeof availabilityZones)
                }
                options={AVAILABILITY_ZONES}
                placeholder="Select availability zones"
              />
            </FormField>
          </Container>

          <Container header={<Header variant="h2">Group size</Header>}>
            <ColumnLayout columns={3}>
              <FormField label="Minimum capacity">
                <Input
                  value={minSize.toString()}
                  onChange={({ detail }) => setMinSize(parseInt(detail.value) || 0)}
                  type="number"
                />
              </FormField>

              <FormField label="Desired capacity">
                <Input
                  value={desiredCapacity.toString()}
                  onChange={({ detail }) => setDesiredCapacity(parseInt(detail.value) || 0)}
                  type="number"
                />
              </FormField>

              <FormField label="Maximum capacity">
                <Input
                  value={maxSize.toString()}
                  onChange={({ detail }) => setMaxSize(parseInt(detail.value) || 0)}
                  type="number"
                />
              </FormField>
            </ColumnLayout>
          </Container>

          <Container header={<Header variant="h2">Health checks</Header>}>
            <SpaceBetween size="m">
              <FormField label="Health check type">
                <RadioGroup
                  value={healthCheckType}
                  onChange={({ detail }) => setHealthCheckType(detail.value)}
                  items={[
                    { value: 'EC2', label: 'EC2', description: 'Uses EC2 status checks' },
                    {
                      value: 'ELB',
                      label: 'ELB',
                      description: 'Uses Elastic Load Balancing health checks',
                    },
                  ]}
                />
              </FormField>

              <FormField
                label="Health check grace period"
                description="Time (in seconds) to wait before checking instance health"
              >
                <SpaceBetween size="s">
                  <Slider
                    value={healthCheckGracePeriod}
                    onChange={({ detail }) => setHealthCheckGracePeriod(detail.value)}
                    min={0}
                    max={3600}
                    step={60}
                  />
                  <Box>{healthCheckGracePeriod} seconds</Box>
                </SpaceBetween>
              </FormField>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
