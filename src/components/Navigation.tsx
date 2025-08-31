import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary fill-current" />
            <span className="text-xl font-bold text-foreground">Blood Bridge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              to="/find-donor"
              className={`text-sm font-medium transition-colors ${
                isActive('/find-donor') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Find Donor
            </Link>
            <Link
              to="/eligibility"
              className={`text-sm font-medium transition-colors ${
                isActive('/eligibility') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Eligibility
            </Link>
            <Link
              to="/awareness"
              className={`text-sm font-medium transition-colors ${
                isActive('/awareness') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Learn More
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/register">
              <Button variant="outline" size="sm">
                Become a Donor
              </Button>
            </Link>
            <Link to="/find-donor">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Find Blood
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Home
              </Link>
              <Link
                to="/find-donor"
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/find-donor') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Find Donor
              </Link>
              <Link
                to="/eligibility"
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/eligibility') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Eligibility
              </Link>
              <Link
                to="/awareness"
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/awareness') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Learn More
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Become a Donor
                  </Button>
                </Link>
                <Link to="/find-donor" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                    Find Blood
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;