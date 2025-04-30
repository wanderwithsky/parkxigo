import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-12 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ParkXigo</span>
            </div>
            <p className="text-muted mb-6 max-w-md">
              Finding the perfect parking spot just got easier. ParkXigo connects drivers with available parking spaces in real-time, reducing congestion and saving you time.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="text-muted hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/parkxigo._/" className="text-muted hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/search" className="text-muted hover:text-primary transition-colors">Find Parking</Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted hover:text-primary transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/login" className="text-muted hover:text-primary transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-muted hover:text-primary transition-colors">Register</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted">123 Parking Avenue, Cityville, State 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted">support@parkxigo.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center md:flex md:justify-between">
          <p className="text-sm text-muted">© {new Date().getFullYear()} ParkXigo. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex justify-center md:justify-end space-x-6">
            <Link to="/privacy" className="text-sm text-muted hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}