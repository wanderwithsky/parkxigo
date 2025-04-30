import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Sliders } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import MapDisplay from '../components/Map/MapDisplay';
import { ParkingSpotCard } from '../components/ParkingSpot/ParkingSpotCard';
import { useParking } from '../context/ParkingContext';

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

export default function Search() {
  const { searchParkingSpots, parkingSpots } = useParking();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(searchParkingSpots(initialQuery));
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 20.5937, lng: 78.9629 }); // Center of India
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number } | null>(null);
  const mapCenteredRef = useRef(false);

  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const allFeatures = [
    '24/7 Access', 'Security Cameras', 'Covered', 
    'Electric Charging', 'Valet Service', 'Car Wash',
    'Outdoor', 'CCTV Monitoring'
  ];

  useEffect(() => {
    setSearchResults(searchParkingSpots(initialQuery));
  }, [initialQuery, searchParkingSpots]);

  // Update search results when parkingSpots change
  useEffect(() => {
    setSearchResults(searchParkingSpots(searchQuery));
  }, [parkingSpots, searchParkingSpots, searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResults(searchParkingSpots(searchQuery));
    if (searchQuery) {
      const coords = await geocode(searchQuery);
      if (coords) {
        setMapCenter(coords);
        setSearchMarker(coords);
      }
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const filteredResults = searchResults.filter(spot => {
    const priceInRange = spot.price >= priceRange[0] && spot.price <= priceRange[1];
    const hasFeatures = selectedFeatures.length === 0 || 
      selectedFeatures.every(feature => spot.features.includes(feature));
    
    return priceInRange && hasFeatures;
  });

  // Ensure the map centers on the first parking spot if there are results
  useEffect(() => {
    // Only center the map once when results first load and no search marker exists
    if (filteredResults.length > 0 && !searchMarker && !mapCenteredRef.current) {
      const firstSpot = filteredResults[0];
      if (firstSpot.location && 
          Array.isArray(firstSpot.location.coordinates) && 
          firstSpot.location.coordinates.length >= 2) {
        mapCenteredRef.current = true;
        setMapCenter({
          lat: firstSpot.location.coordinates[1],
          lng: firstSpot.location.coordinates[0]
        });
      }
    }
  }, [filteredResults, searchMarker]);

  // Reset map centered ref when search marker changes
  useEffect(() => {
    if (searchMarker) {
      mapCenteredRef.current = true;
    }
  }, [searchMarker]);

  // Prepare markers for the map
  const markers = filteredResults
    .filter(spot => spot.location && Array.isArray(spot.location.coordinates) && spot.location.coordinates.length >= 2)
    .map(spot => ({
      id: spot._id || spot.id,
      name: spot.title || 'Unnamed Spot',
      lat: spot.location.coordinates[1],
      lng: spot.location.coordinates[0],
    }));

  if (searchMarker) {
    markers.unshift({
      id: 'search-location',
      name: 'Searched Location',
      lat: searchMarker.lat,
      lng: searchMarker.lng,
    });
  }

  return (
    <Layout>
      <div className="container-custom py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Parking Near You</h1>
          <p className="text-muted max-w-3xl">
            Search for available parking spots by location, compare rates, and reserve your spot in advance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and filters sidebar */}
          <div>
            <div className="card p-4 mb-6">
              <form onSubmit={handleSearch} className="mb-4">
                <div className={`flex items-center overflow-hidden rounded-lg border border-input transition-shadow duration-300 ${isSearchFocused ? 'ring-2 ring-primary/50' : ''}`}>
                  <div className="pl-3">
                    <MapPin className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search location..."
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
              
              <div>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 text-sm font-medium mb-4"
                >
                  <Sliders className="h-4 w-4" />
                  {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                </button>
                
                {isFilterOpen && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Price Range (per hour)</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted">₹{priceRange[0]}</span>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.5"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-primary/20"
                        />
                        <span className="text-sm text-muted">₹{priceRange[1]}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Features</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {allFeatures.map(feature => (
                          <div key={feature} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`feature-${feature}`}
                              checked={selectedFeatures.includes(feature)}
                              onChange={() => toggleFeature(feature)}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor={`feature-${feature}`} className="ml-2 text-sm text-muted">
                              {feature}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setPriceRange([0, 10]);
                        setSelectedFeatures([]);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card p-4">
              <MapDisplay center={mapCenter} markers={markers} height="300px" />
            </div>
          </div>
          
          {/* Search results */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {filteredResults.length} {filteredResults.length === 1 ? 'Result' : 'Results'} Found
            </h2>
            
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResults.map((spot) => (
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
                <h3 className="text-lg font-medium mb-2">No Parking Spots Found</h3>
                <p className="text-muted mb-4">
                  We couldn't find any parking spots matching your criteria. Try adjusting your search or filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange([0, 10]);
                    setSelectedFeatures([]);
                    setSearchMarker(null);
                    mapCenteredRef.current = false;
                    setSearchResults(searchParkingSpots(''));
                  }}
                  className="btn btn-primary"
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}