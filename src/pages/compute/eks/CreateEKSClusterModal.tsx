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
import Alert from '@cloudscape-design/components/alert';

interface CreateEKSClusterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (data: CreateEKSClusterData) => void;
}

interface CreateEKSClusterData {
  clusterName: string;
  version: string;
  roleArn: string;
  vpcId: string;
  subnets: string[];
  securityGroups: string[];
}

const K8S_VERSIONS = [
  { value: '1.29', label: '1.29 (Default)' },
  { value: '1.28', label: '1.28' },
  { value: '1.27', label: '1.27' },
  { value: '1.26', label: '1.26' },
];

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

export function CreateEKSClusterModal({ visible, onDismiss, onCreate }: CreateEKSClusterModalProps) {
  const [clusterName, setClusterName] = useState('');
  const [version, setVersion] = useState<{ value: string; label: string } | null>(K8S_VERSIONS[0]);
  const [roleArn, setRoleArn] = useState('');
  const [vpcId, setVpcId] = useState<{ value: string; label: string } | null>(null);
  const [subnets, setSubnets] = useState<Array<{ value: string; label: string }>>([]);
  const [securityGroups, setSecurityGroups] = useState<Array<{ value: string; label: string }>>([]);

  const handleCreate = () => {
    onCreate({
      clusterName,
      version: version?.value || '1.29',
      roleArn,
      vpcId: vpcId?.value || '',
      subnets: subnets.map((s) => s.value),
      securityGroups: securityGroups.map((sg) => sg.value),
    });
    resetForm();
  };

  const resetForm = () => {
    setClusterName('');
    setVersion(K8S_VERSIONS[0]);
    setRoleArn('');
    setVpcId(null);
    setSubnets([]);
    setSecurityGroups([]);
  };

  const isValid = clusterName && version && roleArn && vpcId && subnets.length >= 2;

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size="large"
      header="Create EKS cluster"
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
          <Alert type="info">
            Creating a cluster takes approximately 10-15 minutes. You can add node groups after the cluster is created.
          </Alert>

          <Container header={<Header variant="h2">Cluster configuration</Header>}>
            <SpaceBetween size="m">
              <ColumnLayout columns={2}>
                <FormField label="Cluster name" description="A unique name for your cluster">
                  <Input
                    value={clusterName}
                    onChange={({ detail }) => setClusterName(detail.value)}
                    placeholder="my-eks-cluster"
                  />
                </FormField>

                <FormField label="Kubernetes version">
                  <Select
                    selectedOption={version}
                    onChange={({ detail }) => setVersion(detail.selectedOption as typeof version)}
                    options={K8S_VERSIONS}
                  />
                </FormField>
              </ColumnLayout>

              <FormField
                label="Cluster service role"
                description="IAM role that allows EKS to manage AWS resources"
              >
                <Input
                  value={roleArn}
                  onChange={({ detail }) => setRoleArn(detail.value)}
                  placeholder="arn:aws:iam::123456789:role/eks-cluster-role"
                />
              </FormField>
            </SpaceBetween>
          </Container>

          <Container header={<Header variant="h2">Networking</Header>}>
            <SpaceBetween size="m">
              <FormField label="VPC" description="The VPC where the cluster will be created">
                <Select
                  selectedOption={vpcId}
                  onChange={({ detail }) => setVpcId(detail.selectedOption as typeof vpcId)}
                  options={VPCS}
                  placeholder="Select a VPC"
                />
              </FormField>

              <FormField
                label="Subnets"
                description="Select at least 2 subnets in different availability zones"
              >
                <Multiselect
                  selectedOptions={subnets}
                  onChange={({ detail }) => setSubnets(detail.selectedOptions as typeof subnets)}
                  options={SUBNETS}
                  placeholder="Select subnets"
                />
              </FormField>

              <FormField label="Security groups" description="Optional additional security groups">
                <Multiselect
                  selectedOptions={securityGroups}
                  onChange={({ detail }) =>
                    setSecurityGroups(detail.selectedOptions as typeof securityGroups)
                  }
                  options={SECURITY_GROUPS}
                  placeholder="Select security groups"
                />
              </FormField>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
