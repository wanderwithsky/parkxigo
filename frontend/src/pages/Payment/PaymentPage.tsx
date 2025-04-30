import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import PaymentMethodSelector from '../../components/Payment/PaymentMethodSelector';
import CreditCardForm from '../../components/Payment/CreditCardForm';
import BillingDetailsForm from '../../components/Payment/BillingDetailsForm';
import UpiPaymentForm from '../../components/Payment/UpiPaymentForm';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useParking } from '../../context/ParkingContext';
import { BillingDetails, PaymentRequest, processPayment } from '../../services/paymentService';

// Mock API call to get booking details
const getBookingDetails = async (bookingId: string) => {
  // In a real app, this would fetch from your API
  return {
    id: bookingId,
    parkingSpotId: 'spot123',
    parkingSpotName: 'Downtown Secure Parking',
    address: '123 Main St, Downtown',
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    totalCost: 25.99,
    status: 'pending' 
  };
};

type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
type PaymentStep = 'method' | 'billing' | 'payment' | 'confirmation';

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addBookingAfterPayment } = useParking();
  
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit_card');
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [upiId, setUpiId] = useState<string>('');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const details = await getBookingDetails(id);
        setBookingDetails(details);
      } catch (error) {
        setError('Failed to load booking details. Please try again.');
        showToast('Failed to load booking details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, showToast]);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    
    // Skip billing details for Google Pay
    if (method === 'google_pay') {
      setCurrentStep('payment');
    } else {
      setCurrentStep('billing');
    }
  };

  const handleBillingSubmit = (details: BillingDetails) => {
    setBillingDetails(details);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (cardData: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    cardholderName: string;
  }) => {
    if (!billingDetails || !bookingDetails || !user) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Format card details for the API
      const cardDetails = {
        last4: cardData.cardNumber.slice(-4),
        brand: getCardBrand(cardData.cardNumber),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear
      };
      
      // Prepare payment request
      const paymentRequest: PaymentRequest = {
        bookingId: bookingDetails.id,
        method: selectedMethod,
        cardDetails,
        billingDetails
      };
      
      // Process payment
      const response = await processPayment(paymentRequest);
      
      // Add booking to user's bookings
      const booking = addBookingAfterPayment({
        id: bookingDetails.id,
        parkingSpotId: bookingDetails.parkingSpotId,
        userId: user.id,
        startTime: new Date(bookingDetails.startTime),
        endTime: new Date(bookingDetails.endTime),
        totalCost: bookingDetails.totalCost,
        status: 'confirmed',
        qrCode: '',
        createdAt: new Date()
      });
      
      console.log('Booking added after payment:', booking);
      
      // Handle success
      setPaymentId(response.payment.id);
      setSuccess(true);
      setCurrentStep('confirmation');
      showToast('Payment processed successfully!', 'success');
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment processing failed');
      showToast('Payment processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpiSubmit = async (upiId: string) => {
    if (!bookingDetails || !user) return;
    
    setUpiId(upiId);
    setIsProcessing(true);
    setError(null);
    
    try {
      // Prepare payment request for Google Pay
      const paymentRequest: PaymentRequest = {
        bookingId: bookingDetails.id,
        method: 'google_pay',
        upiDetails: {
          upiId: upiId,
          provider: 'google_pay'
        }
      };
      
      // Process payment
      const response = await processPayment(paymentRequest);
      
      // Add booking to user's bookings
      const booking = addBookingAfterPayment({
        id: bookingDetails.id,
        parkingSpotId: bookingDetails.parkingSpotId,
        userId: user.id,
        startTime: new Date(bookingDetails.startTime),
        endTime: new Date(bookingDetails.endTime),
        totalCost: bookingDetails.totalCost,
        status: 'confirmed',
        qrCode: '',
        createdAt: new Date()
      });
      
      console.log('Booking added after payment:', booking);
      
      // Handle success
      setPaymentId(response.payment.id);
      setSuccess(true);
      setCurrentStep('confirmation');
      showToast('Payment request sent successfully!', 'success');
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment processing failed');
      showToast('Payment processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to determine card brand based on first digits
  const getCardBrand = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0);
    const firstTwoDigits = parseInt(cardNumber.substring(0, 2));
    
    if (firstDigit === '4') return 'visa';
    if (firstTwoDigits >= 51 && firstTwoDigits <= 55) return 'mastercard';
    if (firstTwoDigits === 34 || firstTwoDigits === 37) return 'amex';
    if (firstTwoDigits === 65 || firstTwoDigits === 62 || firstTwoDigits === 60) return 'discover';
    
    return 'unknown';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-custom py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <h2 className="text-lg font-medium">Loading booking details...</h2>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !bookingDetails) {
    return (
      <Layout>
        <div className="container-custom py-8">
          <div className="card p-8 text-center">
            <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Booking</h2>
            <p className="text-muted mb-6">{error}</p>
            <Link to="/profile" className="btn btn-primary">
              Back to My Bookings
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <Link to={`/profile`} className="inline-flex items-center text-primary hover:underline mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to My Bookings
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold mb-6">
              {currentStep === 'confirmation' 
                ? 'Payment Confirmation' 
                : 'Complete Your Booking'}
            </h1>

            {/* Step Indicator */}
            {currentStep !== 'confirmation' && (
              <div className="mb-8">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    currentStep === 'method' 
                      ? 'bg-primary text-white' 
                      : 'bg-primary text-white'
                  }`}>
                    1
                  </div>
                  <div className={`h-1 flex-1 ${
                    currentStep === 'method' 
                      ? 'bg-muted/20' 
                      : 'bg-primary'
                  }`}></div>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    currentStep === 'billing' || currentStep === 'payment' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted/20 text-muted'
                  }`}>
                    2
                  </div>
                  <div className={`h-1 flex-1 ${
                    currentStep === 'payment' 
                      ? 'bg-primary' 
                      : 'bg-muted/20'
                  }`}></div>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    currentStep === 'payment' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted/20 text-muted'
                  }`}>
                    3
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className={currentStep === 'method' ? 'text-primary font-medium' : ''}>
                    Payment Method
                  </span>
                  <span className={currentStep === 'billing' ? 'text-primary font-medium' : ''}>
                    Billing Details
                  </span>
                  <span className={currentStep === 'payment' ? 'text-primary font-medium' : ''}>
                    Payment
                  </span>
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            {currentStep === 'method' && (
              <div className="card p-6">
                <PaymentMethodSelector
                  selectedMethod={selectedMethod}
                  onChange={handleMethodSelect}
                />
                
                <div className="mt-6">
                  <button
                    onClick={() => {
                      if (selectedMethod === 'google_pay') {
                        setCurrentStep('payment');
                      } else {
                        setCurrentStep('billing');
                      }
                    }}
                    className="btn btn-primary w-full"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Billing Details Form */}
            {currentStep === 'billing' && (
              <BillingDetailsForm
                onSubmit={handleBillingSubmit}
                initialValues={billingDetails || {
                  name: user?.name || '',
                  email: '',
                  address: {
                    line1: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'United States'
                  }
                }}
                isLoading={isProcessing}
              />
            )}

            {/* Payment Form */}
            {currentStep === 'payment' && (
              <div className="card p-6">
                {selectedMethod === 'credit_card' || selectedMethod === 'debit_card' ? (
                  <CreditCardForm onSubmit={handlePaymentSubmit} isLoading={isProcessing} />
                ) : selectedMethod === 'google_pay' ? (
                  <UpiPaymentForm onSubmit={handleUpiSubmit} isProcessing={isProcessing} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted mb-4">This payment method is not fully implemented yet.</p>
                    <button
                      onClick={() => setCurrentStep('method')}
                      className="btn btn-outline"
                    >
                      Choose Another Method
                    </button>
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 p-3 bg-error/10 text-error rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Confirmation */}
            {currentStep === 'confirmation' && (
              <div className="card p-8 text-center">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-muted mb-8">
                  Your booking has been confirmed. You will receive a confirmation email shortly.
                </p>
                
                <div className="mb-8 p-6 bg-muted/10 rounded-lg text-left">
                  <h3 className="font-medium mb-4 text-lg">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted">Transaction ID:</p>
                      <p className="font-medium">{paymentId}</p>
                    </div>
                    <div>
                      <p className="text-muted">Amount:</p>
                      <p className="font-medium">₹{bookingDetails?.totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Payment Method:</p>
                      <p className="font-medium">
                        {selectedMethod === 'credit_card' 
                          ? 'Credit Card' 
                          : selectedMethod === 'debit_card' 
                            ? 'Debit Card' 
                            : selectedMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Status:</p>
                      <p className="font-medium text-success">Completed</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Link to="/profile" className="btn btn-primary">
                    View My Bookings
                  </Link>
                  <Link to="/" className="btn btn-outline">
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            {bookingDetails && currentStep !== 'confirmation' && (
              <div className="card p-6 border border-border sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-medium">{bookingDetails.parkingSpotName}</h3>
                    <p className="text-sm text-muted">{bookingDetails.address}</p>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted">Start Time:</span>
                      <span className="text-sm">
                        {new Date(bookingDetails.startTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted">End Time:</span>
                      <span className="text-sm">
                        {new Date(bookingDetails.endTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted">Duration:</span>
                      <span className="text-sm">
                        {Math.round((new Date(bookingDetails.endTime).getTime() - 
                                    new Date(bookingDetails.startTime).getTime()) / 
                                    (1000 * 60 * 60))} hours
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>₹{bookingDetails.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-muted/10 rounded-md text-xs text-muted">
                  <CreditCard className="h-4 w-4 flex-shrink-0" />
                  <p>Your information is encrypted and secure.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 