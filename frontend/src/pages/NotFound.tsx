import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
          <Car className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/search" className="btn btn-outline">
            Find Parking
          </Link>
        </div>
      </div>
    </div>
  );
}