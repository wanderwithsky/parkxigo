import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { BillingDetails } from '../../services/paymentService';

interface BillingDetailsFormProps {
  onSubmit: (billingDetails: BillingDetails) => void;
  initialValues?: Partial<BillingDetails>;
  isLoading?: boolean;
}

export default function BillingDetailsForm({ 
  onSubmit, 
  initialValues = {}, 
  isLoading = false 
}: BillingDetailsFormProps) {
  const [name, setName] = useState(initialValues.name || '');
  const [email, setEmail] = useState(initialValues.email || '');
  const [line1, setLine1] = useState(initialValues.address?.line1 || '');
  const [line2, setLine2] = useState(initialValues.address?.line2 || '');
  const [city, setCity] = useState(initialValues.address?.city || '');
  const [state, setState] = useState(initialValues.address?.state || '');
  const [postalCode, setPostalCode] = useState(initialValues.address?.postalCode || '');
  const [country, setCountry] = useState(initialValues.address?.country || 'United States');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!line1.trim()) {
      newErrors.line1 = 'Address line 1 is required';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    
    if (!country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    onSubmit({
      name,
      email,
      address: {
        line1,
        line2,
        city,
        state,
        postalCode,
        country
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Billing Details</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={`input w-full ${errors.name ? 'border-error' : ''}`}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-error text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`input w-full ${errors.email ? 'border-error' : ''}`}
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-error text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="line1" className="block text-sm font-medium mb-1">
              Address Line 1
            </label>
            <input
              id="line1"
              type="text"
              className={`input w-full ${errors.line1 ? 'border-error' : ''}`}
              placeholder="Street address, P.O. box, etc."
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              disabled={isLoading}
            />
            {errors.line1 && (
              <p className="text-error text-xs mt-1">{errors.line1}</p>
            )}
          </div>

          <div>
            <label htmlFor="line2" className="block text-sm font-medium mb-1">
              Address Line 2 (Optional)
            </label>
            <input
              id="line2"
              type="text"
              className="input w-full"
              placeholder="Apartment, suite, unit, etc."
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                City
              </label>
              <input
                id="city"
                type="text"
                className={`input w-full ${errors.city ? 'border-error' : ''}`}
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isLoading}
              />
              {errors.city && (
                <p className="text-error text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-1">
                State / Province
              </label>
              <input
                id="state"
                type="text"
                className={`input w-full ${errors.state ? 'border-error' : ''}`}
                placeholder="State / Province"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={isLoading}
              />
              {errors.state && (
                <p className="text-error text-xs mt-1">{errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                className={`input w-full ${errors.postalCode ? 'border-error' : ''}`}
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                disabled={isLoading}
              />
              {errors.postalCode && (
                <p className="text-error text-xs mt-1">{errors.postalCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-1">
                Country
              </label>
              <input
                id="country"
                type="text"
                className={`input w-full ${errors.country ? 'border-error' : ''}`}
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isLoading}
              />
              {errors.country && (
                <p className="text-error text-xs mt-1">{errors.country}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Continue to Payment'}
      </button>
    </form>
  );
} 