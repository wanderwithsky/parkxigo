import React from 'react';
import { CreditCard, DollarSign, Award, SmartphoneNfc } from 'lucide-react';

type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onChange,
  disabled = false
}: PaymentMethodSelectorProps) {
  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Pay securely with your credit card'
    },
    {
      id: 'debit_card',
      name: 'Debit Card',
      icon: <Award className="h-5 w-5" />,
      description: 'Pay directly from your bank account'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Pay with your PayPal account'
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: <SmartphoneNfc className="h-5 w-5" />,
      description: 'Fast and secure Apple Pay'
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: <SmartphoneNfc className="h-5 w-5" />,
      description: 'Pay with Google Pay'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Payment Method</h3>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`relative rounded-lg border p-4 transition-all cursor-pointer ${
              selectedMethod === method.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onChange(method.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${selectedMethod === method.id ? 'bg-primary text-white' : 'bg-muted/20 text-muted'}`}>
                {method.icon}
              </div>
              
              <div>
                <h4 className="font-medium">{method.name}</h4>
                <p className="text-sm text-muted">{method.description}</p>
              </div>
              
              <div className="ml-auto">
                <div className={`h-5 w-5 rounded-full border border-primary flex items-center justify-center ${
                  selectedMethod === method.id ? 'bg-primary' : 'bg-transparent'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 