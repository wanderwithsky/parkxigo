import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star, ChevronLeft, Calendar } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import MapDisplay from '../components/Map/MapDisplay';
import { useParking } from '../context/ParkingContext';
import { useAuth } from '../context/AuthContext';
import ReviewList from '../components/Review/ReviewList';
import AvailabilityCalendar from '../components/ParkingSpot/AvailabilityCalendar';

export default function ParkingSpotDetails() {
  const { id } = useParams<{ id: string }>();
  const { parkingSpots } = useParking();
  const { user } = useAuth();
  const [spot, setSpot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'availability'>('details');

  useEffect(() => {
    let isMounted = true;
    
    if (id) {
      // First try to find the spot in existing parkingSpots
      const foundSpot = parkingSpots.find(s => s._id === id || s.id === id);
      
      if (foundSpot) {
        if (isMounted) {
          setSpot(foundSpot);
          setLoading(false);
        }
      } else {
        // If not found in memory, try to fetch it from the API
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
        
        const fetchSpot = async () => {
          try {
            const token = localStorage.getItem('parkxigo-token');
            const headers: HeadersInit = {};
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            
            const res = await fetch(`${API_URL}/parkingspots/${id}`, { headers });
            
            if (res.ok) {
              const spotData = await res.json();
              if (isMounted) {
                setSpot(spotData);
              }
            } else {
              console.error('Failed to fetch parking spot details');
              // Create a mock spot data for testing
              if (isMounted) {
                setSpot({
                  id: id,
                  title: 'Sample Parking Spot',
                  description: 'This is a sample parking spot description',
                  address: '123 Main St, City, Country',
                  location: {
                    type: 'Point',
                    coordinates: [0, 0]
                  },
                  price: 5.99,
                  totalSpots: 10,
                  availableSpots: 5,
                  features: ['Secure', '24/7 Access', 'Covered'],
                  ownerId: '1',
                  ownerEmail: 'owner@example.com',
                  images: ['https://placehold.co/600x400?text=Sample+Parking']
                });
              }
            }
          } catch (error) {
            console.error('Error fetching parking spot:', error);
          } finally {
            if (isMounted) {
              setLoading(false);
            }
          }
        };
        
        fetchSpot();
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [id, parkingSpots]);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-8">
          <div className="card p-8 text-center">
            <h3 className="text-lg font-medium">Loading...</h3>
          </div>
        </div>
      </Layout>
    );
  }

  if (!spot) {
    return (
      <Layout>
        <div className="container-custom py-8">
          <div className="card p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Parking Spot Not Found</h3>
            <p className="text-muted mb-4">
              The parking spot you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/search" className="btn btn-primary">
              Back to Search
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate availability percentage
  const availabilityPercentage = (spot.availableSpots / spot.totalSpots) * 100;
  let availabilityColor = 'bg-success';
  
  if (availabilityPercentage <= 20) {
    availabilityColor = 'bg-error';
  } else if (availabilityPercentage <= 50) {
    availabilityColor = 'bg-warning';
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <Link to="/search" className="inline-flex items-center text-primary hover:underline mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Image and basic info */}
          <div>
            <div className="card overflow-hidden mb-6">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={spot.images && spot.images.length > 0 ? spot.images[0] : 'https://placehold.co/600x400?text=No+Image'}
                  alt={spot.title || spot.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-sm font-medium">
                  ₹{(spot.price || 0).toFixed(2)}/hr
                </div>
              </div>
              
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{spot.title || spot.name}</h1>
                
                <div className="flex items-start gap-2 mb-4 text-muted">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{spot.address}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${availabilityColor} mr-2`}></div>
                    <span className="font-medium">
                      {spot.availableSpots} of {spot.totalSpots} spots available
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {(spot.features || []).map((feature: string, index: number) => (
                    <span 
                      key={index}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                {user ? (
                  <Link
                    to={`/payment/${spot._id || spot.id}`}
                    className="btn btn-primary w-full"
                  >
                    Book Now
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-primary w-full"
                  >
                    Login to Book
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Map and additional info */}
          <div>
            <div className="card p-4 mb-6">
              <MapDisplay 
                center={{ 
                  lat: spot.location && spot.location.coordinates ? spot.location.coordinates[1] : 0, 
                  lng: spot.location && spot.location.coordinates ? spot.location.coordinates[0] : 0 
                }}
                markers={[{
                  id: spot._id || spot.id,
                  name: spot.title || spot.name,
                  lat: spot.location && spot.location.coordinates ? spot.location.coordinates[1] : 0,
                  lng: spot.location && spot.location.coordinates ? spot.location.coordinates[0] : 0,
                }]}
                height="300px"
              />
            </div>
            
            <div className="card p-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'details' ? 'bg-primary text-white' : 'text-muted hover:bg-muted/10'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'reviews' ? 'bg-primary text-white' : 'text-muted hover:bg-muted/10'
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'availability' ? 'bg-primary text-white' : 'text-muted hover:bg-muted/10'
                  }`}
                >
                  Availability
                </button>
              </div>

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Parking Rules</h3>
                    <ul className="list-disc list-inside text-muted space-y-1">
                      <li>First come, first served basis</li>
                      <li>No overnight parking without prior arrangement</li>
                      <li>Vehicles must be removed by closing time</li>
                      <li>No refunds for early departures</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Operating Hours</h3>
                    <div className="flex items-center gap-2 text-muted">
                      <Clock className="h-4 w-4" />
                      <span>24/7</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Contact Information</h3>
                    <div className="text-muted">
                      <p>Email: {spot.ownerEmail || 'Not provided'}</p>
                      <p>Phone: (123) 456-7890</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <ReviewList parkingSpotId={spot._id || spot.id} />
              )}

              {activeTab === 'availability' && (
                <AvailabilityCalendar parkingSpotId={spot._id || spot.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 