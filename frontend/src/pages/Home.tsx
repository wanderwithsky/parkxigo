import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Map, MapPin, Smartphone, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useParking } from '../context/ParkingContext';
import { ParkingSpotCard } from '../components/ParkingSpot/ParkingSpotCard';

export default function Home() {
  const { parkingSpots } = useParking();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5">
        <div className="container-custom py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Find Perfect Parking <br />
                <span className="text-primary">Near Your Destination</span>
              </h1>
              <p className="text-lg text-muted mb-8 max-w-lg">
                Say goodbye to parking stress. ParkXigo helps you discover, reserve, and pay for parking spots near you with just a few taps.
              </p>
              
              <form onSubmit={handleSearch} className="relative max-w-md mb-8">
                <div className={`flex items-center overflow-hidden rounded-lg border border-input transition-shadow duration-300 ${isSearchFocused ? 'ring-2 ring-primary/50' : ''}`}>
                  <div className="pl-3">
                    <MapPin className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for parking near..."
                    className="w-full px-3 py-3 bg-transparent border-none focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
              
              <div className="flex items-center gap-6">
                <Link
                  to="/search"
                  className="btn btn-primary"
                >
                  Find Parking
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline"
                >
                  List Your Space
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl transform rotate-3"></div>
              <img
                src="https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Parking made easy"
                className="relative z-10 rounded-2xl shadow-elevation-medium object-cover w-full h-[500px] transform -rotate-3 transition-transform hover:rotate-0 duration-500"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How ParkXigo Works</h2>
            <p className="text-muted">Our simple three-step process makes finding and reserving parking spaces effortless.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Map className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Parking</h3>
              <p className="text-muted">Search for available parking spots near your destination based on location, price, and amenities.</p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Book & Pay</h3>
              <p className="text-muted">Reserve your spot in advance and pay securely through our platform to guarantee availability.</p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Park & Go</h3>
              <p className="text-muted">Show your digital parking pass at the location and enjoy stress-free parking at your destination.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Spots Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular Parking Spots</h2>
              <p className="text-muted">Discover top-rated parking locations in your area</p>
            </div>
            <Link to="/search" className="btn btn-primary mt-4 md:mt-0 flex items-center gap-2">
              View All Spots
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {parkingSpots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingSpots.slice(0, 6).map((spot) => (
                <Link key={spot._id || spot.id} to={`/parking/${spot._id || spot.id}`}>
                  <ParkingSpotCard
                    id={spot._id || spot.id}
                    title={spot.title}
                    address={spot.address}
                    price={spot.price}
                    availableSpots={spot.availableSpots}
                    totalSpots={spot.totalSpots}
                    features={spot.features}
                    images={spot.images}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No Parking Spots Available</h3>
              <p className="text-muted mb-4">
                There are currently no parking spots listed on our platform.
              </p>
              <Link to="/register" className="btn btn-primary">
                List Your Space
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* App Promotion Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="ParkXigo Mobile App"
                className="rounded-2xl shadow-elevation-medium object-cover h-[500px] w-full mx-auto"
              />
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Coming Soon to Your <span className="text-primary">Mobile Device</span>
              </h2>
              <p className="text-lg text-muted mb-8">
                Experience the full power of ParkXigo on the go. Our mobile app will be available soon on iOS and Android, bringing parking solutions to your fingertips.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="card p-4 flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Real-time Navigation</h3>
                    <p className="text-sm text-muted">Turn-by-turn directions to your reserved parking spot</p>
                  </div>
                </div>
                
                <div className="card p-4 flex items-start gap-4">
                  <div className="bg-secondary/10 p-3 rounded-full flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Mobile Payments</h3>
                    <p className="text-sm text-muted">Secure, contactless payments for all parking transactions</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#" className="btn bg-foreground text-background hover:bg-foreground/90 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M17.2 20.2h-2.2c-2.1 0-3.8-1.7-3.8-3.8v-7c0-2.1 1.7-3.8 3.8-3.8h3c2.1 0 3.8 1.7 3.8 3.8v7"/><path d="M12 9.3v.7c0 .9-.5 1.4-1.3 1.4H7.8c-1.3 0-2.4 1.1-2.4 2.5v.8c0 1.4 1.1 2.5 2.4 2.5h2.7c1 0 1.1.8 1.1 1.3"/></svg>
                  App Store
                </a>
                <a href="#" className="btn bg-foreground text-background hover:bg-foreground/90 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polygon points="3 3 21 12 3 21 3 3"/></svg>
                  Google Play
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}