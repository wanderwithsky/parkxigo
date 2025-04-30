import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Menu, Moon, Sun, User, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };
  
  const handleLoginClick = (e: React.MouseEvent) => {
    if (user) {
      e.preventDefault();
      showToast('You are already logged in.', 'info');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ParkXigo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-sm font-medium hover:text-primary transition-colors">
              Find Parking
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                  My Parkings
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={handleLoginClick}
              >
                Login
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 text-muted hover:text-foreground transition-colors"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            
            {user && (
              <Link to="/profile" className="hidden md:flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </Link>
            )}

            <button
              onClick={toggleMenu}
              className="md:hidden rounded-md p-2 text-muted hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 border-t border-border">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/search" 
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Parking
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Parkings
                </Link>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-left text-sm font-medium hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={(e) => {
                  setIsMenuOpen(false);
                  handleLoginClick(e);
                }}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}