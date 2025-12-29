import { useState, useMemo } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Modal from '@cloudscape-design/components/modal';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import type { Invoice, InvoiceLineItem } from '@/types';
import { invoices, invoiceLineItems, payments } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getPaymentMethodLabel } from '@/utils/labelMappers';
import { InvoiceStatusIndicator, PaymentStatusIndicator } from '@/components/indicators';
import { PAGE_SIZE } from '@/constants';

export function BillsPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);

  const currentInvoice = invoices[0];
  const pendingAmount = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.total, 0);

  const paginatedInvoices = useMemo(() => {
    const start = (invoicePage - 1) * PAGE_SIZE;
    return invoices.slice(start, start + PAGE_SIZE);
  }, [invoicePage]);

  const paginatedPayments = useMemo(() => {
    const start = (paymentPage - 1) * PAGE_SIZE;
    return payments.slice(start, start + PAGE_SIZE);
  }, [paymentPage]);

  const getLineItemsForInvoice = (invoiceId: string): InvoiceLineItem[] => {
    return invoiceLineItems.filter((item) => item.invoiceId === invoiceId);
  };

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="View and manage your invoices and payment history"
      >
        Bills & Payments
      </Header>

      {/* Summary Cards */}
      <ColumnLayout columns={3} variant="text-grid">
        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Current Month Charges</Box>
            <Box variant="h1">{formatCurrency(currentInvoice.subtotal)}</Box>
            <Box variant="small" color="text-body-secondary">
              + {formatCurrency(currentInvoice.tax)} GST
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Pending Amount</Box>
            <Box variant="h1">{formatCurrency(pendingAmount)}</Box>
            <Box variant="small" color="text-body-secondary">
              Due by {formatDate(currentInvoice.dueDate)}
            </Box>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Credits Applied</Box>
            <Box variant="h1">{formatCurrency(currentInvoice.credits)}</Box>
            <Box variant="small" color="text-body-secondary">
              This billing period
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      {/* Tabs for Invoices and Payments */}
      <Tabs
        tabs={[
          {
            id: 'invoices',
            label: 'Invoices',
            content: (
              <Table
                columnDefinitions={[
                  {
                    id: 'invoiceNumber',
                    header: 'Invoice Number',
                    cell: (item) => (
                      <Link onFollow={() => setSelectedInvoice(item)}>
                        {item.invoiceNumber}
                      </Link>
                    ),
                    sortingField: 'invoiceNumber',
                  },
                  {
                    id: 'billingPeriod',
                    header: 'Billing Period',
                    cell: (item) =>
                      `${formatDate(item.billingPeriodStart)} - ${formatDate(item.billingPeriodEnd)}`,
                  },
                  {
                    id: 'issueDate',
                    header: 'Issue Date',
                    cell: (item) => formatDate(item.issueDate),
                    sortingField: 'issueDate',
                  },
                  {
                    id: 'dueDate',
                    header: 'Due Date',
                    cell: (item) => formatDate(item.dueDate),
                    sortingField: 'dueDate',
                  },
                  {
                    id: 'total',
                    header: 'Total',
                    cell: (item) => formatCurrency(item.total, item.currency),
                    sortingField: 'total',
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (item) => <InvoiceStatusIndicator status={item.status as 'paid' | 'pending' | 'overdue' | 'draft'} />,
                    sortingField: 'status',
                  },
                  {
                    id: 'actions',
                    header: 'Actions',
                    cell: (item) => (
                      <SpaceBetween size="xs" direction="horizontal">
                        <Button variant="link" onClick={() => setSelectedInvoice(item)}>
                          View
                        </Button>
                        <Button variant="link">Download PDF</Button>
                        {item.status === 'pending' && (
                          <Button variant="primary">Pay Now</Button>
                        )}
                      </SpaceBetween>
                    ),
                  },
                ]}
                items={paginatedInvoices}
                header={
                  <Header
                    counter={`(${invoices.length})`}
                    actions={
                      <Button iconName="download">Download All</Button>
                    }
                  >
                    Invoices
                  </Header>
                }
                pagination={
                  <Pagination
                    currentPageIndex={invoicePage}
                    pagesCount={Math.ceil(invoices.length / PAGE_SIZE)}
                    onChange={({ detail }) => setInvoicePage(detail.currentPageIndex)}
                  />
                }
                empty={
                  <Box textAlign="center" color="inherit">
                    <b>No invoices</b>
                    <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                      No invoices have been generated yet.
                    </Box>
                  </Box>
                }
              />
            ),
          },
          {
            id: 'payments',
            label: 'Payment History',
            content: (
              <Table
                columnDefinitions={[
                  {
                    id: 'transactionId',
                    header: 'Transaction ID',
                    cell: (item) => item.transactionId,
                    sortingField: 'transactionId',
                  },
                  {
                    id: 'invoiceId',
                    header: 'Invoice',
                    cell: (item) => {
                      const invoice = invoices.find((inv) => inv.id === item.invoiceId);
                      return invoice?.invoiceNumber || item.invoiceId;
                    },
                  },
                  {
                    id: 'amount',
                    header: 'Amount',
                    cell: (item) => formatCurrency(item.amount, item.currency),
                    sortingField: 'amount',
                  },
                  {
                    id: 'method',
                    header: 'Payment Method',
                    cell: (item) => getPaymentMethodLabel(item.method),
                    sortingField: 'method',
                  },
                  {
                    id: 'paidAt',
                    header: 'Payment Date',
                    cell: (item) => formatDate(item.paidAt),
                    sortingField: 'paidAt',
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (item) => <PaymentStatusIndicator status={item.status} />,
                    sortingField: 'status',
                  },
                ]}
                items={paginatedPayments}
                header={
                  <Header counter={`(${payments.length})`}>
                    Payment History
                  </Header>
                }
                pagination={
                  <Pagination
                    currentPageIndex={paymentPage}
                    pagesCount={Math.ceil(payments.length / PAGE_SIZE)}
                    onChange={({ detail }) => setPaymentPage(detail.currentPageIndex)}
                  />
                }
                empty={
                  <Box textAlign="center" color="inherit">
                    <b>No payments</b>
                    <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                      No payments have been recorded yet.
                    </Box>
                  </Box>
                }
              />
            ),
          },
        ]}
      />

      {/* Invoice Detail Modal */}
      <Modal
        visible={!!selectedInvoice}
        onDismiss={() => setSelectedInvoice(null)}
        size="large"
        header={`Invoice ${selectedInvoice?.invoiceNumber}`}
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              <Button>Download PDF</Button>
              {selectedInvoice?.status === 'pending' && (
                <Button variant="primary">Pay Now</Button>
              )}
            </SpaceBetween>
          </Box>
        }
      >
        {selectedInvoice && (
          <SpaceBetween size="l">
            {/* Invoice Header */}
            <ColumnLayout columns={2}>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Billing Period</Box>
                <Box>
                  {formatDate(selectedInvoice.billingPeriodStart)} - {formatDate(selectedInvoice.billingPeriodEnd)}
                </Box>
              </SpaceBetween>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Status</Box>
                <Box><InvoiceStatusIndicator status={selectedInvoice.status as 'paid' | 'pending' | 'overdue' | 'draft'} /></Box>
              </SpaceBetween>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Issue Date</Box>
                <Box>{formatDate(selectedInvoice.issueDate)}</Box>
              </SpaceBetween>
              <SpaceBetween size="xs">
                <Box variant="awsui-key-label">Due Date</Box>
                <Box>{formatDate(selectedInvoice.dueDate)}</Box>
              </SpaceBetween>
            </ColumnLayout>

            {/* Line Items */}
            <ExpandableSection
              headerText="Charges by Service"
              defaultExpanded
            >
              <Table
                columnDefinitions={[
                  {
                    id: 'service',
                    header: 'Service',
                    cell: (item) => item.service,
                  },
                  {
                    id: 'description',
                    header: 'Description',
                    cell: (item) => item.description,
                  },
                  {
                    id: 'usage',
                    header: 'Usage',
                    cell: (item) => item.usage,
                  },
                  {
                    id: 'region',
                    header: 'Region',
                    cell: (item) => item.region,
                  },
                  {
                    id: 'amount',
                    header: 'Amount',
                    cell: (item) => formatCurrency(item.amount),
                  },
                ]}
                items={getLineItemsForInvoice(selectedInvoice.id)}
                variant="embedded"
              />
            </ExpandableSection>

            {/* Invoice Summary */}
            <Container header={<Header variant="h3">Invoice Summary</Header>}>
              <ColumnLayout columns={2}>
                <Box textAlign="right">
                  <SpaceBetween size="xs">
                    <Box variant="awsui-key-label">Subtotal</Box>
                    <Box variant="awsui-key-label">Tax (GST 18%)</Box>
                    {selectedInvoice.credits > 0 && (
                      <Box variant="awsui-key-label">Credits Applied</Box>
                    )}
                    <Box variant="h3">Total Due</Box>
                  </SpaceBetween>
                </Box>
                <Box textAlign="right">
                  <SpaceBetween size="xs">
                    <Box>{formatCurrency(selectedInvoice.subtotal)}</Box>
                    <Box>{formatCurrency(selectedInvoice.tax)}</Box>
                    {selectedInvoice.credits > 0 && (
                      <Box color="text-status-success">
                        -{formatCurrency(selectedInvoice.credits)}
                      </Box>
                    )}
                    <Box variant="h3">{formatCurrency(selectedInvoice.total)}</Box>
                  </SpaceBetween>
                </Box>
              </ColumnLayout>
            </Container>
          </SpaceBetween>
        )}
      </Modal>
    </SpaceBetween>
  );
}
