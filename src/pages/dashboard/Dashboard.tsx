import { useNavigate } from 'react-router-dom';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Link from '@cloudscape-design/components/link';
import Button from '@cloudscape-design/components/button';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
}

function ServiceCard({ title, description, href }: ServiceCardProps) {
  const navigate = useNavigate();

  return (
    <Container>
      <SpaceBetween size="s">
        <Link fontSize="heading-m" href={href} onFollow={(e) => { e.preventDefault(); navigate(href); }}>
          {title}
        </Link>
        <Box color="text-body-secondary" fontSize="body-s">
          {description}
        </Box>
      </SpaceBetween>
    </Container>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const services = [
    {
      category: 'Compute',
      items: [
        { title: 'EC2', description: 'Virtual servers in the cloud', href: '/compute/instances' },
        { title: 'Lambda', description: 'Run code without thinking about servers', href: '/compute/lambda' },
        { title: 'ECS', description: 'Run containerized applications', href: '/compute/ecs/clusters' },
        { title: 'EKS', description: 'Managed Kubernetes service', href: '/compute/eks/clusters' },
      ],
    },
    {
      category: 'Storage',
      items: [
        { title: 'S3', description: 'Scalable storage in the cloud', href: '/storage/s3' },
        { title: 'EBS', description: 'Block storage for EC2', href: '/storage/ebs' },
      ],
    },
    {
      category: 'Networking',
      items: [
        { title: 'VPC', description: 'Isolated cloud resources', href: '/networking/vpcs' },
        { title: 'Load Balancing', description: 'Distribute incoming traffic', href: '/compute/load-balancers' },
      ],
    },
  ];

  return (
    <SpaceBetween size="l">
      {/* Welcome Banner */}
      <Container>
        <SpaceBetween size="m">
          <Box variant="h1" fontSize="heading-xl">
            Welcome to Bhoomi Cloud Console
          </Box>
          <Box color="text-body-secondary">
            Hello, {user?.name || 'User'}. Build, deploy, and manage your applications and infrastructure.
          </Box>
          <SpaceBetween size="s" direction="horizontal">
            <Button variant="primary" onClick={() => navigate('/compute/instances')}>
              Launch a virtual machine
            </Button>
            <Button onClick={() => navigate('/storage/s3')}>
              Create a storage bucket
            </Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>

      {/* Build a solution */}
      <Container
        header={
          <Header variant="h2">
            Build a solution
          </Header>
        }
      >
        <SpaceBetween size="m">
          <Box color="text-body-secondary">
            Get started by exploring common use cases and solutions.
          </Box>
          <Grid
            gridDefinition={[
              { colspan: { default: 12, s: 4 } },
              { colspan: { default: 12, s: 4 } },
              { colspan: { default: 12, s: 4 } },
            ]}
          >
            <Box padding="m" textAlign="center">
              <SpaceBetween size="xs">
                <Box fontWeight="bold">Host a static website</Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  Use S3 to host a simple static website
                </Box>
                <Link href="/storage/s3" onFollow={(e) => { e.preventDefault(); navigate('/storage/s3'); }}>
                  Get started
                </Link>
              </SpaceBetween>
            </Box>
            <Box padding="m" textAlign="center">
              <SpaceBetween size="xs">
                <Box fontWeight="bold">Deploy a web application</Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  Launch EC2 instances with load balancing
                </Box>
                <Link href="/compute/instances" onFollow={(e) => { e.preventDefault(); navigate('/compute/instances'); }}>
                  Get started
                </Link>
              </SpaceBetween>
            </Box>
            <Box padding="m" textAlign="center">
              <SpaceBetween size="xs">
                <Box fontWeight="bold">Run containers</Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  Deploy containerized apps with ECS or EKS
                </Box>
                <Link href="/compute/ecs/clusters" onFollow={(e) => { e.preventDefault(); navigate('/compute/ecs/clusters'); }}>
                  Get started
                </Link>
              </SpaceBetween>
            </Box>
          </Grid>
        </SpaceBetween>
      </Container>

      {/* Explore services */}
      <SpaceBetween size="m">
        <Header variant="h2">Explore services</Header>
        {services.map((category) => (
          <SpaceBetween key={category.category} size="s">
            <Box fontWeight="bold" color="text-label">
              {category.category}
            </Box>
            <Grid
              gridDefinition={category.items.map(() => ({ colspan: { default: 12, s: 6, l: 3 } }))}
            >
              {category.items.map((service) => (
                <ServiceCard
                  key={service.title}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                />
              ))}
            </Grid>
          </SpaceBetween>
        ))}
      </SpaceBetween>
    </SpaceBetween>
  );
}
