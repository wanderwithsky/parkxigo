import React, { createContext, useContext, useState, useEffect } from 'react';
// import { v4 as uuidv4 } from 'uuid'; // DELETE if not used elsewhere

// --- DELETE MOCK DATA BELOW ---
// const mockParkingSpots = [
//   {
//     id: '1',
//     name: 'Downtown Secure Parking',
//     address: '123 Main St, Downtown',
//     lat: 40.7128,
//     lng: -74.0060,
//     hourlyRate: 5.99,
//     availableSpots: 15,
//     totalSpots: 30,
//     features: ['24/7 Access', 'Security Cameras', 'Covered'],
//     ownerId: '2',
//     image: 'https://images.pexels.com/photos/1004665/pexels-photo-1004665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
//   },
//   {
//     id: '2',
//     name: 'Central Park Garage',
//     address: '456 Park Ave, Midtown',
//     lat: 40.7812,
//     lng: -73.9665,
//     hourlyRate: 8.99,
//     availableSpots: 5,
//     totalSpots: 50,
//     features: ['Electric Charging', 'Valet Service', 'Car Wash'],
//     ownerId: '2',
//     image: 'https://images.pexels.com/photos/3457780/pexels-photo-3457780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
//   },
//   {
//     id: '3',
//     name: 'Riverside Parking Lot',
//     address: '789 River Rd, Westside',
//     lat: 40.7232,
//     lng: -74.0123,
//     hourlyRate: 3.50,
//     availableSpots: 25,
//     totalSpots: 40,
//     features: ['Outdoor', 'CCTV Monitoring'],
//     ownerId: '2',
//     image: 'https://images.pexels.com/photos/90479/pexels-photo-90479.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
//   }
// ];
// --- END DELETE ---

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

interface Booking {
  id: string;
  parkingSpotId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  totalCost: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  qrCode: string;
  createdAt: Date;
}

interface ParkingContextType {
  parkingSpots: ParkingSpot[];
  userBookings: Booking[];
  searchParkingSpots: (location: string) => ParkingSpot[];
  bookParkingSpot: (
    parkingSpotId: string,
    userId: string,
    startTime: Date,
    endTime: Date
  ) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  addParkingSpot: (parkingSpot: Omit<ParkingSpot, 'id'>) => Promise<ParkingSpot>;
  getParkingSpotsByOwner: (ownerId: string) => ParkingSpot[];
  getBookingsByParkingSpotOwner: (ownerId: string) => Booking[];
  deleteParkingSpot: (spotId: string) => Promise<void>;
  addBookingAfterPayment: (bookingDetails: Partial<Booking>) => Booking;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchParkingSpots = async () => {
      try {
        const res = await fetch(`${API_URL}/parkingspots`);
        if (!res.ok) {
          throw new Error(`Failed to fetch parking spots: ${res.status}`);
        }
        const data = await res.json();
        console.log('Raw API Response:', data);
        
        // Only update state if component is still mounted
        if (isMounted) {
          if (data.length > 0) {
            console.log('First parking spot structure:', data[0]);
            console.log('ID type of first spot:', data[0]?._id ? '_id' : 'id');
          }
          setParkingSpots(data);
        }
      } catch (error) {
        console.error('Error fetching parking spots:', error);
      }
    };
    
    fetchParkingSpots();
    
    // Cleanup function to handle unmounting
    return () => {
      isMounted = false;
    };
  }, []);

  const searchParkingSpots = (location: string) => {
    if (!location) return parkingSpots;
    return parkingSpots.filter(spot =>
      (spot.address?.toLowerCase() || '').includes(location.toLowerCase()) ||
      (spot.title?.toLowerCase() || '').includes(location.toLowerCase())
    );
  };

  const bookParkingSpot = async (
    parkingSpotId: string,
    userId: string,
    startTime: Date,
    endTime: Date
  ): Promise<Booking> => {
    const token = localStorage.getItem('parkxigo-token');
    
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parkingSpotId, startTime, endTime }),
      });
      
      // Handle unsuccessful responses properly
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || 'Booking failed');
      }
      
      const booking = await res.json();
      setBookings(prev => [...prev, booking]);
      return booking;
    } catch (error) {
      console.error('Error in bookParkingSpot:', error);
      throw error; // Re-throw to let the component handle it
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem('parkxigo-token');
    const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Cancel failed');
    const updated = await res.json();
    setBookings(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  };

  const addParkingSpot = async (parkingSpot: Omit<ParkingSpot, 'id'>) => {
    const token = localStorage.getItem('parkxigo-token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    console.log('Adding parking spot with data:', parkingSpot);

    const res = await fetch(`${API_URL}/parkingspots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...parkingSpot,
        availableSpots: parkingSpot.totalSpots,
        location: {
          type: 'Point',
          coordinates: parkingSpot.location.coordinates
        }
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Error creating parking spot');
    }

    const spot = await res.json();
    console.log('Created parking spot:', spot);
    
    // Refresh all parking spots from the API
    try {
      const spotsRes = await fetch(`${API_URL}/parkingspots`);
      if (spotsRes.ok) {
        const updatedSpots = await spotsRes.json();
        setParkingSpots(updatedSpots);
      } else {
        // If refresh fails, just add the new spot to the existing list
        setParkingSpots(prev => [...prev, spot]);
      }
    } catch (error) {
      console.error('Error refreshing parking spots:', error);
      // Fallback to just adding the new spot
      setParkingSpots(prev => [...prev, spot]);
    }
    
    return spot;
  };

  const getParkingSpotsByOwner = (ownerId: string) => {
    return parkingSpots.filter(spot => spot.ownerId === ownerId);
  };

  const getBookingsByParkingSpotOwner = (ownerId: string) => {
    return bookings.filter(booking => {
      const spot = parkingSpots.find(s => s.id === booking.parkingSpotId);
      return spot && spot.ownerId === ownerId;
    });
  };

  const deleteParkingSpot = async (spotId: string) => {
    const token = localStorage.getItem('parkxigo-token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const res = await fetch(`${API_URL}/parkingspots/${spotId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMessage = 'Error deleting parking spot';
        
        // Handle specific error codes
        if (res.status === 404) {
          errorMessage = 'Parking spot not found';
        } else if (res.status === 403) {
          errorMessage = 'You do not have permission to delete this parking spot';
        } else if (res.status === 401) {
          errorMessage = 'Authentication required';
        }
        
        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If parsing JSON fails, use the status-based message
        }
        
        throw new Error(errorMessage);
      }

      // Refresh all parking spots from the API
      try {
        const spotsRes = await fetch(`${API_URL}/parkingspots`);
        if (spotsRes.ok) {
          const updatedSpots = await spotsRes.json();
          setParkingSpots(updatedSpots);
        } else {
          // If refresh fails, just filter out the deleted spot
          setParkingSpots(prev => prev.filter(spot => 
            spot.id !== spotId && (spot._id ? spot._id !== spotId : true)
          ));
        }
      } catch (error) {
        console.error('Error refreshing parking spots:', error);
        // Fallback to just filtering out the deleted spot
        setParkingSpots(prev => prev.filter(spot => 
          spot.id !== spotId && (spot._id ? spot._id !== spotId : true)
        ));
      }
      
      return;
    } catch (error) {
      console.error('Error deleting parking spot:', error);
      throw error;
    }
  };

  const addBookingAfterPayment = (bookingDetails: Partial<Booking>): Booking => {
    // Create a booking with default values for any missing fields
    const newBooking: Booking = {
      id: bookingDetails.id || `booking-${Math.random().toString(36).substring(2, 10)}`,
      parkingSpotId: bookingDetails.parkingSpotId || '',
      userId: bookingDetails.userId || '',
      startTime: bookingDetails.startTime || new Date(),
      endTime: bookingDetails.endTime || new Date(),
      totalCost: bookingDetails.totalCost || 0,
      status: bookingDetails.status || 'confirmed',
      qrCode: bookingDetails.qrCode || `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(JSON.stringify({id: bookingDetails.id}))}`,
      createdAt: bookingDetails.createdAt ? new Date(bookingDetails.createdAt) : new Date(),
    };
    
    // Add the booking to the state
    setBookings(prev => [...prev, newBooking]);
    
    return newBooking;
  };

  return (
    <ParkingContext.Provider
      value={{
        parkingSpots,
        userBookings: bookings,
        searchParkingSpots,
        bookParkingSpot,
        cancelBooking,
        addParkingSpot,
        getParkingSpotsByOwner,
        getBookingsByParkingSpotOwner,
        deleteParkingSpot,
        addBookingAfterPayment
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
}