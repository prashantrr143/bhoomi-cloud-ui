import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Button from '@cloudscape-design/components/button';
import Checkbox from '@cloudscape-design/components/checkbox';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Multiselect from '@cloudscape-design/components/multiselect';
import { vpcs, subnets, internetGateways, natGateways } from '@/data/mockData';

interface RouteConfig {
  id: string;
  destination: string;
  targetType: { value: string; label: string } | null;
  target: { value: string; label: string } | null;
}

const TARGET_TYPES = [
  { value: 'local', label: 'Local' },
  { value: 'igw', label: 'Internet Gateway' },
  { value: 'nat', label: 'NAT Gateway' },
  { value: 'instance', label: 'Instance' },
  { value: 'vpc-peering', label: 'VPC Peering Connection' },
  { value: 'transit-gateway', label: 'Transit Gateway' },
  { value: 'vpc-endpoint', label: 'VPC Endpoint' },
  { value: 'network-interface', label: 'Network Interface' },
];

const createEmptyRoute = (): RouteConfig => ({
  id: String(Date.now()),
  destination: '',
  targetType: null,
  target: null,
});

export function CreateRouteTablePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic settings
  const [routeTableName, setRouteTableName] = useState('');
  const [selectedVpc, setSelectedVpc] = useState<{ value: string; label: string } | null>(null);

  // Routes - start with the local route which is always present
  const [routes, setRoutes] = useState<RouteConfig[]>([]);

  // Subnet associations
  const [selectedSubnets, setSelectedSubnets] = useState<readonly { value: string; label: string }[]>([]);

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

  // Filter subnets for selected VPC
  const subnetOptions = useMemo(() => {
    if (!selectedVpc) return [];
    return subnets
      .filter((subnet) => subnet.vpcId === selectedVpc.value)
      .map((subnet) => ({
        value: subnet.id,
        label: `${subnet.name} (${subnet.id})`,
        description: `${subnet.cidrBlock} - ${subnet.availabilityZone}`,
      }));
  }, [selectedVpc]);

  // Get target options based on target type and selected VPC
  const getTargetOptions = (targetType: string | undefined) => {
    if (!targetType || !selectedVpc) return [];

    switch (targetType) {
      case 'local':
        return [{ value: 'local', label: 'local' }];
      case 'igw':
        return internetGateways
          .filter((igw) => igw.vpcId === selectedVpc.value)
          .map((igw) => ({
            value: igw.id,
            label: `${igw.name} (${igw.id})`,
          }));
      case 'nat':
        return natGateways
          .filter((nat) => nat.vpcId === selectedVpc.value)
          .map((nat) => ({
            value: nat.id,
            label: `${nat.name} (${nat.id})`,
          }));
      default:
        return [];
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!routeTableName.trim()) {
      newErrors.name = 'Route table name is required';
    }

    if (!selectedVpc) {
      newErrors.vpc = 'Please select a VPC';
    }

    // Validate routes
    routes.forEach((route, index) => {
      if (!route.destination) {
        newErrors[`route-${index}-destination`] = 'Destination is required';
      } else {
        // Validate CIDR format
        const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
        if (!cidrRegex.test(route.destination)) {
          newErrors[`route-${index}-destination`] = 'Invalid CIDR format';
        }
      }

      if (!route.targetType) {
        newErrors[`route-${index}-targetType`] = 'Target type is required';
      }

      if (!route.target) {
        newErrors[`route-${index}-target`] = 'Target is required';
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
    navigate('/networking/route-tables', {
      state: { message: 'Route table created successfully' },
    });
  };

  const handleCancel = () => {
    navigate('/networking/route-tables');
  };

  const addRoute = () => {
    setRoutes([...routes, createEmptyRoute()]);
  };

  const removeRoute = (id: string) => {
    setRoutes(routes.filter((r) => r.id !== id));
  };

  const updateRoute = (id: string, field: keyof RouteConfig, value: unknown) => {
    setRoutes(
      routes.map((r) => {
        if (r.id !== id) return r;

        const updated = { ...r, [field]: value };

        // Reset target when target type changes
        if (field === 'targetType') {
          updated.target = null;
        }

        return updated;
      })
    );
  };

  // When VPC changes, reset routes and subnet selections
  const handleVpcChange = (vpc: { value: string; label: string } | null) => {
    setSelectedVpc(vpc);
    setRoutes([]);
    setSelectedSubnets([]);
  };

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: 'Route Tables', href: '/networking/route-tables' },
          { text: 'Create route table', href: '#' },
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
            description="A route table contains a set of rules, called routes, that determine where network traffic from your subnet or gateway is directed."
          >
            Create route table
          </Header>
        }
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button variant="link" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
              Create route table
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          {/* Basic Settings */}
          <Container header={<Header variant="h2">Route table settings</Header>}>
            <SpaceBetween size="l">
              <FormField
                label="Name"
                description="A name tag for your route table"
                errorText={errors.name}
              >
                <Input
                  value={routeTableName}
                  onChange={({ detail }) => setRouteTableName(detail.value)}
                  placeholder="my-route-table"
                />
              </FormField>

              <FormField
                label="VPC"
                description="The VPC for this route table"
                errorText={errors.vpc}
              >
                <Select
                  selectedOption={selectedVpc}
                  onChange={({ detail }) =>
                    handleVpcChange(detail.selectedOption as { value: string; label: string } | null)
                  }
                  options={vpcOptions}
                  placeholder="Select a VPC"
                  filteringType="auto"
                />
              </FormField>

              {selectedVpcData && (
                <Box padding={{ top: 's' }}>
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
            </SpaceBetween>
          </Container>

          {/* Routes */}
          <Container
            header={
              <Header
                variant="h2"
                description="Define routes to control where network traffic is directed"
                actions={
                  <Button onClick={addRoute} iconName="add-plus" disabled={!selectedVpc}>
                    Add route
                  </Button>
                }
              >
                Routes
              </Header>
            }
          >
            <SpaceBetween size="m">
              {/* Local route info */}
              {selectedVpcData && (
                <Alert type="info">
                  A local route for the VPC CIDR block ({selectedVpcData.cidrBlock}) is automatically added to every route table. This route cannot be modified or deleted.
                </Alert>
              )}

              {/* Custom routes */}
              {routes.length === 0 && selectedVpc ? (
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  No additional routes. Click "Add route" to define custom routes.
                </Box>
              ) : !selectedVpc ? (
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  Select a VPC first to add routes.
                </Box>
              ) : (
                routes.map((route, index) => (
                  <Container
                    key={route.id}
                    header={
                      <Header
                        variant="h3"
                        actions={
                          <Button
                            variant="icon"
                            iconName="remove"
                            onClick={() => removeRoute(route.id)}
                            ariaLabel="Remove route"
                          />
                        }
                      >
                        Route {index + 1}
                      </Header>
                    }
                  >
                    <ColumnLayout columns={3}>
                      <FormField
                        label="Destination"
                        constraintText="CIDR block (e.g., 0.0.0.0/0)"
                        errorText={errors[`route-${index}-destination`]}
                      >
                        <Input
                          value={route.destination}
                          onChange={({ detail }) =>
                            updateRoute(route.id, 'destination', detail.value)
                          }
                          placeholder="0.0.0.0/0"
                        />
                      </FormField>

                      <FormField
                        label="Target type"
                        errorText={errors[`route-${index}-targetType`]}
                      >
                        <Select
                          selectedOption={route.targetType}
                          onChange={({ detail }) =>
                            updateRoute(route.id, 'targetType', detail.selectedOption)
                          }
                          options={TARGET_TYPES}
                          placeholder="Select target type"
                        />
                      </FormField>

                      <FormField
                        label="Target"
                        errorText={errors[`route-${index}-target`]}
                      >
                        <Select
                          selectedOption={route.target}
                          onChange={({ detail }) =>
                            updateRoute(route.id, 'target', detail.selectedOption)
                          }
                          options={getTargetOptions(route.targetType?.value)}
                          placeholder="Select target"
                          disabled={!route.targetType}
                          empty={
                            route.targetType?.value === 'local'
                              ? undefined
                              : 'No resources available for this target type'
                          }
                        />
                      </FormField>
                    </ColumnLayout>
                  </Container>
                ))
              )}
            </SpaceBetween>
          </Container>

          {/* Subnet Associations */}
          <Container
            header={
              <Header
                variant="h2"
                description="Associate subnets with this route table. Subnets not explicitly associated will use the main route table."
              >
                Subnet associations (optional)
              </Header>
            }
          >
            {!selectedVpc ? (
              <Box textAlign="center" color="text-body-secondary" padding="l">
                Select a VPC first to associate subnets.
              </Box>
            ) : subnetOptions.length === 0 ? (
              <Box textAlign="center" color="text-body-secondary" padding="l">
                No subnets available in the selected VPC.
              </Box>
            ) : (
              <FormField
                label="Subnets"
                description="Select subnets to associate with this route table"
              >
                <Multiselect
                  selectedOptions={selectedSubnets as { value: string; label: string }[]}
                  onChange={({ detail }) => setSelectedSubnets(detail.selectedOptions as { value: string; label: string }[])}
                  options={subnetOptions}
                  placeholder="Select subnets"
                  filteringType="auto"
                  tokenLimit={5}
                />
              </FormField>
            )}
          </Container>

          {/* Preview */}
          <Container header={<Header variant="h2">Preview</Header>}>
            <SpaceBetween size="m">
              <ColumnLayout columns={2} variant="text-grid">
                <div>
                  <Box variant="awsui-key-label">Route table name</Box>
                  <Box>{routeTableName || '-'}</Box>
                </div>
                <div>
                  <Box variant="awsui-key-label">VPC</Box>
                  <Box>{selectedVpc?.label || '-'}</Box>
                </div>
                <div>
                  <Box variant="awsui-key-label">Custom routes</Box>
                  <Box>{routes.length}</Box>
                </div>
                <div>
                  <Box variant="awsui-key-label">Subnet associations</Box>
                  <Box>{selectedSubnets.length}</Box>
                </div>
              </ColumnLayout>

              {/* Routes Preview Table */}
              {(selectedVpcData || routes.length > 0) && (
                <Box padding={{ top: 'm' }}>
                  <Box variant="h4">Routes</Box>
                  <Table
                    items={[
                      // Local route (always present)
                      ...(selectedVpcData
                        ? [
                            {
                              destination: selectedVpcData.cidrBlock,
                              target: 'local',
                              status: 'Active',
                            },
                          ]
                        : []),
                      // Custom routes
                      ...routes.map((r) => ({
                        destination: r.destination || '-',
                        target: r.target?.label || '-',
                        status: 'Active',
                      })),
                    ]}
                    columnDefinitions={[
                      { id: 'destination', header: 'Destination', cell: (item) => item.destination },
                      { id: 'target', header: 'Target', cell: (item) => item.target },
                      { id: 'status', header: 'Status', cell: (item) => item.status },
                    ]}
                    variant="embedded"
                  />
                </Box>
              )}
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Form>
    </SpaceBetween>
  );
}
