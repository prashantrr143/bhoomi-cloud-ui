import { useState } from 'react';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Textarea from '@cloudscape-design/components/textarea';
import Tiles from '@cloudscape-design/components/tiles';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import ColumnLayout from '@cloudscape-design/components/column-layout';

interface CreateFunctionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (data: CreateFunctionData) => void;
}

interface CreateFunctionData {
  functionName: string;
  description: string;
  runtime: string;
  handler: string;
  memorySize: number;
  timeout: number;
  codeSource: string;
}

const RUNTIMES = [
  { value: 'nodejs20.x', label: 'Node.js 20.x' },
  { value: 'nodejs18.x', label: 'Node.js 18.x' },
  { value: 'python3.12', label: 'Python 3.12' },
  { value: 'python3.11', label: 'Python 3.11' },
  { value: 'python3.10', label: 'Python 3.10' },
  { value: 'java21', label: 'Java 21' },
  { value: 'java17', label: 'Java 17' },
  { value: 'go1.x', label: 'Go 1.x' },
  { value: 'dotnet8', label: '.NET 8' },
  { value: 'dotnet6', label: '.NET 6' },
];

const MEMORY_OPTIONS = [
  { value: '128', label: '128 MB' },
  { value: '256', label: '256 MB' },
  { value: '512', label: '512 MB' },
  { value: '1024', label: '1024 MB' },
  { value: '2048', label: '2048 MB' },
  { value: '3072', label: '3072 MB' },
  { value: '4096', label: '4096 MB' },
];

export function CreateFunctionModal({ visible, onDismiss, onCreate }: CreateFunctionModalProps) {
  const [functionName, setFunctionName] = useState('');
  const [description, setDescription] = useState('');
  const [runtime, setRuntime] = useState<{ value: string; label: string } | null>(RUNTIMES[0]);
  const [handler, setHandler] = useState('index.handler');
  const [memorySize, setMemorySize] = useState<{ value: string; label: string } | null>(MEMORY_OPTIONS[2]);
  const [timeout, setTimeout] = useState('30');
  const [codeSource, setCodeSource] = useState('scratch');

  const handleCreate = () => {
    onCreate({
      functionName,
      description,
      runtime: runtime?.value || 'nodejs20.x',
      handler,
      memorySize: parseInt(memorySize?.value || '512'),
      timeout: parseInt(timeout),
      codeSource,
    });
    resetForm();
  };

  const resetForm = () => {
    setFunctionName('');
    setDescription('');
    setRuntime(RUNTIMES[0]);
    setHandler('index.handler');
    setMemorySize(MEMORY_OPTIONS[2]);
    setTimeout('30');
    setCodeSource('scratch');
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size="large"
      header="Create function"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={!functionName}>
              Create function
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">Basic information</Header>}>
            <SpaceBetween size="m">
              <FormField label="Function name" description="The name of your Lambda function">
                <Input
                  value={functionName}
                  onChange={({ detail }) => setFunctionName(detail.value)}
                  placeholder="my-function"
                />
              </FormField>

              <FormField label="Description" description="Optional description for your function">
                <Textarea
                  value={description}
                  onChange={({ detail }) => setDescription(detail.value)}
                  placeholder="A brief description of what the function does"
                />
              </FormField>
            </SpaceBetween>
          </Container>

          <Container header={<Header variant="h2">Code source</Header>}>
            <Tiles
              value={codeSource}
              onChange={({ detail }) => setCodeSource(detail.value)}
              items={[
                {
                  value: 'scratch',
                  label: 'Author from scratch',
                  description: 'Start with a simple Hello World example',
                },
                {
                  value: 'blueprint',
                  label: 'Use a blueprint',
                  description: 'Build from a sample application',
                },
                {
                  value: 'container',
                  label: 'Container image',
                  description: 'Deploy a container image',
                },
                {
                  value: 's3',
                  label: 'Amazon S3 location',
                  description: 'Upload from S3',
                },
              ]}
            />
          </Container>

          <Container header={<Header variant="h2">Runtime settings</Header>}>
            <ColumnLayout columns={2}>
              <FormField label="Runtime">
                <Select
                  selectedOption={runtime}
                  onChange={({ detail }) => setRuntime(detail.selectedOption as typeof runtime)}
                  options={RUNTIMES}
                />
              </FormField>

              <FormField
                label="Handler"
                description="The method in your code that processes events"
              >
                <Input
                  value={handler}
                  onChange={({ detail }) => setHandler(detail.value)}
                  placeholder="index.handler"
                />
              </FormField>
            </ColumnLayout>
          </Container>

          <Container header={<Header variant="h2">Configuration</Header>}>
            <ColumnLayout columns={2}>
              <FormField label="Memory" description="Amount of memory available to your function">
                <Select
                  selectedOption={memorySize}
                  onChange={({ detail }) => setMemorySize(detail.selectedOption as typeof memorySize)}
                  options={MEMORY_OPTIONS}
                />
              </FormField>

              <FormField
                label="Timeout"
                description="Maximum execution time (1-900 seconds)"
              >
                <Input
                  value={timeout}
                  onChange={({ detail }) => setTimeout(detail.value)}
                  type="number"
                  inputMode="numeric"
                />
              </FormField>
            </ColumnLayout>
          </Container>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
