import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star } from 'lucide-react';

interface ParkingSpotCardProps {
  id: string;
  title: string;
  address: string;
  price: number;
  availableSpots: number;
  totalSpots: number;
  features: string[];
  images: string[];
  onClick?: () => void;
}

export const ParkingSpotCard: React.FC<ParkingSpotCardProps> = ({
  id,
  title,
  address,
  price = 0,
  availableSpots = 0,
  totalSpots = 0,
  features = [],
  images = [],
  onClick
}) => {
  return (
    <div className="card p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
        <img
          src={images?.[0] || '/placeholder-parking.jpg'}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex items-start gap-2 mb-3 text-muted">
        <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
        <p className="text-sm line-clamp-2">{address}</p>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted">Price</p>
          <p className="font-semibold">₹{(price || 0).toFixed(2)}/hr</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">Available</p>
          <p className="font-semibold">{availableSpots} / {totalSpots}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(features || []).slice(0, 3).map((feature, index) => (
          <span
            key={index}
            className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {feature}
          </span>
        ))}
        {features?.length > 3 && (
          <span className="inline-flex items-center rounded-full bg-muted/20 px-2 py-0.5 text-xs font-medium text-muted">
            +{features.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
};