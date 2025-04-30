import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useParking } from '../context/ParkingContext';

export default function Profile() {
  const { user } = useAuth();
  const { userBookings, cancelBooking, parkingSpots } = useParking();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  
  if (!user) return null;
  
  const userBookingsList = userBookings.filter(booking => booking.userId === user.id);
  
  const getParkingSpotById = (id: string) => {
    return parkingSpots.find(spot => spot.id === id);
  };
  
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
  
  const handleCancelBooking = () => {
    if (bookingToDelete) {
      cancelBooking(bookingToDelete);
      setBookingToDelete(null);
      setIsDeleteModalOpen(false);
      if (selectedBooking === bookingToDelete) {
        setSelectedBooking(null);
      }
    }
  };
  
  const activeBookings = userBookingsList.filter(booking => booking.status === 'confirmed');
  const pastBookings = userBookingsList.filter(booking => booking.status !== 'confirmed');
  
  return (
    <Layout>
      <div className="container-custom py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted">Welcome back, {user.name}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-muted">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted mb-1">Account Type</h3>
                  <p className="capitalize">{user.role}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted mb-1">Active Bookings</h3>
                  <p>{activeBookings.length}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted mb-1">Past Bookings</h3>
                  <p>{pastBookings.length}</p>
                </div>
              </div>
            </div>
            
            {user.role === 'admin' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
                <a href="/admin" className="btn btn-primary w-full mb-2">
                  Dashboard
                </a>
                <p className="text-sm text-muted">
                  Manage your parking spots and view bookings.
                </p>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="border-b border-border p-4">
                <h2 className="text-xl font-semibold">My Parkings</h2>
              </div>
              
              {activeBookings.length === 0 && pastBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No Bookings Yet</h3>
                  <p className="text-muted mb-4">
                    You haven't made any parking bookings yet.
                  </p>
                  <a href="/search" className="btn btn-primary">
                    Find Parking
                  </a>
                </div>
              ) : (
                <>
                  {activeBookings.length > 0 && (
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-3">Active Bookings</h3>
                      <div className="space-y-4">
                        {activeBookings.map(booking => {
                          const spot = getParkingSpotById(booking.parkingSpotId);
                          return (
                            <div 
                              key={booking.id} 
                              className={`card border ${selectedBooking === booking.id ? 'border-primary' : 'border-border'} transition-colors duration-200 cursor-pointer`}
                              onClick={() => setSelectedBooking(booking.id === selectedBooking ? null : booking.id)}
                            >
                              <div className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium mb-1">{spot?.name}</h4>
                                    <div className="flex items-center gap-1 text-muted text-sm mb-2">
                                      <MapPin className="h-3 w-3" />
                                      <span>{spot?.address}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-muted" />
                                        <span>{formatDate(booking.startTime)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-muted" />
                                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setBookingToDelete(booking.id);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="text-error hover:bg-error/10 p-1 rounded"
                                    aria-label="Cancel booking"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                
                                {selectedBooking === booking.id && (
                                  <div className="mt-4 pt-4 border-t border-border">
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                      <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <QRCodeSVG 
                                          value={booking.qrCode}
                                          size={150}
                                          level="H"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-medium mb-2">Booking Details</h5>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="text-muted">Booking ID:</span> #{booking.id.slice(0, 8)}</p>
                                          <p><span className="text-muted">Total Cost:</span> ₹{booking.totalCost.toFixed(2)}</p>
                                          <p><span className="text-muted">Status:</span> <span className="text-success font-medium">Active</span></p>
                                          <p className="text-xs text-muted mt-4">
                                            Show this QR code to the parking attendant upon arrival.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {pastBookings.length > 0 && (
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-3">Past Bookings</h3>
                      <div className="space-y-3">
                        {pastBookings.map(booking => {
                          const spot = getParkingSpotById(booking.parkingSpotId);
                          return (
                            <div key={booking.id} className="card border border-border p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium mb-1">{spot?.name}</h4>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-muted" />
                                      <span>{formatDate(booking.startTime)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-muted" />
                                      <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/10 text-muted">
                                  {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Cancel Booking</h3>
            <p className="text-muted mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn btn-outline flex-1"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelBooking}
                className="btn bg-error text-white hover:bg-error/90 flex-1"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}