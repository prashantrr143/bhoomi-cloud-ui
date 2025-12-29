import { useState } from 'react';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Cards from '@cloudscape-design/components/cards';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Tiles from '@cloudscape-design/components/tiles';
import { paymentMethods, billingPreferences } from '@/data/mockData';
import type { PaymentMethodInfo, PaymentMethod } from '@/types';
import { formatDate } from '@/utils/formatters';
import { getPaymentMethodLabel } from '@/utils/labelMappers';

function getCardBrandLogo(brand?: string): string {
  switch (brand?.toLowerCase()) {
    case 'visa':
      return 'VISA';
    case 'mastercard':
      return 'Mastercard';
    case 'amex':
      return 'Amex';
    case 'rupay':
      return 'RuPay';
    default:
      return brand || '';
  }
}

const paymentTypeOptions = [
  { label: 'Credit Card', value: 'credit_card', description: 'Pay with your credit card' },
  { label: 'Debit Card', value: 'debit_card', description: 'Pay with your debit card' },
  { label: 'Bank Transfer', value: 'bank_transfer', description: 'Pay via bank transfer' },
  { label: 'UPI', value: 'upi', description: 'Pay using UPI' },
  { label: 'Net Banking', value: 'net_banking', description: 'Pay via internet banking' },
];

const bankOptions = [
  { label: 'State Bank of India', value: 'sbi' },
  { label: 'HDFC Bank', value: 'hdfc' },
  { label: 'ICICI Bank', value: 'icici' },
  { label: 'Axis Bank', value: 'axis' },
  { label: 'Kotak Mahindra Bank', value: 'kotak' },
  { label: 'Punjab National Bank', value: 'pnb' },
];

export function PaymentMethodsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethodInfo | null>(null);

  // Add payment form state
  const [paymentType, setPaymentType] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState<{ label: string; value: string } | null>(null);

  const handleSetDefault = (method: PaymentMethodInfo) => {
    console.log('Setting default:', method.id);
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    setMethodToDelete(null);
  };

  const handleAddPaymentMethod = () => {
    setShowAddModal(false);
    setCardNumber('');
    setCardName('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setUpiId('');
    setSelectedBank(null);
  };

  const renderPaymentMethodDetails = (method: PaymentMethodInfo) => {
    switch (method.type) {
      case 'credit_card':
      case 'debit_card':
        return (
          <SpaceBetween size="xs">
            <Box>
              <Box fontWeight="bold" fontSize="heading-m">
                {getCardBrandLogo(method.cardBrand)} •••• {method.lastFourDigits}
              </Box>
            </Box>
            <Box variant="small" color="text-body-secondary">
              Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
            </Box>
            <Box variant="small">{method.holderName}</Box>
          </SpaceBetween>
        );
      case 'bank_transfer':
        return (
          <SpaceBetween size="xs">
            <Box fontWeight="bold">{method.bankName}</Box>
            <Box variant="small">{method.holderName}</Box>
          </SpaceBetween>
        );
      case 'upi':
        return (
          <SpaceBetween size="xs">
            <Box fontWeight="bold">{method.upiId}</Box>
            <Box variant="small">{method.holderName}</Box>
          </SpaceBetween>
        );
      default:
        return <Box>{method.holderName}</Box>;
    }
  };

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Manage payment methods for your Bhoomi Cloud account"
        actions={
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add payment method
          </Button>
        }
      >
        Payment Methods
      </Header>

      {/* Payment Methods Cards */}
      <Cards
        cardDefinition={{
          header: (item) => (
            <SpaceBetween size="xs" direction="horizontal">
              <Box fontWeight="bold">{getPaymentMethodLabel(item.type)}</Box>
              {item.isDefault && <Badge color="green">Default</Badge>}
            </SpaceBetween>
          ),
          sections: [
            {
              id: 'details',
              content: (item) => renderPaymentMethodDetails(item),
            },
            {
              id: 'added',
              header: 'Added',
              content: (item) => formatDate(item.addedAt),
            },
            {
              id: 'actions',
              content: (item) => (
                <SpaceBetween size="xs" direction="horizontal">
                  {!item.isDefault && (
                    <Button variant="link" onClick={() => handleSetDefault(item)}>
                      Set as default
                    </Button>
                  )}
                  <Button
                    variant="link"
                    onClick={() => {
                      setMethodToDelete(item);
                      setShowDeleteModal(true);
                    }}
                  >
                    Remove
                  </Button>
                </SpaceBetween>
              ),
            },
          ],
        }}
        items={paymentMethods}
        cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }, { minWidth: 900, cards: 3 }]}
        empty={
          <Box textAlign="center" color="inherit" padding="l">
            <b>No payment methods</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              Add a payment method to pay for your cloud services.
            </Box>
            <Button onClick={() => setShowAddModal(true)}>Add payment method</Button>
          </Box>
        }
      />

      {/* Auto-Pay Settings */}
      <Container
        header={
          <Header
            variant="h2"
            description="Configure automatic payment settings"
          >
            Auto-Pay Settings
          </Header>
        }
      >
        <ColumnLayout columns={2}>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Auto-Pay Status</Box>
            <Box>
              {billingPreferences.autoPayEnabled ? (
                <StatusIndicator type="success">Enabled</StatusIndicator>
              ) : (
                <StatusIndicator type="stopped">Disabled</StatusIndicator>
              )}
            </Box>
          </SpaceBetween>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Default Payment Method</Box>
            <Box>
              {paymentMethods.find((m) => m.isDefault)
                ? `${getPaymentMethodLabel(paymentMethods.find((m) => m.isDefault)!.type)} •••• ${paymentMethods.find((m) => m.isDefault)?.lastFourDigits || ''}`
                : 'Not set'}
            </Box>
          </SpaceBetween>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Payment Terms</Box>
            <Box>Net {billingPreferences.paymentTerms} days</Box>
          </SpaceBetween>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Currency</Box>
            <Box>{billingPreferences.currency}</Box>
          </SpaceBetween>
        </ColumnLayout>
        <Box padding={{ top: 'm' }}>
          <Button>Edit auto-pay settings</Button>
        </Box>
      </Container>

      {/* Billing Address */}
      <Container
        header={
          <Header
            variant="h2"
            description="Your billing address for invoices and tax purposes"
            actions={<Button>Edit</Button>}
          >
            Billing Address
          </Header>
        }
      >
        <ColumnLayout columns={2}>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Business Name</Box>
            <Box>{billingPreferences.taxSettings.businessName}</Box>
          </SpaceBetween>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">GST Number</Box>
            <Box>{billingPreferences.taxSettings.gstNumber || 'Not provided'}</Box>
          </SpaceBetween>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Address</Box>
            <Box>
              {billingPreferences.taxSettings.billingAddress.line1}
              {billingPreferences.taxSettings.billingAddress.line2 && (
                <>, {billingPreferences.taxSettings.billingAddress.line2}</>
              )}
              <br />
              {billingPreferences.taxSettings.billingAddress.city}, {billingPreferences.taxSettings.billingAddress.state} {billingPreferences.taxSettings.billingAddress.postalCode}
              <br />
              {billingPreferences.taxSettings.billingAddress.country}
            </Box>
          </SpaceBetween>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">PAN Number</Box>
            <Box>{billingPreferences.taxSettings.panNumber || 'Not provided'}</Box>
          </SpaceBetween>
        </ColumnLayout>
      </Container>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        size="medium"
        header="Add Payment Method"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddPaymentMethod}>
                Add payment method
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="m">
            <FormField label="Payment method type">
              <Tiles
                items={paymentTypeOptions}
                value={paymentType}
                onChange={({ detail }) => setPaymentType(detail.value)}
                columns={3}
              />
            </FormField>

            {(paymentType === 'credit_card' || paymentType === 'debit_card') && (
              <>
                <FormField label="Card number">
                  <Input
                    value={cardNumber}
                    onChange={({ detail }) => setCardNumber(detail.value)}
                    placeholder="1234 5678 9012 3456"
                    type="text"
                  />
                </FormField>
                <FormField label="Name on card">
                  <Input
                    value={cardName}
                    onChange={({ detail }) => setCardName(detail.value)}
                    placeholder="John Doe"
                  />
                </FormField>
                <ColumnLayout columns={3}>
                  <FormField label="Expiry month">
                    <Input
                      value={expiryMonth}
                      onChange={({ detail }) => setExpiryMonth(detail.value)}
                      placeholder="MM"
                      type="number"
                    />
                  </FormField>
                  <FormField label="Expiry year">
                    <Input
                      value={expiryYear}
                      onChange={({ detail }) => setExpiryYear(detail.value)}
                      placeholder="YYYY"
                      type="number"
                    />
                  </FormField>
                  <FormField label="CVV">
                    <Input
                      value={cvv}
                      onChange={({ detail }) => setCvv(detail.value)}
                      placeholder="123"
                      type="password"
                    />
                  </FormField>
                </ColumnLayout>
              </>
            )}

            {paymentType === 'upi' && (
              <FormField label="UPI ID" description="Enter your UPI address">
                <Input
                  value={upiId}
                  onChange={({ detail }) => setUpiId(detail.value)}
                  placeholder="yourname@bank"
                />
              </FormField>
            )}

            {(paymentType === 'bank_transfer' || paymentType === 'net_banking') && (
              <FormField label="Select Bank">
                <Select
                  selectedOption={selectedBank}
                  onChange={({ detail }) => setSelectedBank(detail.selectedOption as typeof selectedBank)}
                  options={bankOptions}
                  placeholder="Choose a bank"
                />
              </FormField>
            )}
          </SpaceBetween>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        size="small"
        header="Remove Payment Method"
        footer={
          <Box float="right">
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="link" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleDelete}>
                Remove
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box>
          Are you sure you want to remove this payment method?
          {methodToDelete && (
            <Box padding={{ top: 's' }}>
              <strong>
                {getPaymentMethodLabel(methodToDelete.type)}
                {methodToDelete.lastFourDigits && ` •••• ${methodToDelete.lastFourDigits}`}
              </strong>
            </Box>
          )}
          {methodToDelete?.isDefault && (
            <Box padding={{ top: 's' }} color="text-status-warning">
              <StatusIndicator type="warning">
                This is your default payment method. You'll need to set a new default after removing it.
              </StatusIndicator>
            </Box>
          )}
        </Box>
      </Modal>
    </SpaceBetween>
  );
}
