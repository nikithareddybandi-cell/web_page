import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

export const Navbar = ({ transparent = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const bgClass = transparent
    ? 'bg-[#FDFBF7]/80 backdrop-blur-xl'
    : 'bg-[#FDFBF7] border-b border-black/5';

  return (
    <nav className={`sticky top-0 z-50 ${bgClass}`} data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <h1 className="text-2xl font-bold text-[#123524] tracking-tight">
              TaxFile Pro
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-[#1A1A1A] hover:text-[#123524] transition-colors"
              data-testid="nav-home-link"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-[#1A1A1A] hover:text-[#123524] transition-colors"
              data-testid="nav-about-link"
            >
              About
            </Link>
            <Link
              to="/services"
              className="text-[#1A1A1A] hover:text-[#123524] transition-colors"
              data-testid="nav-services-link"
            >
              Services
            </Link>
            <Link
              to="/contact"
              className="text-[#1A1A1A] hover:text-[#123524] transition-colors"
              data-testid="nav-contact-link"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                  variant="outline"
                  className="border-[#123524] text-[#123524] hover:bg-[#123524] hover:text-white"
                  data-testid="dashboard-button"
                >
                  {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-[#5C5C5C] text-[#5C5C5C] hover:bg-[#5C5C5C] hover:text-white"
                  data-testid="logout-button"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="border-[#123524] text-[#123524] hover:bg-[#123524] hover:text-white"
                  data-testid="login-button"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-[#C86B53] text-white hover:bg-[#D87B63]"
                  data-testid="register-button"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};