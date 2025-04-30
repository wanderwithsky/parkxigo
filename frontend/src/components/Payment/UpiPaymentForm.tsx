import React, { useState } from 'react';
import { Smartphone, AlertCircle, Check } from 'lucide-react';

interface UpiPaymentFormProps {
  onSubmit: (upiId: string) => void;
  isProcessing: boolean;
}

export default function UpiPaymentForm({ onSubmit, isProcessing }: UpiPaymentFormProps) {
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);

  const validateUpiId = (id: string) => {
    // Basic UPI ID validation (username@provider)
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!upiId.trim()) {
      setError('Please enter your UPI ID');
      return;
    }

    if (!validateUpiId(upiId)) {
      setError('Please enter a valid UPI ID (e.g., username@upi)');
      return;
    }

    setError(null);
    setNotificationSent(true);
    onSubmit(upiId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-6">
        <img 
          src="/gpay-logo.png" 
          alt="Google Pay" 
          className="h-12"
          onError={(e) => {
            // Fallback if image is not available
            e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/512px-Google_Pay_Logo_%282020%29.svg.png';
          }}
        />
      </div>

      {notificationSent ? (
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-medium">Payment Request Sent!</h3>
          <p className="text-muted">
            A payment request has been sent to your Google Pay app. Please check your mobile device and approve the payment.
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-primary">
            <Smartphone className="h-4 w-4" />
            <span>Check your phone for notification</span>
          </div>

          <div className="border border-border rounded-lg p-4 mt-6 bg-muted/5">
            <p className="text-sm font-medium">UPI ID: {upiId}</p>
            <p className="text-xs text-muted mt-1">Payment will be processed through Google Pay</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="upi-id" className="block text-sm font-medium mb-2">
              Enter your UPI ID
            </label>
            <input
              type="text"
              id="upi-id"
              className="input w-full"
              placeholder="username@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-error text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <p className="text-sm text-muted mt-2">
              Enter your Google Pay UPI ID (e.g., username@okicici, name@okhdfcbank)
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⌛</span>
                Processing...
              </>
            ) : (
              'Pay with Google Pay'
            )}
          </button>
        </form>
      )}

      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="h-10 w-10 bg-muted/10 rounded-full flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-muted" />
        </div>
        <p className="text-sm text-muted">
          You'll receive a payment request notification on your phone. Open it to complete the payment.
        </p>
      </div>
    </div>
  );
} 