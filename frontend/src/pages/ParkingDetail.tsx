import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, Clock, MapPin, Car, Shield, Info, Star, StarHalf, MessageSquare, ThumbsUp, ThumbsDown, Calendar, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import MapDisplay from '../components/Map/MapDisplay';
import { useParking } from '../context/ParkingContext';
import { useAuth } from '../context/AuthContext';

interface ParkingSpot {
  id: string;
  _id?: string;
  title: string;
  description: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  price: number;
  totalSpots: number;
  availableSpots: number;
  features: string[];
  ownerId: string;
  ownerEmail?: string;
  images: string[];
  availability: {
    from: Date;
    to: Date;
  };
}

const geocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  const data = await res.json();
  if (data && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
};

// Update API URL to use port 5002
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  dislikes: number;
  createdAt: string;
}

interface AvailabilitySlot {
  date: string;
  timeSlots: {
    start: string;
    end: string;
    available: boolean;
  }[];
}

export default function ParkingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parkingSpots, bookParkingSpot } = useParking();
  const { user } = useAuth();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 20.5937, lng: 78.9629 });
  
  console.log('Parking Detail - ID:', id);
  console.log('All Parking Spots:', parkingSpots);
  
  const parkingSpot = parkingSpots.find(spot => {
    const matches = spot.id === id || spot._id === id;
    console.log('Checking spot:', spot, 'matches:', matches);
    return matches;
  });
  
  console.log('Found Parking Spot:', parkingSpot);
  
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [duration, setDuration] = useState<number>(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [similarSpots, setSimilarSpots] = useState<ParkingSpot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const updateMapCenter = async () => {
      if (parkingSpot) {
        if (parkingSpot.location.coordinates && parkingSpot.location.coordinates.length > 1) {
          setMapCenter({ lat: parkingSpot.location.coordinates[1], lng: parkingSpot.location.coordinates[0] });
        } else {
          const coords = await geocode(parkingSpot.address);
          if (coords) {
            setMapCenter(coords);
          }
        }
      }
    };
    updateMapCenter();
  }, [parkingSpot]);
  
  useEffect(() => {
    // Mock availability data - in a real app, this would come from your backend
    const generateMockAvailability = () => {
      const slots: AvailabilitySlot[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const timeSlots = [];
        for (let hour = 8; hour < 20; hour++) {
          timeSlots.push({
            start: `${hour.toString().padStart(2, '0')}:00`,
            end: `${(hour + 1).toString().padStart(2, '0')}:00`,
            available: Math.random() > 0.3 // 70% chance of being available
          });
        }
        
        slots.push({ date: dateStr, timeSlots });
      }
      setAvailability(slots);
    };

    generateMockAvailability();
  }, []);
  
  useEffect(() => {
    // Find similar parking spots based on features and location
    if (parkingSpot) {
      const similar = parkingSpots
        .filter(spot => 
          spot.id !== parkingSpot.id && 
          spot._id !== parkingSpot._id &&
          spot.price <= parkingSpot.price * 1.5 &&
          spot.price >= parkingSpot.price * 0.5
        )
        .slice(0, 3);
      setSimilarSpots(similar);
    }
  }, [parkingSpot, parkingSpots]);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews/parking-spot/${id}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);
  
  if (!parkingSpot) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-semibold mb-4">Parking Spot Not Found</h1>
          <p className="text-muted mb-6">
            The parking spot you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="btn btn-primary"
          >
            Back to Search
          </button>
        </div>
      </Layout>
    );
  }
  
  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Instead of showing the modal, navigate to the payment page
    navigate(`/payment/${parkingSpot._id || parkingSpot.id}`);
  };
  
  const confirmBooking = () => {
    if (!user) return;
    
    // Create start and end date objects
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
    
    try {
      console.log('Attempting to book parking spot with ID:', parkingSpot.id);
      console.log('Parking spot object:', parkingSpot);
      bookParkingSpot(parkingSpot._id || parkingSpot.id, user.id, startDateTime, endDateTime)
        .then(() => {
          navigate('/profile');
        })
        .catch(err => {
          console.error('Booking failed:', err);
          setError('Failed to book parking spot: ' + (err.message || 'Unknown error'));
        });
    } catch (error) {
      console.error('Booking preparation failed:', error);
      setError('Failed to prepare booking information');
    }
  };
  
  const calculatedPrice = (parkingSpot.price * duration).toFixed(2);
  
  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('parkxigo-token');
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parkingSpotId: id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const review = await res.json();
      setReviews(prev => [review, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactToReview = async (reviewId: string, action: 'like' | 'dislike') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('parkxigo-token');
      const res = await fetch(`${API_URL}/reviews/${reviewId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error('Failed to update reaction');

      const updatedReview = await res.json();
      setReviews(prev =>
        prev.map(review =>
          review._id === updatedReview._id ? updatedReview : review
        )
      );
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };
  
  const findSimilarSpots = () => {
    if (!parkingSpot) return [];
    
    return parkingSpots
      .filter(spot => 
        spot.id !== parkingSpot.id && 
        spot._id !== parkingSpot._id &&
        spot.price <= parkingSpot.price * 1.5 &&
        spot.price >= parkingSpot.price * 0.5
      )
      .slice(0, 3);
  };
  
  return (
    <Layout>
      <div className="container-custom py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-6">
              <img 
                src={parkingSpot.images[0]} 
                alt={parkingSpot.title}
                className="w-full h-full object-cover" 
              />
            </div>
            
            <h1 className="text-3xl font-bold mb-3">{parkingSpot.title}</h1>
            
            <div className="flex items-start gap-2 mb-6 text-muted">
              <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{parkingSpot.address}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Available Spots</p>
                  <p className="font-semibold">{parkingSpot.availableSpots} / {parkingSpot.totalSpots}</p>
                </div>
              </div>
              
              <div className="card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Hourly Rate</p>
                  <p className="font-semibold">₹{parkingSpot.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted">Security</p>
                  <p className="font-semibold">24/7 Monitored</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <div className="flex flex-wrap gap-2">
                {parkingSpot.features.map((feature, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Availability</h2>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availability
                    .find(slot => slot.date === selectedDate)
                    ?.timeSlots.map((timeSlot, index) => (
                      <button
                        key={index}
                        className={`p-2 rounded text-sm ${
                          timeSlot.available
                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                            : 'bg-muted/10 text-muted cursor-not-allowed'
                        }`}
                        disabled={!timeSlot.available}
                        onClick={() => {
                          setStartDate(selectedDate);
                          setStartTime(timeSlot.start);
                        }}
                      >
                        {timeSlot.start}
                      </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-muted">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded bg-primary/10"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded bg-muted/10"></div>
                    <span>Unavailable</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Similar Parking Spots</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {findSimilarSpots().map(spot => (
                  <div key={spot._id || spot.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{spot.title}</h3>
                      <span className="text-primary font-medium">
                        ₹{spot.price.toFixed(2)}/hr
                      </span>
                    </div>
                    <div className="flex items-start gap-2 mb-2 text-sm text-muted">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{spot.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          (spot.availableSpots / spot.totalSpots) > 0.5 
                            ? 'bg-success' 
                            : (spot.availableSpots / spot.totalSpots) > 0.2 
                              ? 'bg-warning' 
                              : 'bg-error'
                        } mr-2`}></div>
                        <span className="text-sm">
                          {spot.availableSpots} of {spot.totalSpots} spots
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {spot.features.slice(0, 2).map((feature: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {feature}
                        </span>
                      ))}
                      {spot.features.length > 2 && (
                        <span className="inline-flex items-center rounded-full bg-muted/20 px-2 py-0.5 text-xs font-medium text-muted">
                          +{spot.features.length - 2} more
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/parking/${spot._id || spot.id}`}
                      className="btn btn-outline w-full"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="card p-4 mb-6">
                <MapDisplay 
                  center={{ 
                    lat: parkingSpot.location.coordinates[1], 
                    lng: parkingSpot.location.coordinates[0] 
                  }}
                  markers={[{
                    id: parkingSpot._id || parkingSpot.id,
                    name: parkingSpot.title,
                    lat: parkingSpot.location.coordinates[1],
                    lng: parkingSpot.location.coordinates[0],
                  }]}
                  height="300px"
                />
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Reviews</h2>
                <button 
                  onClick={() => setIsReviewModalOpen(true)}
                  className="btn btn-primary"
                >
                  Write a Review
                </button>
              </div>

              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review._id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium">{review.userName[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{review.userName}</p>
                          <p className="text-sm text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted mb-3">{review.comment}</p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleReactToReview(review._id, 'like')}
                        className="flex items-center gap-1 text-sm text-muted hover:text-primary"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.likes}</span>
                      </button>
                      <button 
                        onClick={() => handleReactToReview(review._id, 'dislike')}
                        className="flex items-center gap-1 text-sm text-muted hover:text-primary"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{review.dislikes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="card p-6 mb-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Book This Spot</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <CalendarIcon className="w-4 h-4 text-muted" />
                    </div>
                    <input
                      type="date"
                      className="input pl-10 w-full"
                      min={new Date().toISOString().split('T')[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Clock className="w-4 h-4 text-muted" />
                    </div>
                    <input
                      type="time"
                      className="input pl-10 w-full"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-primary/20"
                  />
                  <div className="flex justify-between text-sm text-muted mt-1">
                    <span>1h</span>
                    <span>{duration}h</span>
                    <span>8h</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-muted">Rate:</span>
                  <span>₹{parkingSpot.price.toFixed(2)} / hour</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted">Duration:</span>
                  <span>{duration} hours</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-2">
                  <span>Total:</span>
                  <span>₹{calculatedPrice}</span>
                </div>
              </div>
              
              <button
                onClick={handleBooking}
                className="btn btn-primary w-full"
                disabled={parkingSpot.availableSpots === 0}
              >
                {parkingSpot.availableSpots === 0 ? 'No Spots Available' : 'Book Now'}
              </button>
              
              {parkingSpot.availableSpots <= 5 && parkingSpot.availableSpots > 0 && (
                <p className="text-warning text-sm text-center mt-2">
                  Only {parkingSpot.availableSpots} spots left! Book soon.
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-4 p-3 bg-muted/10 rounded-md text-xs text-muted">
                <Info className="h-4 w-4 flex-shrink-0" />
                <p>Your spot is only reserved after payment is completed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Confirmation Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Booking</h3>
            
            <div className="border-b border-border pb-4 mb-4">
              <h4 className="font-medium mb-2">{parkingSpot.title}</h4>
              <p className="text-sm text-muted mb-2">{parkingSpot.address}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted">Date:</p>
                  <p>{startDate}</p>
                </div>
                <div>
                  <p className="text-muted">Time:</p>
                  <p>{startTime}</p>
                </div>
                <div>
                  <p className="text-muted">Duration:</p>
                  <p>{duration} hours</p>
                </div>
                <div>
                  <p className="text-muted">Total Price:</p>
                  <p className="font-medium">₹{calculatedPrice}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted">
                By confirming, you agree to the booking terms and cancellation policy.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="btn btn-primary flex-1"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full relative z-50">
            <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
            {error && (
              <div className="mb-4 p-3 bg-error/10 text-error rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating <= newReview.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="input w-full h-32"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="btn btn-outline flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="btn btn-primary flex-1"
                  disabled={!newReview.comment.trim() || isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}