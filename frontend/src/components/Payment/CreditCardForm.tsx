import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';

interface CreditCardFormProps {
  onSubmit: (cardData: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    cardholderName: string;
  }) => void;
  isLoading?: boolean;
}

export default function CreditCardForm({ onSubmit, isLoading = false }: CreditCardFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    }
    
    if (!expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    }
    
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    onSubmit({
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiryMonth: parseInt(expiryMonth),
      expiryYear: parseInt(expiryYear),
      cvv,
      cardholderName
    });
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    const cardNum = value.replace(/\s/g, '').replace(/\D/g, '');
    const parts = [];
    
    for (let i = 0; i < cardNum.length; i += 4) {
      parts.push(cardNum.substring(i, i + 4));
    }
    
    return parts.join(' ');
  };

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return (
      <option key={month} value={month}>
        {month.toString().padStart(2, '0')}
      </option>
    );
  });

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear + i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Credit Card Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
              Card Number
            </label>
            <input
              id="cardNumber"
              type="text"
              className={`input w-full ${errors.cardNumber ? 'border-error' : ''}`}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19} // 16 digits + 3 spaces
              disabled={isLoading}
            />
            {errors.cardNumber && (
              <p className="text-error text-xs mt-1">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <label htmlFor="cardholderName" className="block text-sm font-medium mb-1">
                Cardholder Name
              </label>
              <input
                id="cardholderName"
                type="text"
                className={`input w-full ${errors.cardholderName ? 'border-error' : ''}`}
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                disabled={isLoading}
              />
              {errors.cardholderName && (
                <p className="text-error text-xs mt-1">{errors.cardholderName}</p>
              )}
            </div>

            <div>
              <label htmlFor="expiryMonth" className="block text-sm font-medium mb-1">
                Month
              </label>
              <select
                id="expiryMonth"
                className={`input w-full ${errors.expiryMonth ? 'border-error' : ''}`}
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                disabled={isLoading}
              >
                <option value="">MM</option>
                {monthOptions}
              </select>
              {errors.expiryMonth && (
                <p className="text-error text-xs mt-1">{errors.expiryMonth}</p>
              )}
            </div>

            <div>
              <label htmlFor="expiryYear" className="block text-sm font-medium mb-1">
                Year
              </label>
              <select
                id="expiryYear"
                className={`input w-full ${errors.expiryYear ? 'border-error' : ''}`}
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                disabled={isLoading}
              >
                <option value="">YYYY</option>
                {yearOptions}
              </select>
              {errors.expiryYear && (
                <p className="text-error text-xs mt-1">{errors.expiryYear}</p>
              )}
            </div>
          </div>

          <div className="w-1/3">
            <label htmlFor="cvv" className="block text-sm font-medium mb-1">
              CVV
            </label>
            <input
              id="cvv"
              type="text"
              className={`input w-full ${errors.cvv ? 'border-error' : ''}`}
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
              maxLength={4}
              disabled={isLoading}
            />
            {errors.cvv && (
              <p className="text-error text-xs mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
} 