import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Car, MapPin, Calendar, Clock, Users, Info } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import MapDisplay from '../../components/Map/MapDisplay';
import { useAuth } from '../../context/AuthContext';
import { useParking } from '../../context/ParkingContext';
import { Link } from 'react-router-dom';

// Update API URL to use port 5002
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

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

interface NewParkingSpot {
  title: string;
  description: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  price: number;
  totalSpots: number;
  availableSpots: number;
  features: string[];
  images: string[];
  ownerId: string;
  ownerEmail?: string;
  availability: {
    from: Date;
    to: Date;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { 
    parkingSpots, 
    getParkingSpotsByOwner,
    getBookingsByParkingSpotOwner,
    addParkingSpot,
    deleteParkingSpot
  } = useParking();
  
  const [activeTab, setActiveTab] = useState('parkings');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [spotToDelete, setSpotToDelete] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const initialNewSpot: NewParkingSpot = {
    title: '',
    description: '',
    address: '',
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    price: 0,
    totalSpots: 0,
    availableSpots: 0,
    features: [],
    images: [],
    ownerId: user?.id || '',
    ownerEmail: user?.email,
    availability: {
      from: new Date(),
      to: new Date()
    }
  };

  const [newSpot, setNewSpot] = useState<NewParkingSpot>(initialNewSpot);
  
  const [featureInput, setFeatureInput] = useState('');
  
  const [parkingSpot, setParkingSpot] = useState<any>(null);
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  
  if (!user) return null;
  
  const ownerParkingSpots = getParkingSpotsByOwner(user.id);
  const ownerBookings = getBookingsByParkingSpotOwner(user.id);
  
  const recentBookings = [...ownerBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleAddFeature = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && featureInput.trim()) {
      e.preventDefault();
      const feature = featureInput.trim();
      if (!newSpot.features.includes(feature)) {
        setNewSpot({
          ...newSpot,
          features: [...newSpot.features, feature]
        });
      }
      setFeatureInput('');
    }
  };
  
  const removeFeature = (feature: string) => {
    setNewSpot({
      ...newSpot,
      features: newSpot.features.filter(f => f !== feature)
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'price' || name === 'totalSpots') {
      setNewSpot(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setNewSpot(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };
  
  const handleMapClick = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    setNewSpot(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    }));
  };
  
  const handleAddParkingSpot = async () => {
    if (!user) return;
    
    // Validate required fields
    if (!newSpot.title || !newSpot.description || !newSpot.address || newSpot.price <= 0 || newSpot.totalSpots <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create FormData for image upload
      const formData = new FormData();
      selectedImages.forEach((file, index) => {
        formData.append('images', file);
      });

      // Add other spot data
      formData.append('title', newSpot.title);
      formData.append('description', newSpot.description);
      formData.append('address', newSpot.address);
      formData.append('price', newSpot.price.toString());
      formData.append('totalSpots', newSpot.totalSpots.toString());
      formData.append('features', JSON.stringify(newSpot.features));
      formData.append('ownerId', user.id);
      formData.append('ownerEmail', user.email || '');
      formData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [mapCenter.lng, mapCenter.lat]
      }));

      // Set availability dates
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      const availability = {
        from: now.toISOString(),
        to: oneYearFromNow.toISOString()
      };
      formData.append('availability', JSON.stringify(availability));

      // Log the data being sent
      console.log('Sending data:', {
        title: newSpot.title,
        description: newSpot.description,
        address: newSpot.address,
        price: newSpot.price,
        totalSpots: newSpot.totalSpots,
        features: newSpot.features,
        ownerId: user.id,
        ownerEmail: user.email,
        location: {
          type: 'Point',
          coordinates: [mapCenter.lng, mapCenter.lat]
        },
        availability
      });

      const token = localStorage.getItem('parkxigo-token');
      
      // Check if the server is reachable
      try {
        const pingRes = await fetch(`${API_URL}/auth/ping`, { 
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!pingRes.ok) {
          console.warn('Server ping failed, but will continue with upload attempt');
        }
      } catch (pingError) {
        console.error('Server ping failed:', pingError);
        alert('Server appears to be offline. Please check your connection and try again.');
        return;
      }

      const res = await fetch(`${API_URL}/parkingspots`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Error creating parking spot');
      }

      const spot = await res.json();
      
      // IMPORTANT: Update the parking spots in the context after adding a new one
      // This ensures the UI gets updated with the new spot
      getParkingSpotsByOwner(user.id);
      
      setNewSpot(initialNewSpot);
      setSelectedImages([]);
      setPreviewUrls([]);
    setIsAddModalOpen(false);

      // Show success message
      alert('Parking spot added successfully! It will now appear on the homepage and in search results.');

      // Reload the page to ensure all data is refreshed
      window.location.reload();
    } catch (error) {
      console.error('Error adding parking spot:', error);
      
      // Show a more user-friendly error message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Could not connect to the server. Please check if the backend is running.');
      } else {
        alert(`Failed to add parking spot: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };
  
  const handleDeleteParkingSpot = async () => {
    if (!spotToDelete) return;
    
    try {
      setIsProcessing(true);
      await deleteParkingSpot(spotToDelete);
      
      // Update the local state to remove the deleted spot
      const updatedSpots = ownerParkingSpots.filter(spot => 
        spot.id !== spotToDelete && (spot._id ? spot._id !== spotToDelete : true)
      );
      
      setSpotToDelete(null);
      setIsDeleteModalOpen(false);
      
      // Show success message
      alert('Parking spot deleted successfully! It will be removed from the homepage and search results.');
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error deleting parking spot:', error);
      alert(`Failed to delete parking spot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Layout>
      <div className="container-custom py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted">Manage your parking spots and view bookings</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary mt-4 md:mt-0 flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Parking Spot
          </button>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted">Total Parking Spots</p>
                <h3 className="text-2xl font-bold">{ownerParkingSpots.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-muted">Total Bookings</p>
                <h3 className="text-2xl font-bold">{ownerBookings.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-muted">Available Spaces</p>
                <h3 className="text-2xl font-bold">
                  {ownerParkingSpots.reduce((total, spot) => total + spot.availableSpots, 0)}
                </h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('parkings')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'parkings'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted'
              }`}
            >
              My Parking Spots
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'parkings' && (
          <div>
            {ownerParkingSpots.length === 0 ? (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No Parking Spots</h3>
                <p className="text-muted mb-4">
                  You haven't added any parking spots yet. Add your first spot to start receiving bookings.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn btn-primary"
                >
                  Add Parking Spot
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownerParkingSpots.map((spot) => (
                  <div key={spot._id || spot.id} className="card overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      {spot.images && spot.images.length > 0 ? (
                        <img 
                          src={spot.images[0]} 
                          alt={spot.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                          <Car className="h-10 w-10 text-muted" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpot(spot);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background"
                          aria-label="View Details"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                            <button
                          className="p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background"
                              aria-label="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                          onClick={(e) => {
                            e.stopPropagation();
                                setSpotToDelete(spot._id || spot.id);
                                setIsDeleteModalOpen(true);
                              }}
                          className="p-1.5 bg-error/80 backdrop-blur-sm rounded-full hover:bg-error text-white"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-1">{spot.title}</h3>
                      <div className="flex items-center text-muted text-sm mb-3">
                        <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">{spot.address}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-semibold">₹{spot.price?.toFixed(2) || '0.00'}</span>
                          <span className="text-muted text-sm">/hr</span>
                        </div>
                        <div className="text-sm">
                          <span className={spot.availableSpots === 0 ? 'text-error' : 'text-success'}>
                            {spot.availableSpots || 0}
                          </span>
                          /{spot.totalSpots || 0} spots
                        </div>
                      </div>
                      {spot.features && spot.features.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {spot.features.slice(0, 3).map((feature, index) => (
                            <span key={index} className="px-2 py-0.5 bg-muted/20 rounded-full text-xs">
                              {feature}
                            </span>
                          ))}
                          {spot.features.length > 3 && (
                            <span className="px-2 py-0.5 bg-muted/20 rounded-full text-xs">
                              +{spot.features.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'bookings' && (
          <div>
            <div className="card mb-6">
              <div className="border-b border-border p-4">
                <h2 className="font-semibold">Recent Bookings</h2>
              </div>
              
              {recentBookings.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted">No bookings yet for your parking spots.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Booking ID</th>
                        <th className="text-left py-3 px-4 font-medium">Parking Spot</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Time</th>
                        <th className="text-left py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking) => {
                        const spot = parkingSpots.find(s => s._id === booking.parkingSpotId || s.id === booking.parkingSpotId);
                        return (
                          <tr key={booking.id} className="border-b border-border hover:bg-muted/5">
                            <td className="py-3 px-4">#{booking.id.slice(0, 8)}</td>
                            <td className="py-3 px-4">{spot?.title}</td>
                            <td className="py-3 px-4">{formatDate(booking.startTime)}</td>
                            <td className="py-3 px-4">{formatTime(booking.startTime)}</td>
                            <td className="py-3 px-4">₹{booking.totalCost.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' 
                                  ? 'bg-success/10 text-success' 
                                  : booking.status === 'completed'
                                  ? 'bg-secondary/10 text-secondary'
                                  : 'bg-error/10 text-error'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <button className="btn btn-outline">
                View All Bookings
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="card p-6 text-center">
            <h3 className="text-lg font-medium mb-4">Analytics Coming Soon</h3>
            <p className="text-muted">
              We're working on a comprehensive analytics dashboard to help you track bookings, revenue, and occupancy rates.
            </p>
          </div>
        )}
      </div>
      
      {/* Add Parking Spot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full">
            <div className="border-b border-border p-4">
              <h2 className="text-xl font-semibold">Add New Parking Spot</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newSpot.title}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter parking spot title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={newSpot.description}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter parking spot description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={newSpot.address}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter parking spot address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($/hr)</label>
                  <input
                    type="number"
                    name="price"
                    value={newSpot.price}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter hourly rate"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Spots</label>
                  <input
                    type="number"
                    name="totalSpots"
                    value={newSpot.totalSpots}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter total number of spots"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Features</label>
                  <input
                    type="text"
                    name="features"
                    value={newSpot.features.join(', ')}
                    onChange={(e) => setNewSpot(prev => ({
                      ...prev,
                      features: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                    }))}
                    className="input w-full"
                    placeholder="Enter features (comma-separated)"
                  />
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload Images</label>
                <div className="flex flex-wrap gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedImages(prev => prev.filter((_, i) => i !== index));
                          setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute top-1 right-1 bg-error/80 text-white rounded-full p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-32 h-32 border-2 border-dashed border-muted rounded-lg flex items-center justify-center cursor-pointer hover:border-primary">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <PlusCircle className="h-8 w-8 text-muted" />
                  </label>
                </div>
              </div>
              
              {/* Map Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select Location</label>
                <div className="h-64 rounded-lg overflow-hidden">
                  <MapDisplay
                    center={mapCenter}
                    markers={[{
                        id: 'new-spot',
                      name: 'New Parking Spot',
                      lat: mapCenter.lat,
                      lng: mapCenter.lng,
                    }]}
                    height="100%"
                    onClick={handleMapClick}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddParkingSpot}
                  className="btn btn-primary"
                >
                  Add Parking Spot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Delete Parking Spot</h3>
              <p className="text-muted mb-6">Are you sure you want to delete this parking spot? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn btn-outline flex-1"
                  disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                  onClick={handleDeleteParkingSpot}
                className="btn bg-error text-white hover:bg-error/90 flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">⌛</span>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Parking Spot Modal */}
      {isViewModalOpen && selectedSpot && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card max-w-4xl w-full">
            <div className="border-b border-border p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Parking Spot Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-full hover:bg-muted/10"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side - Details */}
                <div>
                  <div className="relative h-48 overflow-hidden rounded-lg mb-4">
                    {selectedSpot.images && selectedSpot.images.length > 0 ? (
                      <img 
                        src={selectedSpot.images[0]} 
                        alt={selectedSpot.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                        <Car className="h-16 w-16 text-muted" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-sm font-medium">
                      ₹{selectedSpot.price?.toFixed(2) || '0.00'}/hr
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{selectedSpot.title}</h3>
                  
                  <div className="flex items-start gap-2 mb-4 text-muted">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{selectedSpot.address}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted mb-1">Total Spots</h4>
                      <p>{selectedSpot.totalSpots}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted mb-1">Available Spots</h4>
                      <p>{selectedSpot.availableSpots}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted mb-1">Description</h4>
                    <p className="text-sm">{selectedSpot.description || 'No description provided.'}</p>
                  </div>
                  
                  {selectedSpot.features && selectedSpot.features.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted mb-1">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSpot.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <Link
                      to={`/parking/${selectedSpot._id || selectedSpot.id}`}
                      className="btn btn-primary flex-1"
                    >
                      View Full Details
                    </Link>
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        setSpotToDelete(selectedSpot._id || selectedSpot.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="btn btn-outline flex-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Right side - Map */}
                <div>
                  <div className="h-80 rounded-lg overflow-hidden">
                    <MapDisplay 
                      center={{ 
                        lat: selectedSpot.location && selectedSpot.location.coordinates ? selectedSpot.location.coordinates[1] : 0, 
                        lng: selectedSpot.location && selectedSpot.location.coordinates ? selectedSpot.location.coordinates[0] : 0 
                      }}
                      markers={[{
                        id: selectedSpot._id || selectedSpot.id,
                        name: selectedSpot.title,
                        lat: selectedSpot.location && selectedSpot.location.coordinates ? selectedSpot.location.coordinates[1] : 0,
                        lng: selectedSpot.location && selectedSpot.location.coordinates ? selectedSpot.location.coordinates[0] : 0,
                      }]}
                      height="100%"
                      zoom={15}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-muted mb-1">Location Coordinates</h4>
                    <p className="text-sm">Latitude: {selectedSpot.location?.coordinates?.[1] || 'N/A'}</p>
                    <p className="text-sm">Longitude: {selectedSpot.location?.coordinates?.[0] || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}