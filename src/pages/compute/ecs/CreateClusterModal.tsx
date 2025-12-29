import { useState } from 'react';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Tiles from '@cloudscape-design/components/tiles';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Checkbox from '@cloudscape-design/components/checkbox';
import Alert from '@cloudscape-design/components/alert';

interface CreateClusterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (data: CreateClusterData) => void;
}

interface CreateClusterData {
  clusterName: string;
  infrastructureType: string;
  useFargate: boolean;
  useFargateSpot: boolean;
  useEC2: boolean;
}

export function CreateClusterModal({ visible, onDismiss, onCreate }: CreateClusterModalProps) {
  const [clusterName, setClusterName] = useState('');
  const [infrastructureType, setInfrastructureType] = useState('serverless');
  const [useFargate, setUseFargate] = useState(true);
  const [useFargateSpot, setUseFargateSpot] = useState(false);
  const [useEC2, setUseEC2] = useState(false);

  const handleCreate = () => {
    onCreate({
      clusterName,
      infrastructureType,
      useFargate,
      useFargateSpot,
      useEC2,
    });
    resetForm();
  };

  const resetForm = () => {
    setClusterName('');
    setInfrastructureType('serverless');
    setUseFargate(true);
    setUseFargateSpot(false);
    setUseEC2(false);
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size="large"
      header="Create cluster"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={!clusterName}>
              Create
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">Cluster configuration</Header>}>
            <SpaceBetween size="m">
              <FormField label="Cluster name" description="A unique name for your cluster">
                <Input
                  value={clusterName}
                  onChange={({ detail }) => setClusterName(detail.value)}
                  placeholder="my-cluster"
                />
              </FormField>
            </SpaceBetween>
          </Container>

          <Container header={<Header variant="h2">Infrastructure</Header>}>
            <SpaceBetween size="m">
              <Tiles
                value={infrastructureType}
                onChange={({ detail }) => setInfrastructureType(detail.value)}
                items={[
                  {
                    value: 'serverless',
                    label: 'AWS Fargate (serverless)',
                    description: 'Run containers without managing servers or clusters of EC2 instances',
                  },
                  {
                    value: 'ec2',
                    label: 'Amazon EC2 instances',
                    description: 'Register EC2 instances as container instances to run tasks',
                  },
                  {
                    value: 'external',
                    label: 'External instances using ECS Anywhere',
                    description: 'Register on-premises servers or VMs as container instances',
                  },
                ]}
              />

              {infrastructureType === 'serverless' && (
                <SpaceBetween size="s">
                  <Checkbox checked={useFargate} onChange={({ detail }) => setUseFargate(detail.checked)}>
                    AWS Fargate
                  </Checkbox>
                  <Checkbox
                    checked={useFargateSpot}
                    onChange={({ detail }) => setUseFargateSpot(detail.checked)}
                  >
                    AWS Fargate Spot (up to 70% discount)
                  </Checkbox>
                </SpaceBetween>
              )}

              {infrastructureType === 'ec2' && (
                <Alert type="info">
                  You can configure Auto Scaling groups and EC2 instance types after the cluster is created.
                </Alert>
              )}
            </SpaceBetween>
          </Container>

          <Container header={<Header variant="h2">Monitoring - optional</Header>}>
            <SpaceBetween size="s">
              <Checkbox checked={true} disabled>
                Use Container Insights
              </Checkbox>
              <Box color="text-body-secondary" fontSize="body-s">
                Collect, aggregate, and summarize metrics and logs from your containerized applications.
              </Box>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
